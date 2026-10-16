import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, 
  Phone, 
  Search, 
  Star, 
  MapPin, 
  LocateFixed, 
  User, 
  ExternalLink, 
  X, 
  Layers, 
  Sparkles, 
  Moon, 
  Sun, 
  Compass,
  Radio,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { API_URL } from '../config';

// Uzbekistan Regions & Center Coordinates
const REGIONS = [
  { id: "Farg'ona", name: "Farg'ona", lat: 40.3864, lon: 71.7843, zoom: 13, arenas: "4 ta arena" },
  { id: "Toshkent", name: "Toshkent", lat: 41.2995, lon: 69.2401, zoom: 12, arenas: "3 ta arena" },
  { id: "Andijon", name: "Andijon", lat: 40.7821, lon: 72.3442, zoom: 13, arenas: "1 ta arena" },
  { id: "Namangan", name: "Namangan", lat: 41.0058, lon: 71.6436, zoom: 13, arenas: "1 ta arena" },
  { id: "Samarqand", name: "Samarqand", lat: 39.6542, lon: 66.9597, zoom: 13, arenas: "1 ta arena" }
];

// Distance Calculation (Haversine Formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("Farg'ona");
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [routeModalStadium, setRouteModalStadium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark', 'street', 'satellite'
  const [searchQuery, setSearchQuery] = useState('');
  
  // User GPS
  const [userCoords, setUserCoords] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // 1. AUTO-DETECT GPS ON MOUNT
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("GPS mavjud emas");
      return;
    }
    setGeoLocating(true);
    setGeoStatus("Aniq joylashuvingiz topilmoqda...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLon = pos.coords.longitude;
        setUserCoords({ lat: uLat, lon: uLon });
        setGeoLocating(false);

        // Find nearest region
        let closest = REGIONS[0];
        let minDist = Infinity;
        for (const reg of REGIONS) {
          const d = calculateDistance(uLat, uLon, reg.lat, reg.lon);
          if (d < minDist) {
            minDist = d;
            closest = reg;
          }
        }
        setSelectedRegion(closest.id);
        setGeoStatus(`📍 ${closest.name} (${minDist < 2 ? "Ayni shu hududdasiz" : Math.round(minDist) + " km"})`);

        // Fly smoothly to user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([uLat, uLon], 14, { duration: 1.5 });
        }
      },
      (err) => {
        console.warn("GPS ruxsati berilmadi:", err);
        setGeoLocating(false);
        setGeoStatus("Farg'ona viloyati (Standart)");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 2. FETCH STADIUMS
  useEffect(() => {
    fetchStadiums();
  }, [selectedRegion]);

  const fetchStadiums = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/stadiums?region=${encodeURIComponent(selectedRegion)}`);
      if (res.ok) {
        let data = await res.json();
        if (userCoords) {
          data = data.map(s => ({
            ...s,
            distanceKm: calculateDistance(userCoords.lat, userCoords.lon, s.latitude, s.longitude)
          })).sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        }
        setStadiums(data);
        if (data.length > 0) {
          setSelectedStadium(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 3. INITIALIZE REAL 2D LEAFLET MAP
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const currentRegion = REGIONS.find(r => r.id === selectedRegion) || REGIONS[0];

    const map = L.map(mapContainerRef.current, {
      center: [currentRegion.lat, currentRegion.lon],
      zoom: currentRegion.zoom,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Free 100% Watermark-Free Tile Layers
    const TILE_URLS = {
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      dark: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    };

    const initialUrl = TILE_URLS[mapTheme] || TILE_URLS.dark;
    const tiles = L.tileLayer(initialUrl, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    tileLayerRef.current = tiles;
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Theme (Dark, Street, Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const TILE_URLS = {
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      dark: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    };
    tileLayerRef.current.setUrl(TILE_URLS[mapTheme] || TILE_URLS.dark);
  }, [mapTheme]);

  // Update Region FlyTo
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const reg = REGIONS.find(r => r.id === selectedRegion);
    if (reg) {
      mapInstanceRef.current.flyTo([reg.lat, reg.lon], reg.zoom, { duration: 1.2 });
    }
  }, [selectedRegion]);

  // 4. RENDER ULTRA-PREMIUM MARKERS ON 2D MAP
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Render Stadium VIP Markers
    stadiums.forEach((stadium) => {
      const isSelected = selectedStadium && selectedStadium.id === stadium.id;

      const customIcon = L.divIcon({
        className: 'custom-stadium-marker',
        html: `
          <div class="relative cursor-pointer flex flex-col items-center group -translate-x-1/2 -translate-y-full transition-transform duration-300">
            <!-- Floating Pill Tag -->
            <div class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.8)] border backdrop-blur-xl flex items-center gap-1.5 transition-all ${
              isSelected 
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black border-white scale-110 shadow-[0_0_25px_rgba(245,158,11,0.6)]' 
                : 'bg-stone-950/90 text-stone-100 border-amber-500/40 hover:border-amber-400 group-hover:text-amber-400'
            }">
              <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black animate-ping' : 'bg-amber-400'}"></span>
              <span class="max-w-[130px] truncate">${stadium.name}</span>
              ${stadium.distanceKm ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black ${isSelected ? 'bg-black/25 text-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">${stadium.distanceKm < 1 ? Math.round(stadium.distanceKm * 1000) + 'm' : stadium.distanceKm.toFixed(1) + 'km'}</span>` : ''}
            </div>

            <!-- Central Beacon Needle -->
            <div class="relative mt-1 flex flex-col items-center">
              ${isSelected ? '<span class="absolute -inset-3 rounded-full bg-amber-400/30 animate-ping"></span>' : ''}
              <div class="w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all ${
                isSelected 
                  ? 'bg-gradient-to-tr from-amber-500 to-amber-300 border-white text-black scale-120 shadow-[0_0_25px_rgba(245,158,11,0.8)]' 
                  : 'bg-stone-950 border-amber-500/80 text-amber-400 group-hover:border-amber-400 group-hover:scale-110'
              }">
                <span class="text-xs">⚽️</span>
              </div>
              <div class="w-0.5 h-3 bg-gradient-to-b from-amber-400 to-transparent"></div>
            </div>
          </div>
        `,
        iconSize: [40, 55],
        iconAnchor: [20, 55]
      });

      const marker = L.marker([stadium.latitude, stadium.longitude], { icon: customIcon })
        .on('click', () => {
          setSelectedStadium(stadium);
          mapInstanceRef.current.flyTo([stadium.latitude, stadium.longitude], 15, { duration: 0.8 });
        });

      markersLayerRef.current.addLayer(marker);
    });

    // Render User Location GPS Marker (Pulsing Apple Maps Beacon)
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full">
            <div class="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-[9px] uppercase tracking-wider shadow-lg border border-white/60 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>
              <span>Siz shu yerdasiz</span>
            </div>
            <div class="relative mt-1 flex flex-col items-center">
              <span class="absolute -inset-4 rounded-full bg-emerald-400/30 animate-ping"></span>
              <span class="absolute -inset-2 rounded-full bg-emerald-400/50 animate-pulse"></span>
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 border-2 border-white flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.8)]">
                <span class="text-xs">📍</span>
              </div>
              <div class="w-0.5 h-3 bg-gradient-to-b from-emerald-400 to-transparent"></div>
            </div>
          </div>
        `,
        iconSize: [30, 45],
        iconAnchor: [15, 45]
      });

      const uMarker = L.marker([userCoords.lat, userCoords.lon], { icon: userIcon, zIndexOffset: 1000 });
      markersLayerRef.current.addLayer(uMarker);
    }
  }, [stadiums, selectedStadium, userCoords]);

  // Direct Phone Call
  const handleCall = (phone, e) => {
    if (e) e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const filteredStadiums = stadiums.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.address && s.address.toLowerCase().includes(q));
  });

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[620px] bg-[#050505] text-stone-100 flex flex-col overflow-hidden selection:bg-amber-500 selection:text-black">
      
      {/* 1. TOP INTERACTIVE TOOLBAR (Floating Island Design) */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-stone-950/90 border-b border-stone-800/80 shadow-2xl backdrop-blur-2xl">
        
        {/* Left: Region Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mr-1 shadow-inner">
            <Compass className="w-3.5 h-3.5" />
            <span>Maydonlar</span>
          </div>

          {REGIONS.map((reg) => (
            <button
              key={reg.id}
              onClick={() => {
                setSelectedRegion(reg.id);
                setSelectedStadium(null);
              }}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedRegion === reg.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/30 scale-105'
                  : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-800/80'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>{reg.name}</span>
            </button>
          ))}
        </div>

        {/* Right: GPS Locate & 3-Way Map Switcher */}
        <div className="flex items-center gap-2 ml-auto">
          {/* User GPS button */}
          <button
            onClick={detectLocation}
            title="Mening turgan joyimni topish"
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all shadow-md ${
              userCoords
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <LocateFixed className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">
              {geoLocating ? "Topilmoqda..." : userCoords ? "GPS Ulangan" : "Turgan Joyim"}
            </span>
          </button>

          {/* 3-Way Map Layer Switcher: Dark, Street, Satellite */}
          <div className="flex items-center rounded-xl bg-stone-900/90 border border-stone-800 p-0.5 shadow-inner">
            <button
              onClick={() => setMapTheme('dark')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                mapTheme === 'dark' ? 'bg-amber-500 text-black shadow-md' : 'text-stone-400 hover:text-white'
              }`}
            >
              🌙 Qorong'u
            </button>
            <button
              onClick={() => setMapTheme('street')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                mapTheme === 'street' ? 'bg-amber-500 text-black shadow-md' : 'text-stone-400 hover:text-white'
              }`}
            >
              ☀️ Ko'cha
            </button>
            <button
              onClick={() => setMapTheme('satellite')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                mapTheme === 'satellite' ? 'bg-amber-500 text-black shadow-md' : 'text-stone-400 hover:text-white'
              }`}
            >
              🛰️ Sun'iy Yo'ldosh
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN MAP VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* LEAFLET MAP CANVAS */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full z-10 ${mapTheme === 'dark' ? 'dark-tiles' : ''}`} 
        />

        {/* Custom CSS for Watermark-Free Luxury Dark Tiles */}
        <style>{`
          .dark-tiles .leaflet-tile-pane {
            filter: invert(100%) hue-rotate(180deg) brightness(88%) contrast(92%);
          }
          .dark-tiles .leaflet-container {
            background: #080808;
          }
        `}</style>

        {/* GPS Live Status Floating Pill */}
        {geoStatus && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-stone-950/90 border border-stone-800/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-200 shadow-2xl backdrop-blur-xl">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{geoStatus}</span>
          </div>
        )}

        {/* 3. SELECTED STADIUM VIP CARD (Right-Side Floating Island) */}
        <AnimatePresence>
          {selectedStadium && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-20 sm:bottom-24 right-3 sm:right-6 z-30 w-[94vw] sm:w-[380px] bg-stone-950/95 border border-amber-500/50 rounded-3xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(245,158,11,0.2)] backdrop-blur-2xl text-white overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedStadium(null)}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Stadium Photo & Badges */}
              <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3 bg-stone-900 shadow-inner">
                <img
                  src={selectedStadium.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80"}
                  alt={selectedStadium.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

                {/* Region & Distance Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-black uppercase text-amber-400 border border-stone-700 shadow-md">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>{selectedStadium.region}</span>
                  {selectedStadium.distanceKm && (
                    <span className="text-emerald-400 font-bold">• {selectedStadium.distanceKm < 1 ? `${Math.round(selectedStadium.distanceKm * 1000)} m` : `${selectedStadium.distanceKm.toFixed(1)} km`}</span>
                  )}
                </div>

                {/* Price Display */}
                <div className="absolute bottom-2.5 left-3 text-white">
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                    {selectedStadium.price_per_hour.toLocaleString('uz-UZ')}
                  </span>
                  <span className="text-[10px] text-stone-300 font-bold uppercase ml-1.5">so'm / soat</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-2.5 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black text-amber-400 border border-amber-500/30">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{selectedStadium.rating ? selectedStadium.rating.toFixed(1) : '4.9'}</span>
                </div>
              </div>

              {/* Title & Address */}
              <h3 className="text-base font-black uppercase tracking-tight text-white line-clamp-1">
                {selectedStadium.name}
              </h3>
              
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{selectedStadium.address || `${selectedStadium.region}, ${selectedStadium.district || ''}`}</span>
              </p>

              {/* Specs Pills */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300">
                  🌱 {selectedStadium.turf_type}
                </span>
                {selectedStadium.has_lights && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Moon className="w-3 h-3" /> Yoritgichlar bor
                  </span>
                )}
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ✓ Ochiq
                </span>
              </div>

              {/* --- SENIOR GOLDEN RULE: ATIGI 2 TA KATTA TUGMA --- */}
              <div className="mt-5 pt-3.5 border-t border-stone-800/80 grid grid-cols-2 gap-3">
                
                {/* 1. YO'NALISH OLISH (Yandex / Google) */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setRouteModalStadium(selectedStadium)}
                  className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-400 text-stone-100 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Yo'nalish</span>
                </motion.button>

                {/* 2. BAND QILISH (Direct Phone Call) */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => handleCall(selectedStadium.phone_number, e)}
                  className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all"
                >
                  <Phone className="w-4 h-4 fill-black" />
                  <span>Band Qilish</span>
                </motion.button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. BOTTOM QUICK THUMBNAILS CAROUSEL */}
        <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-20 overflow-x-auto pb-1 scrollbar-none flex items-center gap-3">
          {filteredStadiums.map((s) => {
            const isSelected = selectedStadium && selectedStadium.id === s.id;
            return (
              <motion.button
                key={s.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedStadium(s);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([s.latitude, s.longitude], 15, { duration: 0.8 });
                  }
                }}
                className={`shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl backdrop-blur-2xl border transition-all text-left shadow-xl ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black border-white shadow-amber-500/40 scale-105'
                    : 'bg-stone-950/90 hover:bg-stone-900 text-white border-stone-800 hover:border-amber-400/80'
                }`}
              >
                <img
                  src={s.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=120&q=80"}
                  alt={s.name}
                  className="w-9 h-9 rounded-xl object-cover shrink-0 border border-black/20"
                />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight line-clamp-1 max-w-[150px]">
                    {s.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-black ${isSelected ? 'text-black' : 'text-amber-400'}`}>
                      {s.price_per_hour.toLocaleString('uz-UZ')} so'm
                    </span>
                    {s.distanceKm && (
                      <span className={`text-[9px] font-black ${isSelected ? 'text-black/80' : 'text-emerald-400'}`}>
                        • {s.distanceKm < 1 ? `${Math.round(s.distanceKm * 1000)}m` : `${s.distanceKm.toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>

      {/* 5. MODAL: NAVIGATION ROUTE (Yandex vs Google Maps) */}
      <AnimatePresence>
        {routeModalStadium && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-sm rounded-3xl bg-stone-950 border border-amber-500/40 p-6 shadow-2xl text-white relative"
            >
              <button
                onClick={() => setRouteModalStadium(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Marshrut & Navigatsiya</span>
              </div>

              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                {routeModalStadium.name}
              </h3>
              
              <p className="text-xs text-stone-400 mb-6 font-medium">
                {userCoords ? "📍 Turgan joyingizdan to'g'ridan-to'g'ri marshrut:" : "Qaysi xaritada yo'l ko'rsatilsin?"}
              </p>

              <div className="space-y-3">
                {/* Yandex Navigator */}
                <a
                  href={userCoords 
                    ? `https://yandex.com/maps/?rtext=${userCoords.lat},${userCoords.lon}~${routeModalStadium.latitude},${routeModalStadium.longitude}&rtt=auto`
                    : `https://yandex.com/maps/?rtext=~${routeModalStadium.latitude},${routeModalStadium.longitude}&rtt=auto`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[50px] w-full px-4 py-3 rounded-2xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-red-300 hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-between transition-colors shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span>Yandex Xarita / Navigator</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Google Maps */}
                <a
                  href={userCoords 
                    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${routeModalStadium.latitude},${routeModalStadium.longitude}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${routeModalStadium.latitude},${routeModalStadium.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[50px] w-full px-4 py-3 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/40 text-blue-300 hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-between transition-colors shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>Google Maps</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
