"use client";

import React from 'react';
import OptimizedImage from './OptimizedImage';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  width?: string | number;
  height?: string | number;
  priority?: boolean;
  lazy?: boolean;
}

export default function ProductImage({ 
  src, 
  alt, 
  className, 
  fallbackText = 'Resim yüklenemedi',
  width = '100%',
  height = 'auto',
  priority = false,
  lazy = true
}: ProductImageProps) {
  const { handleError } = useErrorHandling({
    enableLogging: true,
    onError: (error) => {
      console.error(`ProductImage error for ${src}:`, error);
    }
  });
  
  const { measureResourceLoad } = usePerformanceMonitoring('ProductImage');

  const handleImageLoad = () => {
    measureResourceLoad(src, 'image');
  };

  const handleImageError = () => {
    handleError(new Error(`Failed to load product image: ${src}`), {
      imageSource: src,
      componentType: 'ProductImage'
    });
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      lazy={lazy}
      placeholder="skeleton"
      onLoad={handleImageLoad}
      onError={handleImageError}
      fallbackSrc="/images/product-placeholder.svg"
      style={{
        borderRadius: '8px',
        objectFit: 'cover',
      }}
    />
  );
} 