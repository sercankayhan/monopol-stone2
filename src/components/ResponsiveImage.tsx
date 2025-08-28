"use client";

// Responsive Image Component with Progressive Enhancement
// Based on CLAUDE.md Part 1 - Safe responsive image implementation

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  // Progressive enhancement props
  enableWebP?: boolean;
  enableAVIF?: boolean;
  enableLazyLoading?: boolean;
  enableAspectRatio?: boolean;
  enableProgressiveLoading?: boolean;
  fallbackSrc?: string;
  breakpoints?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality = 75,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
  enableWebP = true,
  enableAVIF = true,
  enableLazyLoading = true,
  enableAspectRatio = true,
  enableProgressiveLoading = true,
  fallbackSrc,
  breakpoints
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(!enableLazyLoading || priority);
  const [imageFormat, setImageFormat] = useState<'avif' | 'webp' | 'original'>('original');
  const imageRef = useRef<HTMLImageElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  // Feature detection
  useEffect(() => {
    detectOptimalImageFormat();
  }, [enableAVIF, enableWebP]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || priority || isInView) return;

    if ('IntersectionObserver' in window) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              intersectionObserverRef.current?.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before the image comes into view
          threshold: 0.1
        }
      );

      if (imageRef.current) {
        intersectionObserverRef.current.observe(imageRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
    }

    return () => {
      intersectionObserverRef.current?.disconnect();
    };
  }, [enableLazyLoading, priority, isInView]);

  const detectOptimalImageFormat = useCallback(async () => {
    if (enableAVIF && await checkImageSupport('avif')) {
      setImageFormat('avif');
    } else if (enableWebP && await checkImageSupport('webp')) {
      setImageFormat('webp');
    } else {
      setImageFormat('original');
    }
  }, [enableAVIF, enableWebP]);

  const getOptimizedSrc = useCallback(() => {
    if (imageFormat === 'original') return currentSrc;
    
    // Convert image path to optimized format
    const pathParts = currentSrc.split('.');
    const extension = pathParts.pop();
    const basePath = pathParts.join('.');
    
    if (imageFormat === 'avif') {
      return `${basePath}.avif`;
    } else if (imageFormat === 'webp') {
      return `${basePath}.webp`;
    }
    
    return currentSrc;
  }, [currentSrc, imageFormat]);

  const getResponsiveSizes = useCallback(() => {
    if (sizes) return sizes;
    
    if (breakpoints) {
      const sizeArray = [];
      if (breakpoints.xs) sizeArray.push(`(max-width: 320px) ${breakpoints.xs}`);
      if (breakpoints.sm) sizeArray.push(`(max-width: 375px) ${breakpoints.sm}`);
      if (breakpoints.md) sizeArray.push(`(max-width: 768px) ${breakpoints.md}`);
      if (breakpoints.lg) sizeArray.push(`(max-width: 1024px) ${breakpoints.lg}`);
      if (breakpoints.xl) sizeArray.push(`(max-width: 1200px) ${breakpoints.xl}`);
      sizeArray.push('100vw');
      return sizeArray.join(', ');
    }
    
    // Default responsive sizes
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }, [sizes, breakpoints]);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setHasError(true);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageFormat('original');
    } else {
      onError?.();
    }
  }, [fallbackSrc, currentSrc, onError]);

  // Generate aspect ratio classes
  const aspectRatioClass = enableAspectRatio && width && height 
    ? `aspect-ratio-${Math.round((width / height) * 100)}`
    : '';

  // Progressive loading class
  const progressiveClass = enableProgressiveLoading 
    ? `progressive-image ${isLoaded ? 'loaded' : 'loading'}`
    : '';

  // Container classes
  const containerClasses = [
    'responsive-image-container',
    aspectRatioClass,
    progressiveClass,
    className
  ].filter(Boolean).join(' ');

  // If not in view and lazy loading is enabled, render placeholder
  if (!isInView) {
    return (
      <div 
        ref={imageRef}
        className={containerClasses}
        style={{
          width: width || '100%',
          height: height || 'auto',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(enableAspectRatio && width && height && {
            aspectRatio: `${width} / ${height}`
          })
        }}
      >
        <div className="image-placeholder">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError && !fallbackSrc) {
    return (
      <div className={`${containerClasses} error-state`}>
        <div className="error-placeholder">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="m12 17 .01 0"/>
          </svg>
          <span>Image failed to load</span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Progressive loading background */}
      {enableProgressiveLoading && !isLoaded && (
        <div className="progressive-backdrop">
          {blurDataURL && (
            <Image
              src={blurDataURL}
              alt=""
              fill
              className="blur-placeholder"
              style={{ filter: 'blur(10px)' }}
              priority
            />
          )}
        </div>
      )}

      {/* Main image */}
      <Image
        src={getOptimizedSrc()}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`responsive-image ${isLoaded ? 'loaded' : 'loading'}`}
        sizes={getResponsiveSizes()}
        quality={quality}
        priority={priority}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          objectFit: 'cover',
          transition: enableProgressiveLoading ? 'opacity 0.3s ease-in-out' : 'none',
          opacity: isLoaded ? 1 : 0,
        }}
      />

      {/* Loading indicator */}
      {enableProgressiveLoading && !isLoaded && !hasError && (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      )}

      {/* Image format indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="format-indicator">
          {imageFormat.toUpperCase()}
        </div>
      )}
    </div>
  );
}

// Utility function to check image format support
async function checkImageSupport(format: 'webp' | 'avif'): Promise<boolean> {
  return new Promise((resolve) => {
    const testImages = {
      webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    };

    const img = new Image();
    img.onload = () => resolve(img.width === 2 && img.height === 2);
    img.onerror = () => resolve(false);
    img.src = testImages[format];
  });
}

// Enhanced responsive image styles
export const ResponsiveImageStyles = `
  .responsive-image-container {
    position: relative;
    overflow: hidden;
    background-color: #f8f9fa;
    border-radius: 8px;
  }

  .responsive-image {
    width: 100%;
    height: auto;
    display: block;
  }

  .progressive-image {
    background-color: #f0f0f0;
  }

  .progressive-image.loading {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  .progressive-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }

  .blur-placeholder {
    opacity: 0.6;
  }

  .loading-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #fd7e14;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .image-placeholder,
  .error-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 14px;
    padding: 20px;
  }

  .error-state {
    background-color: #fee;
    border: 1px solid #fcc;
  }

  .format-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    font-size: 10px;
    border-radius: 3px;
    z-index: 3;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Aspect ratio utilities */
  .aspect-ratio-100 { aspect-ratio: 1; }
  .aspect-ratio-133 { aspect-ratio: 4/3; }
  .aspect-ratio-177 { aspect-ratio: 16/9; }
  .aspect-ratio-75 { aspect-ratio: 3/4; }
  .aspect-ratio-56 { aspect-ratio: 9/16; }

  /* Responsive behavior */
  @media (max-width: 768px) {
    .responsive-image-container {
      border-radius: 4px;
    }
    
    .loading-indicator .spinner {
      width: 20px;
      height: 20px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .progressive-image.loading {
      animation: none;
      background: #f0f0f0;
    }
    
    .spinner {
      animation: none;
    }
    
    .responsive-image {
      transition: none;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .responsive-image-container {
      border: 1px solid currentColor;
    }
    
    .image-placeholder,
    .error-placeholder {
      color: currentColor;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .progressive-image {
      background-color: #2a2a2a;
    }
    
    .progressive-image.loading {
      background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    }
  }
`;

// Hook for responsive image utilities
export function useResponsiveImage() {
  const [webpSupport, setWebpSupport] = useState(false);
  const [avifSupport, setAvifSupport] = useState(false);

  useEffect(() => {
    checkImageSupport('webp').then(setWebpSupport);
    checkImageSupport('avif').then(setAvifSupport);
  }, []);

  return {
    webpSupport,
    avifSupport,
    getOptimalFormat: (originalSrc: string) => {
      if (avifSupport) return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif');
      if (webpSupport) return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return originalSrc;
    }
  };
}