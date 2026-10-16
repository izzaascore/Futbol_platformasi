import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  Navigation, 
  Phone, 
  Search, 
  Star, 
  MapPin, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Eye, 
  EyeOff, 
  Layers, 
  ChevronDown, 
  Sparkles, 
  Moon, 
  Compass, 
  LocateFixed, 
  User, 
  ExternalLink, 
  X,
  Radio
} from 'lucide-react';
import { API_URL } from '../config';

// Real Urban Aerial City Panoramas (Sun, Blue Sky, Cityscape, Buildings like Uzbekistan360)
const CITY_PANORAMAS = {
  "Farg'ona": {
    name: "Farg'ona Vodiysi (Markaziy Havo Panoramasi)",
    // High-res aerial city panorama with open blue sky, streets, and urban skyline
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x223344
  },
  "Toshkent": {
    name: "Toshkent Shahri (Poytaxt Panoramasi)",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x1a2b3c
  },
  "Samarqand": {
    name: "Samarqand Tarixiy & Zamonaviy Arena",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x2e2318
  },
  "Andijon": {
    name: "Andijon Shahri & Bobur Maydonlari",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x1f2e24
  },
  "Namangan": {
    name: "Namangan Markazi & Gullar Shahri",
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x252a35
  }
};

const REGION_CENTERS = {
  "Farg'ona": { lat: 40.3864, lon: 71.7843 },
  "Andijon": { lat: 40.7821, lon: 72.3442 },
  "Namangan": { lat: 41.0058, lon: 71.6436 },
  "Toshkent": { lat: 41.2995, lon: 69.2401 },
  "Samarqand": { lat: 39.6542, lon: 66.9597 }
};

const REGIONS_LIST = ["Farg'ona", "Toshkent", "Andijon", "Namangan", "Samarqand"];

