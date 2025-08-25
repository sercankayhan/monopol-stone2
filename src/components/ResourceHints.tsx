"use client";

import { useEffect } from 'react';

// Critical resources that should be preloaded
const PRELOAD_RESOURCES = [
  { href: '/logo.jpeg', as: 'image', type: 'image/jpeg', crossorigin: undefined },
  { href: '/siyahlogo.png', as: 'image', type: 'image/png', crossorigin: undefined },
  { href: '/tr.svg', as: 'image', type: 'image/svg+xml', crossorigin: undefined },
  { href: '/gb.svg', as: 'image', type: 'image/svg+xml', crossorigin: undefined },
];

// Important resources to prefetch
const PREFETCH_RESOURCES = [
  '/header/urun1-optimized.jpg',
  '/header/urun2-optimized.jpg', 
  '/header/urun3-optimized.jpg',
  '/images/product-placeholder.svg',
];

// DNS prefetch for external domains
const DNS_PREFETCH_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// Preconnect to important external domains
const PRECONNECT_DOMAINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

interface ResourceHintsProps {
  enablePreload?: boolean;
  enablePrefetch?: boolean;
  enableDnsPrefetch?: boolean;
  enablePreconnect?: boolean;
  customPreloads?: Array<{
    href: string;
    as: string;
    type?: string;
    crossorigin?: string;
  }>;
  customPrefetches?: string[];
}

export default function ResourceHints({
  enablePreload = true,
  enablePrefetch = true,
  enableDnsPrefetch = true,
  enablePreconnect = true,
  customPreloads = [],
  customPrefetches = [],
}: ResourceHintsProps) {
  
  useEffect(() => {
    const head = document.head;
    const addedElements: HTMLElement[] = [];

    // Helper function to create and add link element
    const addLink = (rel: string, href: string, additional: Record<string, string> = {}) => {
      // Check if already exists
      const existing = head.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      
      Object.entries(additional).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });

      head.appendChild(link);
      addedElements.push(link);
    };

    try {
      // DNS Prefetch
      if (enableDnsPrefetch) {
        DNS_PREFETCH_DOMAINS.forEach(domain => {
          addLink('dns-prefetch', `//${domain}`);
        });
      }

      // Preconnect
      if (enablePreconnect) {
        PRECONNECT_DOMAINS.forEach(domain => {
          addLink('preconnect', domain, { crossorigin: 'anonymous' });
        });
      }

      // Preload critical resources
      if (enablePreload) {
        [...PRELOAD_RESOURCES, ...customPreloads].forEach(resource => {
          const additional: Record<string, string> = { as: resource.as };
          if (resource.type) additional.type = resource.type;
          if (resource.crossorigin) additional.crossorigin = resource.crossorigin;
          
          addLink('preload', resource.href, additional);
        });
      }

      // Prefetch less critical resources
      if (enablePrefetch) {
        [...PREFETCH_RESOURCES, ...customPrefetches].forEach(href => {
          addLink('prefetch', href);
        });
      }

      console.log(`[ResourceHints] Added ${addedElements.length} resource hints`);

    } catch (error) {
      console.error('[ResourceHints] Error adding resource hints:', error);
    }

    // Cleanup function
    return () => {
      addedElements.forEach(element => {
        try {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          console.warn('[ResourceHints] Error removing resource hint:', error);
        }
      });
    };
  }, [
    enablePreload,
    enablePrefetch, 
    enableDnsPrefetch,
    enablePreconnect,
    customPreloads,
    customPrefetches
  ]);

  return null; // This component doesn't render anything
}

// Hook for dynamic resource hints
export function useResourceHints() {
  const preloadResource = (href: string, as: string, type?: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    
    document.head.appendChild(link);
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  };

  const prefetchResource = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    document.head.appendChild(link);
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  };

  const preloadModule = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;
    
    document.head.appendChild(link);
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  };

  return {
    preloadResource,
    prefetchResource,
    preloadModule,
  };
}

// Component for critical CSS inlining
interface CriticalCSSProps {
  css: string;
}

export function CriticalCSS({ css }: CriticalCSSProps) {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [css]);

  return null;
}

// Critical CSS for above-the-fold content
export const CRITICAL_CSS = `
  /* Critical CSS for immediate rendering */
  .header {
    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .hero-slider {
    min-height: 400px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton 1.5s ease-in-out infinite;
  }
  
  @keyframes skeleton {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  .product-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 576px) {
    .product-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 992px) {
    .product-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
`;

// Performance monitoring for resource loading
export function useResourcePerformance() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Log slow resources
          if (resourceEntry.duration > 1000) {
            console.warn(`[Performance] Slow resource: ${resourceEntry.name} (${resourceEntry.duration.toFixed(2)}ms)`);
          }
          
          // Track resource sizes
          if (resourceEntry.transferSize > 100000) { // > 100KB
            console.warn(`[Performance] Large resource: ${resourceEntry.name} (${(resourceEntry.transferSize / 1024).toFixed(2)}KB)`);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('[Performance] PerformanceObserver not supported');
    }

    return () => {
      observer.disconnect();
    };
  }, []);
}