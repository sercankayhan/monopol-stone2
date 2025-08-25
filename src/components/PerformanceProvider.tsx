"use client";

import { useEffect } from 'react';
import { setupGlobalErrorHandling } from '@/hooks/useErrorHandling';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export default function PerformanceProvider({ children }: PerformanceProviderProps) {
  const { trackMetric } = usePerformanceMonitoring('App');

  useEffect(() => {
    // Setup global error handling
    setupGlobalErrorHandling();

    // Track initial app load
    const loadStartTime = performance.now();
    
    // Track when React hydration completes
    const observer = new MutationObserver(() => {
      const loadEndTime = performance.now();
      const hydrationTime = loadEndTime - loadStartTime;
      
      trackMetric('react_hydration_time', hydrationTime);
      observer.disconnect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Track network connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        trackMetric('network_downlink', connection.downlink, 'mbps');
        trackMetric('network_rtt', connection.rtt, 'ms');
        
        console.log(`[Performance] Network: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps, RTT: ${connection.rtt}ms`);
      }
    }

    // Track device memory
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory;
      trackMetric('device_memory', deviceMemory, 'gb');
      console.log(`[Performance] Device Memory: ${deviceMemory}GB`);
    }

    // Track CPU cores
    if ('hardwareConcurrency' in navigator) {
      const cpuCores = navigator.hardwareConcurrency;
      trackMetric('cpu_cores', cpuCores, 'count');
      console.log(`[Performance] CPU Cores: ${cpuCores}`);
    }

    // Setup intersection observer for viewport tracking
    const viewportObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.id || entry.target.className || 'unknown';
            trackMetric('element_viewed', 1, 'count');
            console.log(`[Performance] Element viewed: ${elementId}`);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Track elements with data-track-view attribute
    document.querySelectorAll('[data-track-view]').forEach((element) => {
      viewportObserver.observe(element);
    });

    return () => {
      observer.disconnect();
      viewportObserver.disconnect();
    };
  }, [trackMetric]);

  return <>{children}</>;
}