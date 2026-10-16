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
  Share2, 
  Info, 
  X, 
  ExternalLink, 
  Layers, 
  ChevronDown, 
  Sparkles, 
  Moon, 
  CheckCircle2,
  Compass,
  ChevronRight
} from 'lucide-react';
import { API_URL } from '../config';

// City 360 Panorama backgrounds (Equirectangular high-res aerial views)
const CITY_PANORAMAS = {
  "Farg'ona": {
    name: "Farg'ona Vodiysi",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x1a2e3b
  },
  "Toshkent": {
    name: "Toshkent Shahri",
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x221a3b
  },
  "Samarqand": {
    name: "Samarqand Tarixiy Arena",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x2b201a
  },
  "Andijon": {
    name: "Andijon Maydonlari",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x1b2b20
  },
  "Namangan": {
    name: "Namangan Markazi",
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2560&q=85",
    ambientColor: 0x202a35
  }
};

const REGIONS_LIST = ["Farg'ona", "Toshkent", "Andijon", "Namangan", "Samarqand"];

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("Farg'ona");
  const [loading, setLoading] = useState(true);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [routeModalStadium, setRouteModalStadium] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [viewMode, setViewMode] = useState('360'); // '360' or 'grid'
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  // 3D Canvas and Pin Screen Coordinates
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const threeState = useRef({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    lon: 90,
    lat: 0,
    phi: 0,
    theta: 0,
    isUserInteracting: false,
    onPointerDownPointerX: 0,
    onPointerDownPointerY: 0,
    onPointerDownLon: 0,
    onPointerDownLat: 0,
    targetLon: 90,
    targetLat: 0,
    fov: 70
  });

  const [pinPositions, setPinPositions] = useState([]);

  // Fetch Stadiums from API
  useEffect(() => {
    fetchStadiums();
  }, [selectedRegion]);

  const fetchStadiums = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/stadiums?region=${encodeURIComponent(selectedRegion)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStadiums(data);
      }
    } catch (err) {
      console.error("Stadionlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Three.js 360 Panorama
  useEffect(() => {
    if (viewMode !== '360' || !canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(threeState.current.fov, width / height, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 3. 360 Equirectangular Inverted Sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Initial placeholder canvas texture before image loads
    const placeholderCanvas = document.createElement('canvas');
    placeholderCanvas.width = 1024;
    placeholderCanvas.height = 512;
    const pctx = placeholderCanvas.getContext('2d');
    const grad = pctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#020b14');
    grad.addColorStop(0.4, '#1b3a4b');
    grad.addColorStop(0.55, '#d4a373');
    grad.addColorStop(0.65, '#2e382b');
    grad.addColorStop(1, '#080d08');
    pctx.fillStyle = grad;
    pctx.fillRect(0, 0, 1024, 512);

    const initialTexture = new THREE.CanvasTexture(placeholderCanvas);
    const material = new THREE.MeshBasicMaterial({ map: initialTexture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Load City Panorama Texture
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
      (err) => console.log("Using procedural panorama fallback", err)
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

      // Auto rotation if enabled and not interacting
      if (isAutoRotate && !st.isUserInteracting) {
        st.targetLon += 0.05;
      }

      // Smooth damping interpolation
      st.lon += (st.targetLon - st.lon) * 0.1;
      st.lat += (st.targetLat - st.lat) * 0.1;
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
          // Spread pins nicely across the panoramic horizon (theta, phi)
          const stadiumTheta = THREE.MathUtils.degToRad((index * 45 + 30) % 360);
          const stadiumPhi = THREE.MathUtils.degToRad(95 + (index % 3) * 5);

          const pos = new THREE.Vector3();
          pos.setFromSphericalCoords(480, stadiumPhi, stadiumTheta);

          // Project to 2D screen
          const proj = pos.clone().project(st.camera);

          // Check if hotspot is in front of camera
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
  }, [viewMode, selectedRegion, stadiums, isAutoRotate]);

  // Pointer & Touch Controls (Drag to rotate 360)
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

    threeState.current.targetLon = (threeState.current.onPointerDownPointerX - clientX) * 0.15 + threeState.current.onPointerDownLon;
    threeState.current.targetLat = (clientY - threeState.current.onPointerDownPointerY) * 0.15 + threeState.current.onPointerDownLat;
  };

  const onPointerUp = () => {
    threeState.current.isUserInteracting = false;
  };

  // Zoom with Wheel
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

  // Fullscreen toggle
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

  // Phone Call
  const handleCall = (phone, e) => {
    if (e) e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full bg-[#050505] text-white select-none overflow-hidden ${
        isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[calc(100vh-80px)] min-h-[600px]'
      }`}
    >
      {/* 1. UZBEKISTAN 360 HEADER BAR */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 h-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-md border-b border-white/10">
        
        {/* Left: Logo & Region Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 backdrop-blur-xl shadow-lg">
            <span className="text-sm font-black text-amber-400 tracking-tighter uppercase">360°</span>
            <span className="text-xs font-black tracking-widest text-white uppercase hidden sm:inline">UZBEKISTAN</span>
          </div>

          {/* Region Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-amber-500/40 text-amber-400 hover:text-white font-black text-xs uppercase tracking-wider transition-all shadow-md min-h-[40px]"
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
        </div>

        {/* Center: Title / Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Uzbekistan360 Aerial Panorama:</span>
          <span className="text-amber-400 font-black">{CITY_PANORAMAS[selectedRegion]?.name || selectedRegion}</span>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-2">
          
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

          {/* View Mode Toggle (360 Panorama vs List) */}
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

          {/* Compass / Pan Drag Hint */}
          <div className="absolute bottom-24 sm:bottom-28 left-6 pointer-events-none z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Sichqoncha bilan 360° aylantiring</span>
          </div>

          {/* 3. FLOATING 3D HOTSPOT PINS (Uzbekistan360 style) */}
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
                {/* Floating Label */}
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-xl backdrop-blur-md border transition-all ${
                    isSelected 
                      ? 'bg-amber-500 text-black border-amber-400 scale-110' 
                      : 'bg-black/80 text-white border-white/20 group-hover:border-amber-400 group-hover:text-amber-400'
                  }`}
                >
                  <span>{pin.stadium.name}</span>
                </motion.div>

                {/* Hotspot Pin Head */}
                <div className="relative">
                  {/* Radar Pulse Rings */}
                  <span className="absolute -inset-2.5 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                  
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shadow-2xl ${
                    isSelected
                      ? 'bg-amber-500 border-white text-black scale-125 shadow-amber-500/80'
                      : 'bg-sky-500/90 border-white text-white group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110'
                  }`}>
                    <MapPin className="w-4 h-4 fill-current" />
                  </div>

                  {/* Hotspot Pin Tail Needle */}
                  <div className="w-0.5 h-3 bg-white mx-auto shadow-md" />
                </div>
              </div>
            );
          })}

          {/* 4. ACTIVE STADIUM POPUP CARD (The 2 Golden Buttons) */}
          <AnimatePresence>
            {selectedStadium && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute bottom-20 sm:bottom-28 right-4 sm:right-8 z-30 w-[92vw] sm:w-[380px] bg-stone-950/95 border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-2xl text-white"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedStadium(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Stadium Image Thumbnail */}
                <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-stone-900">
                  <img
                    src={selectedStadium.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80"}
                    alt={selectedStadium.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-black uppercase text-amber-400 border border-stone-700">
                    {selectedStadium.region}
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
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
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

          {/* 5. BOTTOM CAROUSEL / QUICK STADIUM THUMBNAILS */}
          <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-20 overflow-x-auto pb-1 scrollbar-none flex items-center gap-2.5">
            {stadiums.map((s) => {
              const isSelected = selectedStadium && selectedStadium.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStadium(s);
                    // Find pin position and smoothly orient camera towards it
                    const pin = pinPositions.find(p => p.id === s.id);
                    if (pin) {
                      threeState.current.targetLon = pin.theta;
                      threeState.current.targetLat = pin.lat;
                    }
                  }}
                  className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-amber-500 text-black border-white shadow-lg shadow-amber-500/40 scale-105'
                      : 'bg-black/70 hover:bg-black/90 text-white border-white/10 hover:border-amber-400'
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
                    <span className={`text-[10px] font-bold block ${isSelected ? 'text-black/80' : 'text-amber-400'}`}>
                      {s.price_per_hour.toLocaleString('uz-UZ')} so'm
                    </span>
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
                    <h3 className="text-base font-black uppercase text-white">{stadium.name}</h3>
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

      {/* 6. MODAL: NAVIGATION ROUTE (Yandex vs Google Maps) */}
      <AnimatePresence>
        {routeModalStadium && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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
                <span>Navigatsiya & Marshrut</span>
              </div>

              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                {routeModalStadium.name}
              </h3>
              <p className="text-xs text-stone-400 mb-6">
                Qaysi xaritada yo'l ko'rsatilsin?
              </p>

              <div className="space-y-3">
                <a
                  href={`https://yandex.com/maps/?rtext=~${routeModalStadium.latitude},${routeModalStadium.longitude}&rtt=auto`}
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

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${routeModalStadium.latitude},${routeModalStadium.longitude}`}
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
