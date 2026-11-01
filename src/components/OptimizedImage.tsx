import React, { useState, useEffect } from 'react';
import { normalizeGoogleDriveUrl } from '../utils/googleDrive';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'priority'> {
  fallbackSrc?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  priority = false,
  loading,
  fetchPriority,
  ...props
}) => {
  const normalize = (inputSrc?: string) => {
    if (!inputSrc || typeof inputSrc !== 'string' || !inputSrc.trim()) return fallbackSrc;
    return normalizeGoogleDriveUrl(inputSrc.trim());
  };

  const [imgSrc, setImgSrc] = useState<string>(() => normalize(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      setImgSrc(normalize(src));
      setHasError(false);
    } else {
      setImgSrc(fallbackSrc);
      setHasError(false);
    }
  }, [src, fallbackSrc]);

  return (
    <img
      src={hasError || !imgSrc ? fallbackSrc : imgSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
      loading={loading || (priority ? 'eager' : 'lazy')}
      fetchPriority={fetchPriority || (priority ? 'high' : 'auto')}
      {...props}
    />
  );
};

export default OptimizedImage;
