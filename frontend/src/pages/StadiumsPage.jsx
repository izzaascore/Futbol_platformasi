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
  ChevronRight,
  Target
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

// Uzbekistan Regions & Center Coordinates
const REGIONS = [
  { id: "ALL", name: "Barchasi", lat: 41.2995, lon: 69.2401, zoom: 11, arenas: "Barcha arenalar" },
  { id: "Toshkent", name: "Toshkent", lat: 41.2995, lon: 69.2401, zoom: 12, arenas: "3 ta arena" },
  { id: "Farg'ona", name: "Farg'ona", lat: 40.3864, lon: 71.7843, zoom: 13, arenas: "4 ta arena" },
  { id: "Andijon", name: "Andijon", lat: 40.7821, lon: 72.3442, zoom: 13, arenas: "1 ta arena" },
  { id: "Namangan", name: "Namangan", lat: 41.0058, lon: 71.6436, zoom: 13, arenas: "1 ta arena" },
  { id: "Samarqand", name: "Samarqand", lat: 39.6542, lon: 66.9597, zoom: 13, arenas: "1 ta arena" }
];

// Distance Calculation (Haversine Formula in KM)
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
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [routeModalStadium, setRouteModalStadium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark', 'street', 'satellite'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Device GPS & Location
  const [userCoords, setUserCoords] = useState(null);
  const [accuracyRadius, setAccuracyRadius] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState("Qurilma joylashuvi aniqlanmoqda...");
  const [locationSource, setLocationSource] = useState(''); // 'gps' | 'ip'

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const manualRegionClickRef = useRef(false);
  const watchIdRef = useRef(null);

  // 1. AUTO-DETECT DEVICE LOCATION ON MOUNT
  useEffect(() => {
    detectDeviceLocation(true);

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // IP-based Geolocation Fallback (for Desktop PCs without GPS chip)
  const fetchIPLocationFallback = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lon = parseFloat(data.longitude);
          const city = data.city || data.region || "Toshkent";
          
          setUserCoords({ lat, lon });
          setAccuracyRadius(500);
          setLocationSource('ip');
          setGeoStatus(`📍 Qurilma joyi: ${city} (Tarmoq orqali aniqlandi)`);
          
          if (mapInstanceRef.current && !manualRegionClickRef.current) {
            mapInstanceRef.current.flyTo([lat, lon], 14, { duration: 1.5 });
          }
          return true;
        }
      }
    } catch (e) {
      console.warn("IP geolocation fallback failed:", e);
    }
    return false;
  };

  const detectDeviceLocation = (isInitial = false) => {
    setGeoLocating(true);
    setGeoStatus("Aniq qurilma GPS koordinatalari olinmoqda...");

    if (!navigator.geolocation) {
      fetchIPLocationFallback().finally(() => setGeoLocating(false));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLon = pos.coords.longitude;
        const acc = pos.coords.accuracy || 50;

        setUserCoords({ lat: uLat, lon: uLon });
        setAccuracyRadius(acc);
        setLocationSource('gps');
        setGeoLocating(false);
        setGeoStatus(`📍 Qurilma aniq joyi topildi (Aniqlik: ±${Math.round(acc)}m)`);

        // Fly directly to real device location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([uLat, uLon], 15, { duration: 1.5 });
        }

        // Start live watch if supported
        if (!watchIdRef.current && navigator.geolocation.watchPosition) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (livePos) => {
              const liveLat = livePos.coords.latitude;
              const liveLon = livePos.coords.longitude;
              const liveAcc = livePos.coords.accuracy || 50;
              setUserCoords({ lat: liveLat, lon: liveLon });
              setAccuracyRadius(liveAcc);
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
          );
        }
      },
      async (err) => {
        console.warn("Browser GPS unavailable or denied, falling back to IP:", err);
        const fallbackSuccess = await fetchIPLocationFallback();
        setGeoLocating(false);
        if (!fallbackSuccess) {
          setGeoStatus("Joylashuv aniqlanmadi (Brauzerda ruxsat bering)");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Center strictly on user device
  const handleCenterOnUser = () => {
    manualRegionClickRef.current = false;
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lon], 16, { duration: 1.2 });
      setGeoStatus("📍 Qurilmangiz markazlashtirildi");
    } else {
      detectDeviceLocation();
    }
  };

  // 2. FETCH STADIUMS
  useEffect(() => {
    fetchStadiums();
  }, [selectedRegion]);

  const fetchStadiums = async () => {
    setLoading(true);
    try {
      const regionParam = selectedRegion === "ALL" ? "barchasi" : selectedRegion;
      const res = await fetch(`${API_URL}/api/stadiums?region=${encodeURIComponent(regionParam)}`);
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

  // Recalculate stadium distances when user coordinates become available
  useEffect(() => {
    if (userCoords && stadiums.length > 0) {
      setStadiums(prev => prev.map(s => ({
        ...s,
        distanceKm: calculateDistance(userCoords.lat, userCoords.lon, s.latitude, s.longitude)
      })).sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999)));
    }
  }, [userCoords]);

  // 3. INITIALIZE REAL 2D LEAFLET MAP
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initial center: if userCoords already known, use them, otherwise default
    const initialCenter = userCoords ? [userCoords.lat, userCoords.lon] : [41.2995, 69.2401];
    const initialZoom = userCoords ? 14 : 11;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Google Maps Tile Layers
    const TILE_URLS = {
      street: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      satellite: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      dark: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
    };

    const initialUrl = TILE_URLS[mapTheme] || TILE_URLS.dark;
    const tiles = L.tileLayer(initialUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
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
      street: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      satellite: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      dark: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
    };
    tileLayerRef.current.setUrl(TILE_URLS[mapTheme] || TILE_URLS.dark);
  }, [mapTheme]);

  // Update Region FlyTo (ONLY IF USER MANUALLY CLICKED A REGION)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (!manualRegionClickRef.current) return; // Do not hijack user device location

    const reg = REGIONS.find(r => r.id === selectedRegion);
    if (reg) {
      mapInstanceRef.current.flyTo([reg.lat, reg.lon], reg.zoom, { duration: 1.2 });
    }
  }, [selectedRegion]);

  // 4. RENDER HIGH-PRECISION VIP MARKERS & USER LOCATION ON 2D MAP
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
                ? 'bg-white text-black font-heading font-black border-white scale-110 shadow-glow' 
                : 'bg-[#030303]/95 text-white border-white/25 hover:border-white group-hover:text-white backdrop-blur-md'
            }">
              <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black animate-ping' : 'bg-white'}"></span>
              <span class="max-w-[130px] truncate">${stadium.name}</span>
              ${stadium.distanceKm ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black ${isSelected ? 'bg-black/25 text-black' : 'bg-white/10 text-white border border-white/20'}">${stadium.distanceKm < 1 ? Math.round(stadium.distanceKm * 1000) + 'm' : stadium.distanceKm.toFixed(1) + 'km'}</span>` : ''}
            </div>

            <!-- Central Beacon Needle -->
            <div class="relative mt-1 flex flex-col items-center">
              ${isSelected ? '<span class="absolute -inset-3 rounded-full bg-white/40 animate-ping"></span>' : ''}
              <div class="w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all ${
                isSelected 
                  ? 'bg-white border-white text-black scale-120 shadow-glow' 
                  : 'bg-[#030303] border-white/30 text-white group-hover:border-white group-hover:scale-110'
              }">
                <span class="text-xs">⚽️</span>
              </div>
              <div class="w-0.5 h-3 bg-gradient-to-b from-white to-transparent"></div>
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

    // Render User Device Exact Location Marker & Accuracy Circle
    if (userCoords) {
      // 1. Accuracy Circle
      if (accuracyRadius && accuracyRadius > 20) {
        const circle = L.circle([userCoords.lat, userCoords.lon], {
          radius: Math.min(accuracyRadius, 800),
          color: '#ffffff',
          weight: 1,
          opacity: 0.4,
          fillColor: '#ffffff',
          fillOpacity: 0.08
        });
        markersLayerRef.current.addLayer(circle);
      }

      // 2. High-Precision Device Pulsing Pin
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full">
            <div class="px-2.5 py-1 rounded-full bg-white text-black font-heading font-black text-[9px] uppercase tracking-wider shadow-glow border border-white flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>
              <span>Siz shu yerdasiz</span>
            </div>
            <div class="relative mt-1 flex flex-col items-center">
              <span class="absolute -inset-4 rounded-full bg-white/30 animate-ping"></span>
              <span class="absolute -inset-2 rounded-full bg-white/50 animate-pulse"></span>
              <div class="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center text-black shadow-glow">
                <span class="text-xs font-black">📍</span>
              </div>
              <div class="w-0.5 h-3 bg-gradient-to-b from-white to-transparent"></div>
            </div>
          </div>
        `,
        iconSize: [36, 50],
        iconAnchor: [18, 50]
      });

      const uMarker = L.marker([userCoords.lat, userCoords.lon], { 
        icon: userIcon, 
        zIndexOffset: 1000 
      }).on('click', () => {
        handleCenterOnUser();
      });

      markersLayerRef.current.addLayer(uMarker);
    }
  }, [stadiums, selectedStadium, userCoords, accuracyRadius]);

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
    <PageTransition>
      <div className="relative w-full h-[calc(100vh-80px)] min-h-[620px] bg-[#030303] text-stone-100 flex flex-col overflow-hidden selection:bg-white selection:text-black">
        
        {/* 1. TOP INTERACTIVE TOOLBAR (Floating Dark Luxury Island) */}
        <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#030303]/90 border-b border-white/10 shadow-2xl backdrop-blur-2xl">
          
          {/* Left: Region Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-heading font-black shadow-sm text-xs uppercase tracking-wider mr-1 shadow-inner">
              <Compass className="w-3.5 h-3.5" />
              <span>Maydonlar</span>
            </div>

            {REGIONS.map((reg) => (
              <button
                key={reg.id}
                onClick={() => {
                  manualRegionClickRef.current = true;
                  setSelectedRegion(reg.id);
                  setSelectedStadium(null);
                }}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                  selectedRegion === reg.id
                    ? 'bg-white text-black font-black shadow-glow scale-105 border border-white'
                    : 'bg-white/[0.04] hover:bg-white/10 text-stone-300 border border-white/10'
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
              onClick={handleCenterOnUser}
              title="Mening aniq qurilma koordinatamga borish"
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider border flex items-center gap-2 transition-all duration-300 shadow-md ${
                userCoords
                  ? 'bg-white text-black border-white shadow-glow'
                  : 'bg-white/5 border-white/20 text-stone-300 hover:bg-white/10'
              }`}
            >
              <Target className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
              <span>
                {geoLocating ? "Aniqlanmoqda..." : userCoords ? "Aniq Joyim" : "Joyimni Topish"}
              </span>
            </button>

            {/* 3-Way Map Layer Switcher: Dark, Street, Satellite */}
            <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 p-0.5 shadow-inner">
              <button
                onClick={() => setMapTheme('dark')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-heading font-bold uppercase tracking-wider transition-all duration-300 ${
                  mapTheme === 'dark' ? 'bg-white text-black font-black shadow-glow' : 'text-stone-400 hover:text-white'
                }`}
              >
                🌙 Qorong'u
              </button>
              <button
                onClick={() => setMapTheme('street')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-heading font-bold uppercase tracking-wider transition-all duration-300 ${
                  mapTheme === 'street' ? 'bg-white text-black font-black shadow-glow' : 'text-stone-400 hover:text-white'
                }`}
              >
                ☀️ Ko'cha
              </button>
              <button
                onClick={() => setMapTheme('satellite')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-heading font-bold uppercase tracking-wider transition-all duration-300 ${
                  mapTheme === 'satellite' ? 'bg-white text-black font-black shadow-glow' : 'text-stone-400 hover:text-white'
                }`}
              >
                🛰️ Yo'ldosh
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
            <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-[#030303]/90 border border-white/15 px-4 py-2 rounded-full text-xs font-bold text-stone-200 shadow-2xl backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>{geoStatus}</span>
            </div>
          )}

          {/* Dedicated "Center Device Location" Floating Button on Canvas */}
          <div className="absolute top-4 right-14 z-20">
            <button
              onClick={handleCenterOnUser}
              className="px-4 py-2 bg-black/80 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white rounded-xl shadow-glow backdrop-blur-md font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Aniq Joyim</span>
            </button>
          </div>

          {/* 3. SELECTED STADIUM VIP CARD (Right-Side Floating Island) */}
          <AnimatePresence>
            {selectedStadium && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute bottom-20 sm:bottom-24 right-3 sm:right-6 z-30 w-[94vw] sm:w-[380px] bg-[#030303]/95 border border-white/20 rounded-3xl p-4 sm:p-5 shadow-card backdrop-blur-2xl text-white overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedStadium(null)}
                  className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Stadium Photo & Badges */}
                <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3 bg-white/[0.04] shadow-inner">
                  <img
                    src={selectedStadium.image_url || "/images/stadiums/stadiums_1522778119026-d647f0.jpg"}
                    alt={selectedStadium.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

                  {/* Region & Distance Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-black uppercase text-stone-300 border border-white/20 shadow-md">
                    <MapPin className="w-3 h-3 text-white" />
                    <span>{selectedStadium.region}</span>
                    {selectedStadium.distanceKm && (
                      <span className="text-white font-bold">• {selectedStadium.distanceKm < 1 ? `${Math.round(selectedStadium.distanceKm * 1000)} m` : `${selectedStadium.distanceKm.toFixed(1)} km`}</span>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="absolute bottom-2.5 left-3 text-white">
                    <span className="text-2xl font-heading font-black text-white">
                      {selectedStadium.price_per_hour.toLocaleString('uz-UZ')}
                    </span>
                    <span className="text-[10px] text-stone-300 font-bold uppercase ml-1.5">so'm / soat</span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-2.5 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black text-white border border-white/20">
                    <Star className="w-3 h-3 fill-white text-white" />
                    <span>{selectedStadium.rating ? selectedStadium.rating.toFixed(1) : '4.9'}</span>
                  </div>
                </div>

                {/* Title & Address */}
                <h3 className="text-base font-black uppercase tracking-tight text-white line-clamp-1">
                  {selectedStadium.name}
                </h3>
                
                <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{selectedStadium.address || `${selectedStadium.region}, ${selectedStadium.district || ''}`}</span>
                </p>

                {/* Specs Pills */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-stone-300">
                    🌱 {selectedStadium.turf_type}
                  </span>
                  {selectedStadium.has_lights && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-stone-200 border border-white/20 flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Yoritgichlar bor
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-lg bg-white/5 text-stone-200 border border-white/15">
                    ✓ Ochiq
                  </span>
                </div>

                {/* 2 TA KATTA TUGMA: Yo'nalish va Band Qilish */}
                <div className="mt-5 pt-3.5 border-t border-white/10 grid grid-cols-2 gap-3">
                  
                  {/* 1. YO'NALISH OLISH (Yandex / Google) */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setRouteModalStadium(selectedStadium)}
                    className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/20 text-white text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-white" />
                    <span>Yo'nalish</span>
                  </motion.button>

                  {/* 2. BAND QILISH (Direct Phone Call) */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => handleCall(selectedStadium.phone_number, e)}
                    className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-white hover:bg-stone-200 text-black text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow transition-all"
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
                      ? 'bg-white text-black font-heading font-black border-white shadow-glow scale-105'
                      : 'bg-[#030303]/90 hover:bg-white/[0.06] text-white border-white/15 hover:border-white/40'
                  }`}
                >
                  <img
                    src={s.image_url || "/images/stadiums/stadiums_1522778119026-d647f0.jpg"}
                    alt={s.name}
                    className="w-9 h-9 rounded-xl object-cover shrink-0 border border-black/20"
                  />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight line-clamp-1 max-w-[150px]">
                      {s.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-black ${isSelected ? 'text-black' : 'text-stone-300'}`}>
                        {s.price_per_hour.toLocaleString('uz-UZ')} so'm
                      </span>
                      {s.distanceKm && (
                        <span className={`text-[9px] font-black ${isSelected ? 'text-black/80' : 'text-stone-300'}`}>
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
                className="w-full max-w-sm rounded-2xl bg-[#080808] border border-white/20 p-6 shadow-2xl text-white relative"
              >
                <button
                  onClick={() => setRouteModalStadium(null)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-2 text-white text-xs font-heading font-black uppercase tracking-wider">
                  <Navigation className="w-4 h-4 text-white" />
                  <span>Marshrut & Navigatsiya</span>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                  {routeModalStadium.name}
                </h3>
                
                <p className="text-xs text-stone-400 mb-6 font-medium">
                  {userCoords ? "📍 Sizning joyingizdan to'g'ridan-to'g'ri marshrut:" : "Qaysi xaritada yo'l ko'rsatilsin?"}
                </p>

                <div className="space-y-3">
                  {/* Yandex Navigator */}
                  <a
                    href={userCoords 
                      ? `https://yandex.com/maps/?rtext=${userCoords.lat},${userCoords.lon}~${routeModalStadium.latitude},${routeModalStadium.longitude}&rtt=auto`
                      : `https://yandex.com/maps/?rtext=~${routeModalStadium.latitude},${routeModalStadium.longitude}&rtt=auto`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[50px] w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-stone-200 hover:text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors shadow-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      <span>Yandex Xarita / Navigator</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>

                  {/* Google Maps */}
                  <a
                    href={userCoords 
                      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${routeModalStadium.latitude},${routeModalStadium.longitude}`
                      : `https://www.google.com/maps/dir/?api=1&destination=${routeModalStadium.latitude},${routeModalStadium.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[50px] w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-stone-200 hover:text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors shadow-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      <span>Google Maps</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
