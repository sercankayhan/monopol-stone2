"use client";

import React, { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface CustomMetrics {
  componentMountTime: number;
  apiResponseTime: number;
  imageLoadTime: number;
  userInteractionTime: number;
}

export const usePerformanceMonitoring = (componentName?: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const metricsRef = useRef<Partial<PerformanceMetrics & CustomMetrics>>({});

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    mountTimeRef.current = startTime;

    // Core Web Vitals measurement
    measureWebVitals();

    // Component-specific metrics
    if (componentName) {
      console.log(`[Performance] ${componentName} component mounted at ${startTime.toFixed(2)}ms`);
    }

    return () => {
      const endTime = performance.now();
      const componentLifetime = endTime - startTime;
      
      if (componentName) {
        console.log(`[Performance] ${componentName} component unmounted. Lifetime: ${componentLifetime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  // Measure Core Web Vitals
  const measureWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        
        metricsRef.current.largestContentfulPaint = lcp;
        console.log(`[Performance] LCP: ${lcp.toFixed(2)}ms`);
        
        // Send to analytics
        trackMetric('lcp', lcp);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          metricsRef.current.firstInputDelay = fid;
          console.log(`[Performance] FID: ${fid.toFixed(2)}ms`);
          
          trackMetric('fid', fid);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        metricsRef.current.cumulativeLayoutShift = clsValue;
        console.log(`[Performance] CLS: ${clsValue.toFixed(4)}`);
        
        trackMetric('cls', clsValue);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // Navigation Timing API
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
            
            metricsRef.current.pageLoadTime = pageLoadTime;
            
            console.log(`[Performance] Page Load Time: ${pageLoadTime.toFixed(2)}ms`);
            console.log(`[Performance] DOM Content Loaded: ${domContentLoaded.toFixed(2)}ms`);
            
            trackMetric('page_load_time', pageLoadTime);
            trackMetric('dom_content_loaded', domContentLoaded);
          }
        }, 0);
      });
    }
  }, []);

  // Track custom metrics
  const trackMetric = useCallback((name: string, value: number, unit: string = 'ms') => {
    if (typeof window === 'undefined') return;

    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        metric_unit: unit,
        component_name: componentName || 'unknown',
      });
    }

    // Send to custom analytics endpoint
    sendToAnalyticsEndpoint({
      type: 'performance',
      metric: name,
      value: value,
      unit: unit,
      component: componentName,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }, [componentName]);

  // Measure API response times
  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    apiName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      metricsRef.current.apiResponseTime = responseTime;
      console.log(`[Performance] API ${apiName}: ${responseTime.toFixed(2)}ms`);
      
      trackMetric(`api_${apiName}`, responseTime);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      console.error(`[Performance] API ${apiName} failed after ${responseTime.toFixed(2)}ms:`, error);
      
      trackMetric(`api_${apiName}_error`, responseTime);
      
      throw error;
    }
  }, [trackMetric]);

  // Measure user interactions
  const measureUserInteraction = useCallback((interactionName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      metricsRef.current.userInteractionTime = interactionTime;
      console.log(`[Performance] User interaction ${interactionName}: ${interactionTime.toFixed(2)}ms`);
      
      trackMetric(`interaction_${interactionName}`, interactionTime);
    };
  }, [trackMetric]);

  // Resource loading performance
  const measureResourceLoad = useCallback((resourceUrl: string, type: 'image' | 'script' | 'css' | 'other' = 'other') => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes(resourceUrl)) {
          const resourceEntry = entry as PerformanceResourceTiming;
          const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;
          
          console.log(`[Performance] Resource ${type} (${resourceUrl}): ${loadTime.toFixed(2)}ms`);
          trackMetric(`resource_${type}`, loadTime);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }, [trackMetric]);

  // Get current metrics
  const getMetrics = useCallback((): Partial<PerformanceMetrics & CustomMetrics> => {
    return { ...metricsRef.current };
  }, []);

  // Memory usage monitoring
  const getMemoryUsage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const memory = (performance as any).memory;
    if (memory) {
      const memoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
      
      console.log('[Performance] Memory usage:', memoryInfo);
      return memoryInfo;
    }
    
    return null;
  }, []);

  return {
    trackMetric,
    measureApiCall,
    measureUserInteraction,
    measureResourceLoad,
    getMetrics,
    getMemoryUsage,
  };
};

// Send metrics to analytics endpoint
const sendToAnalyticsEndpoint = async (data: any) => {
  try {
    // Replace with your actual analytics endpoint
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Silently fail - don't break user experience for analytics
    console.warn('Failed to send analytics data:', error);
  }
};

// Utility function for measuring component render time
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const { trackMetric } = usePerformanceMonitoring(componentName);
    
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const renderTime = performance.now() - startTime;
        trackMetric('component_render_time', renderTime);
      };
    }, [trackMetric]);
    
    return React.createElement(Component, props);
  };
}