"use client";

// Progressive Enhancement Component
// Based on CLAUDE.md Part 1 - Advanced progressive enhancement features

import { useEffect, useState, useRef, useCallback } from 'react';

interface ProgressiveEnhancementProps {
  children?: React.ReactNode;
  enableIntersectionObserver?: boolean;
  enableResizeObserver?: boolean;
  enableTouchEnhancements?: boolean;
  enableScrollAnimations?: boolean;
}

export default function ProgressiveEnhancement({
  children,
  enableIntersectionObserver = true,
  enableResizeObserver = true,
  enableTouchEnhancements = true,
  enableScrollAnimations = true
}: ProgressiveEnhancementProps) {
  const [features, setFeatures] = useState({});
  const [isClient, setIsClient] = useState(false);
  const observersRef = useRef<any[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const detectedFeatures = detectFeatures();
    setFeatures(detectedFeatures);
    applyEnhancements(detectedFeatures);

    // Cleanup function
    return () => {
      observersRef.current.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      });
    };
  }, [isClient, enableIntersectionObserver, enableResizeObserver, enableTouchEnhancements, enableScrollAnimations]);

  const detectFeatures = useCallback(() => {
    const features = {
      // CSS Feature Detection
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      clamp: CSS.supports('width', 'clamp(1rem, 5vw, 3rem)'),
      customProperties: CSS.supports('color', 'var(--test)'),
      containerQueries: CSS.supports('container-type', 'inline-size'),
      backdropFilter: CSS.supports('backdrop-filter', 'blur(5px)'),
      aspectRatio: CSS.supports('aspect-ratio', '16/9'),
      objectFit: CSS.supports('object-fit', 'cover'),

      // JavaScript Feature Detection
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      mutationObserver: 'MutationObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,

      // Device Capabilities
      touch: 'ontouchstart' in window,
      hover: window.matchMedia('(hover: hover)').matches,
      pointerCoarse: window.matchMedia('(pointer: coarse)').matches,
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,

      // Network Information
      connection: 'connection' in navigator,
      serviceWorker: 'serviceWorker' in navigator,
      webP: checkWebPSupport(),
      avif: checkAVIFSupport(),

      // Storage
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      indexedDB: 'indexedDB' in window,

      // Performance APIs
      memory: !!(performance as any).memory,
      timing: !!(performance as any).timing,
      navigation: !!(performance as any).navigation
    };

    return features;
  }, []);

  const applyEnhancements = useCallback((features: any) => {
    // Add feature classes to document
    Object.keys(features).forEach(feature => {
      const featureKey = feature as keyof typeof features;
      if (features[featureKey]) {
        document.documentElement.classList.add(`supports-${feature}`);
      } else {
        document.documentElement.classList.add(`no-${feature}`);
      }
    });

    // Apply enhancements based on detected features
    if (features.grid) {
      enhanceGridSupport();
    }

    if (features.touch && enableTouchEnhancements) {
      enableTouchEnhancementsFeature();
    }

    if (features.intersectionObserver && enableIntersectionObserver) {
      setupScrollAnimations();
    }

    if (features.resizeObserver && enableResizeObserver) {
      setupResponsiveWatchers();
    }

    if (features.prefersDarkMode) {
      enableDarkModeSupport();
    }

    if (features.prefersReducedMotion) {
      enableReducedMotionSupport();
    }

    if (features.connection) {
      enableNetworkAwareFeatures();
    }

    console.log('🔧 Progressive enhancement applied:', features);
  }, [enableIntersectionObserver, enableResizeObserver, enableTouchEnhancements, enableScrollAnimations]);

  const enhanceGridSupport = () => {
    document.querySelectorAll('.progressive-grid').forEach(el => {
      el.classList.add('grid-supported');
    });
  };

  const enableTouchEnhancementsFeature = () => {
    // Add touch-specific styles
    const touchStyles = document.createElement('style');
    touchStyles.id = 'touch-enhancements';
    touchStyles.textContent = `
      .supports-touch .responsive-button,
      .supports-touch button,
      .supports-touch .btn {
        min-height: 44px;
        min-width: 44px;
        padding: 12px 16px;
      }
      
      .supports-touch .responsive-nav-item {
        padding: 16px 20px;
      }

      .supports-touch .touch-enhanced {
        -webkit-tap-highlight-color: rgba(253, 126, 20, 0.3);
        touch-action: manipulation;
      }

      .supports-touch .swipeable {
        touch-action: pan-x pan-y;
      }
    `;
    
    if (!document.getElementById('touch-enhancements')) {
      document.head.appendChild(touchStyles);
    }

    // Add touch classes to interactive elements
    document.querySelectorAll('button, .btn, a[role="button"]').forEach(el => {
      el.classList.add('touch-enhanced');
    });
  };

  const setupScrollAnimations = () => {
    if (!enableScrollAnimations) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          entry.target.classList.remove('animate-out');
        } else {
          entry.target.classList.add('animate-out');
          entry.target.classList.remove('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '20px'
    });

    // Observe elements that should animate
    document.querySelectorAll('.animate-on-scroll, .fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
      observer.observe(el);
    });

    observersRef.current.push(observer);

    // Add animation styles
    const animationStyles = document.createElement('style');
    animationStyles.id = 'scroll-animations';
    animationStyles.textContent = `
      .animate-on-scroll,
      .fade-in-up,
      .fade-in-left,
      .fade-in-right {
        opacity: 0;
        transition: all 0.6s ease-out;
      }

      .fade-in-up {
        transform: translateY(30px);
      }

      .fade-in-left {
        transform: translateX(-30px);
      }

      .fade-in-right {
        transform: translateX(30px);
      }

      .animate-in {
        opacity: 1 !important;
        transform: translateY(0) translateX(0) !important;
      }

      .animate-out {
        opacity: 0.3;
      }

      @media (prefers-reduced-motion: reduce) {
        .animate-on-scroll,
        .fade-in-up,
        .fade-in-left,
        .fade-in-right {
          opacity: 1;
          transform: none;
        }
      }
    `;
    
    if (!document.getElementById('scroll-animations')) {
      document.head.appendChild(animationStyles);
    }
  };

  const setupResponsiveWatchers = () => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        const element = entry.target as HTMLElement;
        
        // Apply responsive classes based on element width
        element.classList.toggle('element-small', width < 300);
        element.classList.toggle('element-medium', width >= 300 && width < 600);
        element.classList.toggle('element-large', width >= 600 && width < 900);
        element.classList.toggle('element-xlarge', width >= 900);

        // Apply aspect ratio classes
        const aspectRatio = width / height;
        element.classList.toggle('aspect-square', Math.abs(aspectRatio - 1) < 0.1);
        element.classList.toggle('aspect-landscape', aspectRatio > 1.2);
        element.classList.toggle('aspect-portrait', aspectRatio < 0.8);

        // Dispatch custom event for other components to listen to
        element.dispatchEvent(new CustomEvent('elementResize', {
          detail: { width, height, aspectRatio }
        }));
      });
    });

    // Watch containers for size changes
    document.querySelectorAll('.responsive-watched, .container-watched').forEach(el => {
      resizeObserver.observe(el);
    });

    observersRef.current.push(resizeObserver);
  };

  const enableDarkModeSupport = () => {
    document.documentElement.classList.add('dark-mode-supported');
    
    // Listen for dark mode changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    };

    darkModeQuery.addListener(handleDarkModeChange);
    
    // Apply initial state
    if (darkModeQuery.matches) {
      document.documentElement.classList.add('dark-mode');
    }
  };

  const enableReducedMotionSupport = () => {
    document.documentElement.classList.add('reduced-motion-supported');
    
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    };

    reducedMotionQuery.addListener(handleReducedMotionChange);
    
    // Apply initial state
    if (reducedMotionQuery.matches) {
      document.documentElement.classList.add('reduced-motion');
    }
  };

  const enableNetworkAwareFeatures = () => {
    const connection = (navigator as any).connection;
    if (!connection) return;

    const updateNetworkStatus = () => {
      const effectiveType = connection.effectiveType;
      const saveData = connection.saveData;

      document.documentElement.classList.toggle('slow-network', 
        effectiveType === 'slow-2g' || effectiveType === '2g');
      document.documentElement.classList.toggle('fast-network', 
        effectiveType === '4g');
      document.documentElement.classList.toggle('save-data', saveData);

      // Dispatch network status event
      window.dispatchEvent(new CustomEvent('networkStatusUpdate', {
        detail: { effectiveType, saveData, downlink: connection.downlink }
      }));
    };

    connection.addEventListener('change', updateNetworkStatus);
    updateNetworkStatus(); // Initial check
  };

  return (
    <div className="progressive-enhancement-wrapper">
      {children}
      {/* Development debugging info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '50px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '8px',
          fontSize: '11px',
          maxWidth: '200px',
          zIndex: 10000
        }}>
          <div><strong>Progressive Enhancement</strong></div>
          <div>Grid: {(features as any).grid ? '✅' : '❌'}</div>
          <div>Touch: {(features as any).touch ? '✅' : '❌'}</div>
          <div>IntersectionObserver: {(features as any).intersectionObserver ? '✅' : '❌'}</div>
          <div>ResizeObserver: {(features as any).resizeObserver ? '✅' : '❌'}</div>
        </div>
      )}
    </div>
  );
}

// Helper Functions
function checkWebPSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

function checkAVIFSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  try {
    return canvas.toDataURL('image/avif').startsWith('data:image/avif');
  } catch {
    return false;
  }
}

// Utility hook for components to use progressive enhancement
export function useProgressiveEnhancement() {
  const [features, setFeatures] = useState({});
  
  useEffect(() => {
    const detectedFeatures = {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      clamp: CSS.supports('width', 'clamp(1rem, 5vw, 3rem)'),
      touch: 'ontouchstart' in window,
      hover: window.matchMedia('(hover: hover)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
    
    setFeatures(detectedFeatures);
  }, []);
  
  return features;
}

// Animation utilities
export const createScrollAnimation = (element: HTMLElement, animation: string) => {
  element.classList.add('animate-on-scroll');
  element.setAttribute('data-animation', animation);
};

export const createHoverAnimation = (element: HTMLElement, animation: string) => {
  if (window.matchMedia('(hover: hover)').matches) {
    element.classList.add('hover-animated');
    element.setAttribute('data-hover-animation', animation);
  }
};