// Distance Calculation Helper (Haversine Formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
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
  const [loading, setLoading] = useState(true);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [routeModalStadium, setRouteModalStadium] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false); // Default to off so user can explore naturally
  const [showPins, setShowPins] = useState(true);
  const [viewMode, setViewMode] = useState('360');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  // User Geolocation States
  const [userCoords, setUserCoords] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState('');

  // 3D Canvas Ref & Animation State
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const threeState = useRef({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    lon: 180,
    lat: 10,
    phi: 0,
    theta: 0,
    isUserInteracting: false,
    onPointerDownPointerX: 0,
    onPointerDownPointerY: 0,
    onPointerDownLon: 180,
    onPointerDownLat: 10,
    targetLon: 180,
    targetLat: 10,
    fov: 70
  });

  const [pinPositions, setPinPositions] = useState([]);
  const [userPinPosition, setUserPinPosition] = useState(null);

  // 1. AUTO-DETECT USER GPS LOCATION ON MOUNT
  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage("GPS qo'llab-quvvatlanmaydi");
      return;
    }
    setGeoLocating(true);
    setGeoMessage("Joylashuvingiz aniqlanmoqda...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLon = pos.coords.longitude;
        setUserCoords({ lat: uLat, lon: uLon });
        setGeoLocating(false);

        // Find closest region in Uzbekistan
        let closestRegion = "Farg'ona";
        let minDistance = Infinity;

        for (const [reg, center] of Object.entries(REGION_CENTERS)) {
          const dist = getDistanceFromLatLonInKm(uLat, uLon, center.lat, center.lon);
          if (dist < minDistance) {
            minDistance = dist;
            closestRegion = reg;
          }
        }

        setSelectedRegion(closestRegion);
        setGeoMessage(`📍 Joylashuvingiz: ${closestRegion} hududi (${minDistance < 2 ? 'Siz ayni shu yerdasiz' : Math.round(minDistance) + ' km'})`);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setGeoLocating(false);
        setGeoMessage("Farg'ona viloyati (Standart)");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 2. FETCH STADIUMS FOR SELECTED REGION
  useEffect(() => {
    fetchStadiums();
  }, [selectedRegion]);

  const fetchStadiums = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/stadiums?region=${encodeURIComponent(selectedRegion)}`;
      const res = await fetch(url);
      if (res.ok) {
        let data = await res.json();

        // Calculate distance to each stadium if userCoords exist and sort by closest
        if (userCoords) {
          data = data.map(s => ({
            ...s,
            distanceKm: getDistanceFromLatLonInKm(userCoords.lat, userCoords.lon, s.latitude, s.longitude)
          })).sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        }

        setStadiums(data);
        if (data.length > 0 && !selectedStadium) {
          setSelectedStadium(data[0]);
        }
      }
    } catch (err) {
      console.error("Stadionlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. INITIALIZE THREE.JS 360 PANORAMA
  useEffect(() => {
    if (viewMode !== '360' || !canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(threeState.current.fov, width / height, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 360 Inverted Sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Sunny Blue Sky Canvas Background while image loads
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const sctx = skyCanvas.getContext('2d');
    const skyGrad = sctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, '#104f7a'); // Deep sky blue
    skyGrad.addColorStop(0.35, '#38a3d1'); // Bright blue
    skyGrad.addColorStop(0.5, '#e0f2fe'); // Sun horizon
    skyGrad.addColorStop(0.55, '#c5ab80'); // City line
    skyGrad.addColorStop(0.7, '#344935'); // Green parks
    skyGrad.addColorStop(1, '#1b201a');
    sctx.fillStyle = skyGrad;
    sctx.fillRect(0, 0, 1024, 512);

    // Sun disc
    sctx.fillStyle = '#ffffff';
    sctx.beginPath();
    sctx.arc(512, 180, 24, 0, Math.PI * 2);
    sctx.fill();

    const initialTexture = new THREE.CanvasTexture(skyCanvas);
    const material = new THREE.MeshBasicMaterial({ map: initialTexture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Load High-Res Urban Panorama Texture
    const textureLoader = new THREE.TextureLoader();
    const currentCity = CITY_PANORAMAS[selectedRegion] || CITY_PANORAMAS["Farg'ona"];
    textureLoader.load(
      currentCity.image,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        mesh.material.map = texture;
        mesh.material.needsUpdate = true;
      },
      undefined,
      (err) => console.log("Using procedural sky", err)
    );

    threeState.current = {
      ...threeState.current,
      scene,
      camera,
      renderer,
      mesh
    };

    let animationFrameId;

    // Render loop
    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const st = threeState.current;
      if (!st.camera || !st.scene) return;

      // Auto rotation if enabled
      if (isAutoRotate && !st.isUserInteracting) {
        st.targetLon += 0.04;
      }

      // Smooth damping interpolation
      st.lon += (st.targetLon - st.lon) * 0.12;
      st.lat += (st.targetLat - st.lat) * 0.12;
      st.lat = Math.max(-85, Math.min(85, st.lat));

      st.phi = THREE.MathUtils.degToRad(90 - st.lat);
      st.theta = THREE.MathUtils.degToRad(st.lon);

      const targetX = 500 * Math.sin(st.phi) * Math.cos(st.theta);
      const targetY = 500 * Math.cos(st.phi);
      const targetZ = 500 * Math.sin(st.phi) * Math.sin(st.theta);

      st.camera.lookAt(targetX, targetY, targetZ);
      st.renderer.render(st.scene, st.camera);

      // Project 3D Stadium Hotspots to Screen Coordinates
      if (containerRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const cHeight = containerRef.current.clientHeight;

        const calculatedPins = stadiums.map((stadium, index) => {
          // Spread pins naturally across the urban horizon
          const stadiumTheta = THREE.MathUtils.degToRad((index * 55 + 40) % 360);
          const stadiumPhi = THREE.MathUtils.degToRad(88 + (index % 3) * 6);

          const pos = new THREE.Vector3();
          pos.setFromSphericalCoords(480, stadiumPhi, stadiumTheta);

          const proj = pos.clone().project(st.camera);
          const isVisible = proj.z < 1;
          const screenX = (proj.x * 0.5 + 0.5) * cWidth;
          const screenY = (-(proj.y * 0.5) + 0.5) * cHeight;

          return {
            id: stadium.id,
            stadium,
            x: screenX,
            y: screenY,
            isVisible,
            theta: THREE.MathUtils.radToDeg(stadiumTheta),
            lat: 90 - THREE.MathUtils.radToDeg(stadiumPhi)
          };
        });

        setPinPositions(calculatedPins);

        // Project User's Own Location Pin ("Siz turgan joy")
        if (userCoords) {
          const userTheta = THREE.MathUtils.degToRad(180);
          const userPhi = THREE.MathUtils.degToRad(110);
          const uPos = new THREE.Vector3();
          uPos.setFromSphericalCoords(480, userPhi, userTheta);
          const uProj = uPos.clone().project(st.camera);
          if (uProj.z < 1) {
            setUserPinPosition({
              x: (uProj.x * 0.5 + 0.5) * cWidth,
              y: (-(uProj.y * 0.5) + 0.5) * cHeight,
              isVisible: true
            });
          } else {
            setUserPinPosition(null);
          }
        }
      }
    };

    renderLoop();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [viewMode, selectedRegion, stadiums, isAutoRotate, userCoords]);

  // 4. MOUSE & TOUCH CONTROLS (NATURAL GRAB & PAN — NO INVERSION)
  const onPointerDown = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    threeState.current.isUserInteracting = true;
    threeState.current.onPointerDownPointerX = clientX;
    threeState.current.onPointerDownPointerY = clientY;
    threeState.current.onPointerDownLon = threeState.current.targetLon;
    threeState.current.onPointerDownLat = threeState.current.targetLat;
  };

  const onPointerMove = (e) => {
    if (!threeState.current.isUserInteracting) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    // NATURAL INTUITIVE PANNING:
    // Dragging right moves view to the right; dragging up looks up!
    const deltaX = clientX - threeState.current.onPointerDownPointerX;
    const deltaY = clientY - threeState.current.onPointerDownPointerY;

    threeState.current.targetLon = threeState.current.onPointerDownLon + deltaX * 0.18;
    threeState.current.targetLat = threeState.current.onPointerDownLat + deltaY * 0.18;
  };

  const onPointerUp = () => {
    threeState.current.isUserInteracting = false;
  };

  const onWheel = (e) => {
    e.preventDefault();
    const st = threeState.current;
    if (!st.camera) return;
    st.fov = Math.max(35, Math.min(95, st.fov + e.deltaY * 0.05));
    st.camera.fov = st.fov;
    st.camera.updateProjectionMatrix();
  };

  // Fly to Pin in 360 panorama
  const handleFlyToPin = (pin) => {
    threeState.current.targetLon = pin.theta;
    threeState.current.targetLat = pin.lat;
    setSelectedStadium(pin.stadium);
  };

  // Direct Phone Call
  const handleCall = (phone, e) => {
    if (e) e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full bg-[#050505] text-white select-none overflow-hidden ${
        isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[calc(100vh-80px)] min-h-[600px]'
      }`}
    >
      {/* 1. UZBEKISTAN 360 TOP BAR */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 h-16 bg-gradient-to-b from-black/85 via-black/50 to-transparent backdrop-blur-md border-b border-white/10">
        
        {/* Left: Logo & Region Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 backdrop-blur-xl shadow-lg">
            <span className="text-sm font-black text-amber-400 tracking-tighter uppercase">360°</span>
            <span className="text-xs font-black tracking-widest text-white uppercase hidden sm:inline">UZBEKISTAN</span>
          </div>

          {/* Region Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 border border-amber-500/50 text-amber-400 hover:text-white font-black text-xs uppercase tracking-wider transition-all shadow-md min-h-[38px]"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{selectedRegion}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {regionDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-stone-950/95 border border-stone-800 backdrop-blur-2xl shadow-2xl overflow-hidden py-1 z-50">
                {REGIONS_LIST.map((reg) => (
                  <button
                    key={reg}
                    onClick={() => {
                      setSelectedRegion(reg);
                      setRegionDropdownOpen(false);
                      setSelectedStadium(null);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                      selectedRegion === reg ? 'bg-amber-500 text-black font-black' : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    <span>{reg}</span>
                    {selectedRegion === reg && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Locate Button */}
          <button
            onClick={detectUserLocation}
            title="Mening joylashuvimni aniqlash"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all ${
              userCoords 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                : 'bg-stone-900/80 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}
          >
            <LocateFixed className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span className="hidden md:inline">
              {geoLocating ? "Aniqlanmoqda..." : userCoords ? "GPS Ulangan" : "Mening Joyim"}
            </span>
          </button>
        </div>

        {/* Center: GPS Status Notice */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-300 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{geoMessage || `${selectedRegion} Maydonlari Panorama`}</span>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Toggle Pins Visibility */}
          <button
            onClick={() => setShowPins(!showPins)}
            title={showPins ? "Belgilarni yashirish" : "Belgilarni ko'rsatish"}
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
              showPins ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-black/60 border-white/10 text-stone-400'
            }`}
          >
            {showPins ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            title={isAutoRotate ? "Aylanishni to'xtatish" : "Avtomatik aylantirish"}
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
              isAutoRotate ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-black/60 border-white/10 text-stone-400'
            }`}
          >
            {isAutoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === '360' ? 'grid' : '360')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 text-xs font-bold uppercase tracking-wider text-stone-200"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{viewMode === '360' ? "Ro'yxat" : "360° Xarita"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="To'liq ekran"
            className="w-9 h-9 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-stone-300 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. THREE.JS 360 PANORAMA VIEWPORT */}
      {viewMode === '360' ? (
        <div 
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
          onWheel={onWheel}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Drag & Compass Hint */}
          <div className="absolute bottom-24 sm:bottom-28 left-4 sm:left-6 pointer-events-none z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-300 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-xl">
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Sichqoncha bilan 360° erkin aylantiring</span>
          </div>

          {/* 3. USER'S LOCATION PIN IN 360 VIEW ("Siz turgan joy") */}
          {showPins && userPinPosition && userPinPosition.isVisible && (
            <div
              style={{
                left: `${userPinPosition.x}px`,
                top: `${userPinPosition.y}px`,
                transform: 'translate(-50%, -100%)'
              }}
              className="absolute z-20 pointer-events-none flex flex-col items-center"
            >
              <div className="mb-1 px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[9px] uppercase tracking-wider shadow-lg">
                📍 Siz Shu Yerdasiz
              </div>
              <div className="relative">
                <span className="absolute -inset-3 rounded-full bg-emerald-400/40 animate-ping" />
                <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xl text-black">
                  <User className="w-4 h-4" />
                </div>
                <div className="w-0.5 h-3 bg-emerald-400 mx-auto" />
              </div>
            </div>
          )}

          {/* 4. FLOATING 3D STADIUM HOTSPOT PINS */}
          {showPins && pinPositions.map((pin) => {
            if (!pin.isVisible) return null;
            const isSelected = selectedStadium && selectedStadium.id === pin.stadium.id;

            return (
              <div
                key={pin.id}
                style={{
                  left: `${pin.x}px`,
                  top: `${pin.y}px`,
                  transform: 'translate(-50%, -100%)'
                }}
                className="absolute z-20 pointer-events-auto cursor-pointer flex flex-col items-center group"
                onClick={() => handleFlyToPin(pin)}
              >
                {/* Floating Tag */}
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xl backdrop-blur-md border transition-all ${
                    isSelected 
                      ? 'bg-amber-500 text-black border-amber-400 scale-110 shadow-amber-500/50' 
                      : 'bg-black/85 text-white border-white/20 group-hover:border-amber-400 group-hover:text-amber-400'
                  }`}
                >
                  <span>{pin.stadium.name}</span>
                  {pin.stadium.distanceKm && (
                    <span className={`ml-1.5 text-[9px] px-1 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-black/30 text-black' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {pin.stadium.distanceKm < 1 
                        ? `${Math.round(pin.stadium.distanceKm * 1000)} m` 
                        : `${pin.stadium.distanceKm.toFixed(1)} km`}
                    </span>
                  )}
                </motion.div>

                {/* Hotspot Pin Head */}
                <div className="relative">
                  <span className="absolute -inset-2.5 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                  
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shadow-2xl ${
                    isSelected
                      ? 'bg-amber-500 border-white text-black scale-125 shadow-amber-500/80'
                      : 'bg-sky-500/90 border-white text-white group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110'
                  }`}>
                    <MapPin className="w-4 h-4 fill-current" />
                  </div>

                  <div className="w-0.5 h-3 bg-white mx-auto shadow-md" />
                </div>
              </div>
            );
          })}

          {/* 5. ACTIVE STADIUM POPUP CARD (The 2 Golden Buttons) */}
          <AnimatePresence>
            {selectedStadium && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute bottom-20 sm:bottom-28 right-3 sm:right-8 z-30 w-[94vw] sm:w-[380px] bg-stone-950/95 border border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-2xl text-white"
              >
                <button
                  onClick={() => setSelectedStadium(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Image & Price */}
                <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-stone-900">
                  <img
                    src={selectedStadium.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80"}
                    alt={selectedStadium.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-black uppercase text-amber-400 border border-stone-700">
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

                {/* Title & Info */}
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

                {/* --- SENIOR GOLDEN RULE: ATIGI 2 TA ASOSIY TUGMA --- */}
                <div className="mt-4 pt-3 border-t border-stone-800 grid grid-cols-2 gap-2.5">
                  
                  {/* 1. YO'NALISH OLISH (Yandex / Google Maps) */}
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

          {/* 6. BOTTOM CAROUSEL / QUICK STADIUM THUMBNAILS */}
          <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-20 overflow-x-auto pb-1 scrollbar-none flex items-center gap-2.5">
            {stadiums.map((s) => {
              const isSelected = selectedStadium && selectedStadium.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStadium(s);
                    const pin = pinPositions.find(p => p.id === s.id);
                    if (pin) {
                      threeState.current.targetLon = pin.theta;
                      threeState.current.targetLat = pin.lat;
                    }
                  }}
                  className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-amber-500 text-black border-white shadow-lg shadow-amber-500/40 scale-105'
                      : 'bg-black/75 hover:bg-black/90 text-white border-white/15 hover:border-amber-400'
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
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-black/80' : 'text-amber-400'}`}>
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
      ) : (
        /* GRID / LIST VIEW FALLBACK */
        <div className="w-full h-full overflow-y-auto p-4 sm:p-8 pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase text-white">{selectedRegion} Maydonlari Ro'yxati</h2>
              <button 
                onClick={() => setViewMode('360')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wider"
              >
                360° Panoramaga Qaytish
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {stadiums.map((stadium) => (
                <div key={stadium.id} className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                  <img src={stadium.image_url} alt={stadium.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black uppercase text-white">{stadium.name}</h3>
                      {stadium.distanceKm && (
                        <span className="text-xs font-black text-emerald-400">
                          {stadium.distanceKm < 1 ? `${Math.round(stadium.distanceKm * 1000)} m` : `${stadium.distanceKm.toFixed(1)} km`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{stadium.address}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setRouteModalStadium(stadium)}
                        className="py-2.5 rounded-lg bg-stone-800 text-white text-xs font-bold uppercase flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-400" /> Yo'nalish
                      </button>
                      <button 
                        onClick={() => handleCall(stadium.phone_number)}
                        className="py-2.5 rounded-lg bg-amber-500 text-black text-xs font-black uppercase flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 fill-black" /> Band Qilish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: NAVIGATION ROUTE (From User GPS Location to Stadium) */}
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
                {/* Yandex Navigator (with user coordinates origin if available) */}
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

                {/* Google Maps (with origin if available) */}
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
