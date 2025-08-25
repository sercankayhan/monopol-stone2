"use client";

import { lazy, Suspense, ComponentType, useState, useRef, useEffect } from 'react';
import Loading from './Loading';
import ErrorBoundary from './ErrorBoundary';

// Lazy load components that are not immediately needed
export const LazyContactForm = lazy(() => import('./ContactForm'));
export const LazySearchBar = lazy(() => import('./SearchBar'));
export const LazyTouchGestures = lazy(() => import('./TouchGestures'));
export const LazyMobilePhoneInput = lazy(() => import('./MobilePhoneInput'));

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends object>(
  LazyComponent: ComponentType<T>,
  fallback?: React.ReactNode,
  componentName?: string
) {
  return function LazyLoadedComponent(props: T) {
    const defaultFallback = (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        padding: '20px',
      }}>
        <Loading 
          size="medium" 
          type="spinner" 
          text={`${componentName || 'Bileşen'} yükleniyor...`} 
        />
      </div>
    );

    return (
      <ErrorBoundary
        fallback={
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#666',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            background: '#f9f9f9',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              Bileşen Yüklenemedi
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {componentName || 'Bu bileşen'} yüklenirken bir hata oluştu.
            </div>
          </div>
        }
      >
        <Suspense fallback={fallback || defaultFallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Pre-configured lazy components
export const ContactFormLazy = withLazyLoading(
  LazyContactForm, 
  undefined, 
  'İletişim Formu'
);

export const SearchBarLazy = withLazyLoading(
  LazySearchBar,
  <div style={{
    width: '100%',
    height: '50px',
    background: '#f0f0f0',
    borderRadius: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '0.9rem',
  }}>
    Arama yükleniyor...
  </div>,
  'Arama'
);

export const TouchGesturesLazy = withLazyLoading(
  LazyTouchGestures,
  undefined,
  'Dokunma Hareketleri'
);

export const MobilePhoneInputLazy = withLazyLoading(
  LazyMobilePhoneInput,
  <div style={{
    width: '100%',
    height: '60px',
    background: '#f0f0f0',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '14px',
    color: '#999',
    fontSize: '0.9rem',
  }}>
    Telefon alanı yükleniyor...
  </div>,
  'Telefon Girişi'
);

// Route-based code splitting utilities
export const createLazyPage = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  const LazyPage = lazy(importFunc);
  
  return function LazyPageWrapper(props: any) {
    return (
      <ErrorBoundary>
        <Suspense
          fallback={
            <div style={{
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 20px',
            }}>
              <Loading 
                size="large" 
                type="pulse" 
                text="Sayfa yükleniyor..." 
              />
              <div style={{
                marginTop: '20px',
                fontSize: '0.9rem',
                color: '#666',
                textAlign: 'center',
              }}>
                Bu işlem birkaç saniye sürebilir...
              </div>
            </div>
          }
        >
          <LazyPage {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
};

// Intersection Observer based lazy loading
export function useIntersectionLazyLoad(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, hasLoaded]);

  return { elementRef, isVisible, hasLoaded };
}

// Component for intersection-based lazy loading
interface IntersectionLazyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  height?: string;
  className?: string;
}

export function IntersectionLazy({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  height = 'auto',
  className = '',
}: IntersectionLazyProps) {
  const { elementRef, isVisible } = useIntersectionLazyLoad(threshold, rootMargin);

  const defaultFallback = (
    <div style={{
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      borderRadius: '8px',
    }}>
      <Loading size="small" type="dots" />
    </div>
  );

  return (
    <div ref={elementRef} className={className} style={{ minHeight: height }}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  );
}

// Progressive image loading
interface ProgressiveImageProps {
  src: string;
  placeholder?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

export function ProgressiveImage({
  src,
  placeholder = '/images/product-placeholder.svg',
  alt,
  className = '',
  style = {},
  onLoad,
}: ProgressiveImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const { elementRef, isVisible } = useIntersectionLazyLoad();

  useEffect(() => {
    if (!isVisible) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      console.error('Failed to load image:', src);
    };
    img.src = src;
  }, [isVisible, src, onLoad]);

  return (
    <div ref={elementRef} className={className} style={{ position: 'relative', ...style }}>
      <img
        src={imageSrc}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.3s ease',
          opacity: isLoaded ? 1 : 0.7,
          filter: isLoaded ? 'none' : 'blur(2px)',
        }}
      />
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          <Loading size="small" type="spinner" />
        </div>
      )}
    </div>
  );
}

export default {
  ContactFormLazy,
  SearchBarLazy,
  TouchGesturesLazy,
  MobilePhoneInputLazy,
  createLazyPage,
  withLazyLoading,
  IntersectionLazy,
  ProgressiveImage,
  useIntersectionLazyLoad,
};