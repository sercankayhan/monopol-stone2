"use client";

import { useState, useRef, useEffect, CSSProperties } from 'react';
import { ImageSkeleton } from './Loading';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  lazy?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  className = '',
  style = {},
  priority = false,
  placeholder = 'skeleton',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.jpg',
  lazy = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isIntersecting) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isIntersecting]);

  // Image loading handlers
  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
    
    // Performance monitoring
    if (typeof window !== 'undefined') {
      const img = imgRef.current;
      if (img) {
        const loadTime = performance.now();
        console.log(`Image loaded: ${src} in ${loadTime.toFixed(2)}ms`);
        
        // Send metrics to monitoring service
        // trackImagePerformance(src, loadTime);
      }
    }
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
    
    // Try fallback image
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    
    // Log error for monitoring
    console.error(`Failed to load image: ${src}`);
  };

  // Preload image when it should be loaded
  useEffect(() => {
    if (!isIntersecting) return;

    const img = new Image();
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = currentSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isIntersecting, currentSrc]);

  const imageStyle: CSSProperties = {
    width,
    height,
    objectFit: 'cover',
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 1 : 0,
    ...style,
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width,
    height,
    overflow: 'hidden',
  };

  const placeholderStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: isLoaded ? 'none' : 'block',
  };

  // Generate blur placeholder if not provided
  const getBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL;
    
    // Simple 1x1 transparent pixel as fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjRjBGMEYwIi8+Cjwvc3ZnPgo=';
  };

  const renderPlaceholder = () => {
    if (placeholder === 'none') return null;
    
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={getBlurPlaceholder()}
          alt=""
          style={{
            ...placeholderStyle,
            filter: 'blur(8px)',
            transform: 'scale(1.1)',
          }}
        />
      );
    }
    
    if (placeholder === 'skeleton') {
      return (
        <div style={placeholderStyle}>
          <ImageSkeleton width="100%" height="100%" />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Placeholder */}
      {renderPlaceholder()}
      
      {/* Main Image */}
      {isIntersecting && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          style={imageStyle}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Error State */}
      {isError && currentSrc === fallbackSrc && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fa',
            color: '#6c757d',
            fontSize: '0.9rem',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
            <div>Resim yüklenemedi</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

// Hook for tracking image performance
export const useImagePerformance = () => {
  const trackImageLoad = (src: string, loadTime: number) => {
    if (typeof window === 'undefined') return;
    
    // Send to analytics/monitoring service
    console.log(`Image Performance: ${src} loaded in ${loadTime}ms`);
    
    // Example: Send to Google Analytics
    // gtag('event', 'image_load', {
    //   image_url: src,
    //   load_time: loadTime,
    // });
  };

  const trackImageError = (src: string, error: string) => {
    if (typeof window === 'undefined') return;
    
    console.error(`Image Error: ${src} - ${error}`);
    
    // Send error to monitoring service
    // Sentry.captureException(new Error(`Image load failed: ${src}`));
  };

  return { trackImageLoad, trackImageError };
};