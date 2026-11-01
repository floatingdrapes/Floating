import React, { useState } from 'react';
import { normalizeGoogleDriveUrl } from '../utils/googleDrive';

interface CustomerAvatarProps {
  name: string;
  image?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function CustomerAvatar({
  name,
  image,
  className = '',
  size = 'md'
}: CustomerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Clean initial letter calculation
  const cleanName = (name || '').trim();
  const initial = (cleanName.charAt(0) || 'C').toUpperCase();

  // Consistent luxurious color palettes based on character
  const colorGradients = [
    'from-[#029BFA] to-[#021E3B]',     // Sapphire Deep Blue
    'from-[#D4AF37] to-[#8C7322]',     // Royal Gold
    'from-[#0E8388] to-[#2E4F4F]',     // Emerald Teal
    'from-[#8B5CF6] to-[#4C1D95]',     // Royal Purple
    'from-[#EA580C] to-[#7C2D12]',     // Amber Terracotta
    'from-[#10B981] to-[#065F46]',     // Luxury Sage
  ];
  const charCode = initial.charCodeAt(0) || 0;
  const gradientClass = colorGradients[charCode % colorGradients.length];

  const sizeClasses = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-base',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-16 w-16 text-xl'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // If valid image and not errored, render image
  if (image && image.trim() && !imgError) {
    return (
      <div 
        className={`relative rounded-full overflow-hidden shrink-0 border border-[#EAEAEA] bg-zinc-100 ${currentSizeClass} ${className}`}
      >
        <img
          src={normalizeGoogleDriveUrl(image.trim())}
          alt={cleanName}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: Elegant First Letter of Customer's Name
  return (
    <div 
      className={`relative rounded-full overflow-hidden shrink-0 border-2 border-white/80 bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-serif font-bold shadow-xs select-none tracking-wider ${currentSizeClass} ${className}`}
      title={cleanName || 'Customer'}
    >
      <span className="leading-none">{initial}</span>
    </div>
  );
}
