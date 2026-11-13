import React, { useState } from 'react';

// Telegram-style color gradients based on name hash
const TELEGRAM_GRADIENTS = [
  'from-rose-500 to-red-600',
  'from-orange-500 to-amber-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-blue-600',
  'from-blue-600 to-indigo-700',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-emerald-700'
];

export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim();
  if (!clean) return 'U';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function getNameGradient(name) {
  if (!name || typeof name !== 'string') return TELEGRAM_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  const idx = Math.abs(hash) % TELEGRAM_GRADIENTS.length;
  return TELEGRAM_GRADIENTS[idx];
}

/**
 * Telegram-Style Dynamic User Avatar.
 * If image is available and valid, renders image.
 * Otherwise, renders a Telegram-style circle with the user's initials & vibrant gradient.
 */
export default function UserAvatar({
  name = 'Foydalanuvchi',
  src = null,
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className = '',
  textClassName = '',
  rounded = 'full' // 'full' | 'xl' | '2xl'
}) {
  const [imageError, setImageError] = useState(false);

  // Check if src is valid and not a placeholder dummy image
  const isDummyPlaceholder = !src || 
    src === '/images/player.jpg' || 
    src.includes('default_player') ||
    src.includes('mixkit-');
    
  const showImage = !isDummyPlaceholder && !imageError;

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-black',
    '2xl': 'w-28 h-28 text-3xl font-black'
  };

  const roundedClasses = {
    full: 'rounded-full',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const currentRounded = roundedClasses[rounded] || 'rounded-full';
  const gradient = getNameGradient(name);
  const initials = getInitials(name);

  if (showImage) {
    return (
      <div className={`relative overflow-hidden shrink-0 border border-white/15 bg-stone-900 ${currentSizeClass} ${currentRounded} ${className}`}>
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-heading font-black text-white bg-gradient-to-br ${gradient} shadow-sm border border-white/20 select-none ${currentSizeClass} ${currentRounded} ${className}`}
      title={name}
    >
      <span className={`tracking-wider leading-none ${textClassName}`}>
        {initials}
      </span>
    </div>
  );
}
