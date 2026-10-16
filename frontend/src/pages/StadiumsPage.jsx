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
  CheckCircle2, 
  Filter,
  Compass
} from 'lucide-react';
import { API_URL } from '../config';

// Uzbekistan Regions & Center Coordinates
const REGIONS = [
  { id: "Farg'ona", name: "Farg'ona", lat: 40.3864, lon: 71.7843, zoom: 13 },
  { id: "Toshkent", name: "Toshkent", lat: 41.2995, lon: 69.2401, zoom: 12 },
  { id: "Andijon", name: "Andijon", lat: 40.7821, lon: 72.3442, zoom: 13 },
  { id: "Namangan", name: "Namangan", lat: 41.0058, lon: 71.6436, zoom: 13 },
  { id: "Samarqand", name: "Samarqand", lat: 39.6542, lon: 66.9597, zoom: 13 }
];

// Distance Calculation (Haversine in km)
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
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' or 'light'
  const [searchQuery, setSearchQuery] = useState('');
  
  // User GPS
  const [userCoords, setUserCoords] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
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
    setGeoStatus("Joylashuv aniqlanmoqda...");

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
        setGeoStatus(`📍 ${closest.name} (${minDist < 2 ? "Ayni shu yerdasiz" : Math.round(minDist) + " km"})`);

        // Fly map to user location
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

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [currentRegion.lat, currentRegion.lon],
      zoom: currentRegion.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom Control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Tile Layer: CartoDB Dark Matter / Voyager
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(mapTheme === 'dark' ? darkTiles : lightTiles, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = tiles;
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileLayerRef.current.setUrl(mapTheme === 'dark' ? darkTiles : lightTiles);
  }, [mapTheme]);

  // Update Region Map FlyTo
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const reg = REGIONS.find(r => r.id === selectedRegion);
    if (reg) {
      mapInstanceRef.current.flyTo([reg.lat, reg.lon], reg.zoom, { duration: 1.2 });
    }
  }, [selectedRegion]);

  // 4. RENDER STADIUM MARKERS ON 2D MAP
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Render Stadium Markers
    stadiums.forEach((stadium) => {
      const isSelected = selectedStadium && selectedStadium.id === stadium.id;

      // Custom Tailwind HTML Marker
      const customIcon = L.divIcon({
        className: 'custom-stadium-marker',
        html: `
          <div class="relative cursor-pointer flex flex-col items-center group -translate-x-1/2 -translate-y-full">
            <div class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-xl border backdrop-blur-md transition-all ${
              isSelected 
                ? 'bg-amber-500 text-black border-amber-300 scale-110 shadow-amber-500/50' 
                : 'bg-stone-950/90 text-white border-stone-700 hover:border-amber-400'
            }">
              <span>${stadium.name}</span>
              ${stadium.distanceKm ? `<span class="ml-1 text-[9px] text-emerald-400">• ${stadium.distanceKm < 1 ? Math.round(stadium.distanceKm * 1000) + 'm' : stadium.distanceKm.toFixed(1) + 'km'}</span>` : ''}
            </div>
            <div class="relative mt-1">
              ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-amber-500/40 animate-ping"></span>' : ''}
              <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform ${
                isSelected 
                  ? 'bg-amber-500 border-white text-black scale-125' 
                  : 'bg-stone-900 border-amber-500/80 text-amber-400 group-hover:scale-110'
              }">
                ⚽️
              </div>
              <div class="w-0.5 h-2.5 bg-amber-500 mx-auto"></div>
            </div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 50]
      });

      const marker = L.marker([stadium.latitude, stadium.longitude], { icon: customIcon })
        .on('click', () => {
          setSelectedStadium(stadium);
          mapInstanceRef.current.flyTo([stadium.latitude, stadium.longitude], 15, { duration: 0.8 });
        });

      markersLayerRef.current.addLayer(marker);
    });

    // Render User Location GPS Marker
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full">
            <div class="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[9px] uppercase tracking-wider shadow-lg">
              Siz shu yerdasiz
            </div>
            <div class="relative mt-0.5">
              <span class="absolute -inset-3 rounded-full bg-emerald-400/40 animate-ping"></span>
              <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xl">
                📍
              </div>
            </div>
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40]
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
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[600px] bg-[#050505] text-stone-100 flex flex-col overflow-hidden">
      
      {/* 1. TOP INTERACTIVE TOOLBAR */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-stone-950/95 border-b border-stone-800 shadow-xl backdrop-blur-xl">
        
        {/* Left: Region Pills & GPS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mr-1">
            <Compass className="w-3.5 h-3.5" />
            <span>2D Xarita</span>
          </div>

          {REGIONS.map((reg) => (
            <button
              key={reg.id}
              onClick={() => {
                setSelectedRegion(reg.id);
                setSelectedStadium(null);
              }}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedRegion === reg.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>{reg.name}</span>
            </button>
          ))}
        </div>

        {/* Right: GPS Locate & Theme Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          {/* User GPS button */}
          <button
            onClick={detectLocation}
            title="Mening turgan joyimni topish"
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
              userCoords
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <LocateFixed className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">
              {geoLocating ? "Aniqlanmoqda..." : userCoords ? "GPS Ulangan" : "Turgan Joyim"}
            </span>
          </button>

          {/* Map Style Toggle (Dark vs Light Street) */}
          <button
            onClick={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
            title={mapTheme === 'dark' ? "Yorug' xaritaga o'tish" : "Qorong'u xaritaga o'tish"}
            className="min-h-[38px] w-9 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            {mapTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN MAP VIEWPORT + FLOATING CARDS */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* LEAFLET REAL MAP CONTAINER */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* GPS Status Floating Notice */}
        {geoStatus && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-stone-950/90 border border-stone-800 px-3 py-1.5 rounded-full text-xs font-bold text-stone-300 shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{geoStatus}</span>
          </div>
        )}

        {/* 3. SELECTED STADIUM FLOATING CARD (Senior Ponytail 2-Button Rule) */}
        <AnimatePresence>
          {selectedStadium && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-20 sm:bottom-24 right-3 sm:right-6 z-30 w-[94vw] sm:w-[380px] bg-stone-950/95 border border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.25)] backdrop-blur-2xl text-white"
            >
              <button
                onClick={() => setSelectedStadium(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Photo & Distance Tag */}
              <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-stone-900">
                <img
                  src={selectedStadium.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80"}
                  alt={selectedStadium.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-black uppercase text-amber-400 border border-stone-700">
                  <span>{selectedStadium.region}</span>
                  {selectedStadium.distanceKm && (
                    <span className="text-emerald-400 font-bold">• {selectedStadium.distanceKm < 1 ? `${Math.round(selectedStadium.distanceKm * 1000)} m` : `${selectedStadium.distanceKm.toFixed(1)} km`}</span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 text-white">
                  <span className="text-base font-black text-amber-400">
                    {selectedStadium.price_per_hour.toLocaleString('uz-UZ')}
                  </span>
                  <span className="text-[10px] text-stone-300 font-bold ml-1">so'm / soat</span>
                </div>
              </div>

              {/* Name & Address */}
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white line-clamp-1">
                {selectedStadium.name}
              </h3>
              
              <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{selectedStadium.address || `${selectedStadium.region}, ${selectedStadium.district || ''}`}</span>
              </p>

              <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  🌱 {selectedStadium.turf_type}
                </span>
                {selectedStadium.has_lights && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Moon className="w-3 h-3" /> Yoritgichlar bor
                  </span>
                )}
              </div>

              {/* --- SENIOR GOLDEN RULE: ATIGI 2 TA KATTA TUGMA --- */}
              <div className="mt-4 pt-3 border-t border-stone-800 grid grid-cols-2 gap-2.5">
                
                {/* 1. YO'NALISH OLISH (Yandex / Google) */}
                <button
                  onClick={() => setRouteModalStadium(selectedStadium)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Yo'nalish</span>
                </button>

                {/* 2. BAND QILISH (Direct Phone Call) */}
                <button
                  onClick={() => handleCall(selectedStadium.phone_number)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 transition-colors"
                >
                  <Phone className="w-4 h-4 fill-black" />
                  <span>Band Qilish</span>
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. BOTTOM QUICK THUMBNAILS CAROUSEL */}
        <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-20 overflow-x-auto pb-1 scrollbar-none flex items-center gap-2.5">
          {filteredStadiums.map((s) => {
            const isSelected = selectedStadium && selectedStadium.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStadium(s);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([s.latitude, s.longitude], 15, { duration: 0.8 });
                  }
                }}
                className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-amber-500 text-black border-white shadow-xl shadow-amber-500/40 scale-105'
                    : 'bg-stone-950/85 hover:bg-stone-900 text-white border-stone-800 hover:border-amber-400'
                }`}
              >
                <img
                  src={s.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=120&q=80"}
                  alt={s.name}
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight line-clamp-1 max-w-[140px]">
                    {s.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-black/90' : 'text-amber-400'}`}>
                      {s.price_per_hour.toLocaleString('uz-UZ')} so'm
                    </span>
                    {s.distanceKm && (
                      <span className={`text-[9px] font-bold ${isSelected ? 'text-black/70' : 'text-emerald-400'}`}>
                        • {s.distanceKm < 1 ? `${Math.round(s.distanceKm * 1000)}m` : `${s.distanceKm.toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* 5. MODAL: NAVIGATION ROUTE (Yandex Navigator vs Google Maps) */}
      <AnimatePresence>
        {routeModalStadium && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-white relative"
            >
              <button
                onClick={() => setRouteModalStadium(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Navigation className="w-4 h-4" />
                <span>Marshrut & Navigatsiya</span>
              </div>

              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                {routeModalStadium.name}
              </h3>
              
              <p className="text-xs text-stone-400 mb-6">
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
                  className="min-h-[48px] w-full px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
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
                  className="min-h-[48px] w-full px-4 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
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
