import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Pause, ChevronLeft, Award, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAKE_REELS = [
  { id: 1, videoUrl: 'https://cdn.pixabay.com/vimeo/328224345/football-22684.mp4?width=1080&hash=8f8101a91e5e670415302302e260bcba7f9b8c0d', player: 'Umidjon Erkinov', avatar: '/images/players/players_1614632537190-23e414.jpg', club: 'Buxoro U-16', likes: '12.4K', comments: 342, description: "Ajoyib jarima zarbasi! OVR 88 ga bejizga berilmagan 🚀🔥 #football #freekick #talents", ovr: 88, ratingType: 'gold' },
  { id: 2, videoUrl: 'https://cdn.pixabay.com/vimeo/347454848/soccer-25004.mp4?width=1080&hash=365a6f238b69324d852a4e21a3674681f08f8dd6', player: 'Azizbek Karimov', avatar: '/images/players/players_1506794778202-cad84c.jpg', club: 'Pakhtakor U-19', likes: '8.1K', comments: 120, description: "Mashg'ulotdagi tezlik va aniqlik. Hujumchi pozitsiyasiga moslashuv ⚽️💪", ovr: 84, ratingType: 'silver' },
  { id: 3, videoUrl: 'https://cdn.pixabay.com/vimeo/154448557/football-2157.mp4?width=1080&hash=a6d45dd6d3f23bb1d33190dfebccfa15cff67b5e', player: 'Jasur Hasanov', avatar: '/images/players/players_1534438327276-14e530.jpg', club: 'Dinamo', likes: '4.5K', comments: 85, description: "Haqiqiy jangchi maydonda! To'pni olib qo'yish bo'yicha mahorat darsi 🛡️", ovr: 79, ratingType: 'bronze' }
];

const ReelItem = ({ reel, isActive }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] snap-start bg-black flex justify-center items-center overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={false}
        onClick={togglePlay}
      />
      
      {/* Dark Overlay for Text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none"></div>
      
      {/* Play/Pause Icon Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/80">
            <Play className="w-8 h-8 ml-1" fill="currentColor"/>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 pt-10 pb-4 bg-gradient-to-b from-black/80 to-transparent">
        <Link to="/" className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
          <ChevronLeft className="w-6 h-6"/>
        </Link>
        <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
          Iqtidorlar Videosi
        </div>
        <div className="w-10"></div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 w-full p-4 pb-20 z-20 pointer-events-none">
        
        {/* Profile Info */}
        <div className="flex items-center gap-3 mb-3 pointer-events-auto cursor-pointer">
          <div className="relative">
            <img src={reel.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-amber-500 object-cover shadow-lg" />
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black border border-black shadow-md
              ${reel.ratingType === 'gold' ? 'bg-amber-400 text-stone-950' : reel.ratingType === 'silver' ? 'bg-stone-300 text-stone-900' : 'bg-amber-700 text-white'}
            `}>
              {reel.ovr}
            </div>
          </div>
          <div>
            <h3 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-1">
              {reel.player} <Shield className="w-4 h-4 text-blue-400" fill="currentColor" />
            </h3>
            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">{reel.club}</span>
          </div>
          <button className="ml-4 px-4 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-xs font-bold uppercase border border-white/20 transition-colors">
            Kuzatish
          </button>
        </div>

        {/* Description */}
        <p className="text-white/90 text-sm w-3/4 mb-4 drop-shadow-md">
          {reel.description}
        </p>

        {/* Music Tag */}
        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full w-max border border-white/10 shadow-lg">
          <svg className="w-3 h-3 text-white animate-spin" style={{animationDuration: '3s'}} fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <span className="text-xs text-white uppercase tracking-widest font-bold">FootballRise Original Sound</span>
        </div>
      </div>

      {/* Right Sidebar (Actions) */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20 pointer-events-auto">
        <button className="flex flex-col items-center group" onClick={() => setIsLiked(!isLiked)}>
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg group-hover:bg-black/60 transition-all">
            <Heart className="w-6 h-6 transition-colors" fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "white"} />
          </div>
          <span className="text-white text-[10px] font-bold mt-1 drop-shadow-md">{isLiked ? parseInt(reel.likes)+1+'K' : reel.likes}</span>
        </button>

        <button className="flex flex-col items-center group">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg group-hover:bg-black/60 transition-all">
            <MessageCircle className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-white text-[10px] font-bold mt-1 drop-shadow-md">{reel.comments}</span>
        </button>

        <button className="flex flex-col items-center group">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg group-hover:bg-black/60 transition-all">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-[10px] font-bold mt-1 drop-shadow-md">Ulashish</span>
        </button>

        <button className="flex flex-col items-center group mt-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/50 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]">
             <img src={reel.avatar} className="w-full h-full object-cover" alt="Sound Track" />
          </div>
        </button>
      </div>

    </div>
  );
};

export default function ReelsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
        setActiveIndex(index);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-[100dvh] bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide text-stone-200"
    >
      {FAKE_REELS.map((reel, index) => (
        <ReelItem key={reel.id} reel={reel} isActive={index === activeIndex} />
      ))}
    </div>
  );
}
