"use client";

// Performance Monitoring Dashboard
// Based on CLAUDE.md Part 1 - Performance tracking and optimization

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Performance metrics interfaces
interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  navigationTiming: NavigationTimingMetrics;
  memoryUsage: MemoryMetrics;
  networkInfo: NetworkMetrics;
  responsiveMetrics: ResponsiveMetrics;
}

interface NavigationTimingMetrics {
  domContentLoaded: number;
  loadComplete: number;
  ttfb: number; // Time to First Byte
  domProcessing: number;
  resourceLoading: number;
}

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryPressure: 'low' | 'medium' | 'high';
}

interface NetworkMetrics {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface ResponsiveMetrics {
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  touchDevice: boolean;
  resizeEvents: number;
  layoutShifts: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
}

// Performance thresholds (Core Web Vitals based)
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTI: { good: 3800, needsImprovement: 7300 }, // Time to Interactive
  TBT: { good: 200, needsImprovement: 600 },   // Total Blocking Time
  memoryUsage: { good: 50 * 1024 * 1024, needsImprovement: 100 * 1024 * 1024 }, // 50MB, 100MB
  resizeEvents: { good: 5, needsImprovement: 15 }, // per minute
  layoutShifts: { good: 3, needsImprovement: 10 }  // per minute
};

// Hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const observers = useRef<{
    performanceObserver?: PerformanceObserver;
    resizeObserver?: ResizeObserver;
    mutationObserver?: MutationObserver;
  }>({});
  
  const metricsHistory = useRef<PerformanceMetrics[]>([]);
  const resizeEventCount = useRef(0);
  const layoutShiftCount = useRef(0);
  const lastResizeReset = useRef(Date.now());

  const addAlert = useCallback((alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random()}`,
      timestamp: Date.now()
    };
    
    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep only last 50 alerts
  }, []);

  const getBreakpoint = useCallback((width: number): ResponsiveMetrics['breakpoint'] => {
    if (width < 576) return 'xs';
    if (width < 768) return 'sm';
    if (width < 992) return 'md';
    if (width < 1200) return 'lg';
    return 'xl';
  }, []);

  const getMemoryPressure = useCallback((used: number, total: number): MemoryMetrics['memoryPressure'] => {
    const ratio = used / total;
    if (ratio > 0.8) return 'high';
    if (ratio > 0.6) return 'medium';
    return 'low';
  }, []);

  const collectMetrics = useCallback(() => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      
      // Navigation timing
      const navigationTiming: NavigationTimingMetrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        ttfb: navigation.responseStart - navigation.navigationStart,
        domProcessing: navigation.domComplete - navigation.domLoading,
        resourceLoading: navigation.loadEventStart - navigation.domContentLoadedEventEnd
      };

      // Memory metrics
      const memoryMetrics: MemoryMetrics = {
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0,
        memoryPressure: 'low'
      };
      
      if (memoryMetrics.totalJSHeapSize > 0) {
        memoryMetrics.memoryPressure = getMemoryPressure(
          memoryMetrics.usedJSHeapSize,
          memoryMetrics.totalJSHeapSize
        );
      }

      // Network metrics
      const connection = (navigator as any).connection;
      const networkMetrics: NetworkMetrics = {
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false
      };

      // Responsive metrics
      const responsiveMetrics: ResponsiveMetrics = {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        breakpoint: getBreakpoint(window.innerWidth),
        touchDevice: 'ontouchstart' in window,
        resizeEvents: resizeEventCount.current,
        layoutShifts: layoutShiftCount.current
      };

      // Core metrics (will be updated by performance observers)
      const coreMetrics: PerformanceMetrics = {
        loadTime: navigationTiming.loadComplete,
        firstContentfulPaint: fcp?.startTime || 0,
        largestContentfulPaint: 0, // Updated by observer
        firstInputDelay: 0, // Updated by observer
        cumulativeLayoutShift: 0, // Updated by observer
        timeToInteractive: 0, // Calculated
        totalBlockingTime: 0, // Calculated
        navigationTiming,
        memoryUsage: memoryMetrics,
        networkInfo: networkMetrics,
        responsiveMetrics
      };

      return coreMetrics;
    } catch (error) {
      console.warn('Error collecting performance metrics:', error);
      return null;
    }
  }, [getBreakpoint, getMemoryPressure]);

  const checkThresholds = useCallback((metrics: PerformanceMetrics) => {
    // Check LCP
    if (metrics.largestContentfulPaint > 0) {
      if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.LCP.needsImprovement) {
        addAlert({
          type: 'error',
          message: 'Largest Contentful Paint is too slow',
          metric: 'LCP',
          value: metrics.largestContentfulPaint,
          threshold: PERFORMANCE_THRESHOLDS.LCP.needsImprovement
        });
      } else if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.LCP.good) {
        addAlert({
          type: 'warning',
          message: 'Largest Contentful Paint needs improvement',
          metric: 'LCP',
          value: metrics.largestContentfulPaint,
          threshold: PERFORMANCE_THRESHOLDS.LCP.good
        });
      }
    }

    // Check FID
    if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.FID.needsImprovement) {
      addAlert({
        type: 'error',
        message: 'First Input Delay is too high',
        metric: 'FID',
        value: metrics.firstInputDelay,
        threshold: PERFORMANCE_THRESHOLDS.FID.needsImprovement
      });
    } else if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.FID.good) {
      addAlert({
        type: 'warning',
        message: 'First Input Delay needs improvement',
        metric: 'FID',
        value: metrics.firstInputDelay,
        threshold: PERFORMANCE_THRESHOLDS.FID.good
      });
    }

    // Check CLS
    if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CLS.needsImprovement) {
      addAlert({
        type: 'error',
        message: 'Cumulative Layout Shift is too high',
        metric: 'CLS',
        value: metrics.cumulativeLayoutShift,
        threshold: PERFORMANCE_THRESHOLDS.CLS.needsImprovement
      });
    } else if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CLS.good) {
      addAlert({
        type: 'warning',
        message: 'Cumulative Layout Shift needs improvement',
        metric: 'CLS',
        value: metrics.cumulativeLayoutShift,
        threshold: PERFORMANCE_THRESHOLDS.CLS.good
      });
    }

    // Check memory usage
    if (metrics.memoryUsage.usedJSHeapSize > PERFORMANCE_THRESHOLDS.memoryUsage.needsImprovement) {
      addAlert({
        type: 'error',
        message: 'Memory usage is too high',
        metric: 'Memory',
        value: metrics.memoryUsage.usedJSHeapSize,
        threshold: PERFORMANCE_THRESHOLDS.memoryUsage.needsImprovement
      });
    } else if (metrics.memoryUsage.usedJSHeapSize > PERFORMANCE_THRESHOLDS.memoryUsage.good) {
      addAlert({
        type: 'warning',
        message: 'Memory usage is elevated',
        metric: 'Memory',
        value: metrics.memoryUsage.usedJSHeapSize,
        threshold: PERFORMANCE_THRESHOLDS.memoryUsage.good
      });
    }

    // Check responsive metrics
    if (metrics.responsiveMetrics.resizeEvents > PERFORMANCE_THRESHOLDS.resizeEvents.needsImprovement) {
      addAlert({
        type: 'warning',
        message: 'Too many resize events detected',
        metric: 'ResizeEvents',
        value: metrics.responsiveMetrics.resizeEvents,
        threshold: PERFORMANCE_THRESHOLDS.resizeEvents.good
      });
    }

    if (metrics.responsiveMetrics.layoutShifts > PERFORMANCE_THRESHOLDS.layoutShifts.needsImprovement) {
      addAlert({
        type: 'warning',
        message: 'Frequent layout shifts detected',
        metric: 'LayoutShifts',
        value: metrics.responsiveMetrics.layoutShifts,
        threshold: PERFORMANCE_THRESHOLDS.layoutShifts.good
      });
    }
  }, [addAlert]);

  const setupObservers = useCallback(() => {
    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      const perfObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          setMetrics(prev => {
            if (!prev) return prev;
            
            let updated = { ...prev };
            
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                updated.largestContentfulPaint = entry.startTime;
                break;
              case 'first-input':
                updated.firstInputDelay = (entry as any).processingStart - entry.startTime;
                break;
              case 'layout-shift':
                if (!(entry as any).hadRecentInput) {
                  updated.cumulativeLayoutShift += (entry as any).value;
                  layoutShiftCount.current++;
                }
                break;
              case 'long-animation-frame':
                updated.totalBlockingTime += Math.max(0, entry.duration - 50);
                break;
            }
            
            return updated;
          });
        });
      });

      try {
        perfObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        observers.current.performanceObserver = perfObserver;
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // Resize Observer for layout monitoring
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        resizeEventCount.current++;
        
        // Reset counter every minute
        const now = Date.now();
        if (now - lastResizeReset.current > 60000) {
          resizeEventCount.current = 0;
          layoutShiftCount.current = 0;
          lastResizeReset.current = now;
        }
      });

      resizeObserver.observe(document.body);
      observers.current.resizeObserver = resizeObserver;
    }

    // Mutation Observer for DOM changes
    if ('MutationObserver' in window) {
      const mutationObserver = new MutationObserver((mutations) => {
        let significantChanges = 0;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            significantChanges++;
          }
        });
        
        if (significantChanges > 5) {
          addAlert({
            type: 'info',
            message: 'Significant DOM changes detected',
            metric: 'DOMChanges',
            value: significantChanges,
            threshold: 5
          });
        }
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });
      
      observers.current.mutationObserver = mutationObserver;
    }
  }, [addAlert]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Initial metrics collection
    const initialMetrics = collectMetrics();
    if (initialMetrics) {
      setMetrics(initialMetrics);
      metricsHistory.current.push(initialMetrics);
    }

    // Setup observers
    setupObservers();

    // Periodic metrics collection
    const interval = setInterval(() => {
      const newMetrics = collectMetrics();
      if (newMetrics) {
        setMetrics(prev => {
          const updatedMetrics = prev ? { ...prev, ...newMetrics } : newMetrics;
          metricsHistory.current.push(updatedMetrics);
          
          // Keep only last 100 entries
          if (metricsHistory.current.length > 100) {
            metricsHistory.current.shift();
          }
          
          // Check thresholds
          checkThresholds(updatedMetrics);
          
          return updatedMetrics;
        });
      }
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
      
      // Cleanup observers
      Object.values(observers.current).forEach(observer => {
        observer?.disconnect?.();
      });
      
      observers.current = {};
    };
  }, [collectMetrics, setupObservers, checkThresholds]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    // Cleanup observers
    Object.values(observers.current).forEach(observer => {
      observer?.disconnect?.();
    });
    
    observers.current = {};
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const getMetricsHistory = useCallback(() => {
    return [...metricsHistory.current];
  }, []);

  const getPerformanceScore = useCallback((metrics: PerformanceMetrics) => {
    let score = 100;
    let checks = 0;

    // LCP score (25%)
    if (metrics.largestContentfulPaint > 0) {
      checks++;
      if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.LCP.needsImprovement) {
        score -= 25;
      } else if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.LCP.good) {
        score -= 12.5;
      }
    }

    // FID score (25%)
    if (metrics.firstInputDelay > 0) {
      checks++;
      if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.FID.needsImprovement) {
        score -= 25;
      } else if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.FID.good) {
        score -= 12.5;
      }
    }

    // CLS score (25%)
    checks++;
    if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CLS.needsImprovement) {
      score -= 25;
    } else if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CLS.good) {
      score -= 12.5;
    }

    // FCP score (25%)
    if (metrics.firstContentfulPaint > 0) {
      checks++;
      if (metrics.firstContentfulPaint > PERFORMANCE_THRESHOLDS.FCP.needsImprovement) {
        score -= 25;
      } else if (metrics.firstContentfulPaint > PERFORMANCE_THRESHOLDS.FCP.good) {
        score -= 12.5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }, []);

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    getMetricsHistory,
    getPerformanceScore: metrics ? getPerformanceScore(metrics) : 0
  };
}

// Performance Monitor Dashboard Component
interface PerformanceMonitorProps {
  className?: string;
  autoStart?: boolean;
  showAlerts?: boolean;
  showHistory?: boolean;
  compact?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className = '',
  autoStart = false,
  showAlerts = true,
  showHistory = false,
  compact = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    getMetricsHistory,
    getPerformanceScore
  } = usePerformanceMonitor();

  useEffect(() => {
    if (autoStart) {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [autoStart, startMonitoring]);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertIcon = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return 'ℹ️';
    }
  };

  if (!isVisible && (process.env.NODE_ENV === 'production')) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all"
        title="Open Performance Monitor"
      >
        📊
      </button>
    );
  }

  return (
    <div className={`performance-monitor ${compact ? 'compact' : ''} ${className}`}>
      {/* Monitor Controls */}
      <div className="monitor-header">
        <div className="monitor-title">
          <span>📊 Performance Monitor</span>
          {metrics && (
            <span className={`performance-score ${getScoreColor(getPerformanceScore)}`}>
              Score: {Math.round(getPerformanceScore)}
            </span>
          )}
        </div>
        
        <div className="monitor-controls">
          {isMonitoring ? (
            <button onClick={stopMonitoring} className="monitor-button stop">
              Stop
            </button>
          ) : (
            <button onClick={startMonitoring} className="monitor-button start">
              Start
            </button>
          )}
          
          {process.env.NODE_ENV !== 'production' && (
            <button onClick={() => setIsVisible(false)} className="monitor-button close">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Core Metrics */}
      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Load Time</div>
            <div className="metric-value">{formatTime(metrics.loadTime)}</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">FCP</div>
            <div className="metric-value">{formatTime(metrics.firstContentfulPaint)}</div>
          </div>
          
          {metrics.largestContentfulPaint > 0 && (
            <div className="metric-card">
              <div className="metric-label">LCP</div>
              <div className="metric-value">{formatTime(metrics.largestContentfulPaint)}</div>
            </div>
          )}
          
          <div className="metric-card">
            <div className="metric-label">CLS</div>
            <div className="metric-value">{metrics.cumulativeLayoutShift.toFixed(3)}</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Memory</div>
            <div className="metric-value">{formatBytes(metrics.memoryUsage.usedJSHeapSize)}</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Viewport</div>
            <div className="metric-value">
              {metrics.responsiveMetrics.viewportWidth}×{metrics.responsiveMetrics.viewportHeight}
            </div>
            <div className="metric-sub">
              {metrics.responsiveMetrics.breakpoint.toUpperCase()} • 
              {metrics.responsiveMetrics.orientation}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="alerts-section">
          <div className="alerts-header">
            <span>Recent Alerts ({alerts.length})</span>
            <button onClick={clearAlerts} className="clear-alerts">
              Clear
            </button>
          </div>
          
          <div className="alerts-list">
            {alerts.slice(0, compact ? 3 : 10).map((alert) => (
              <div key={alert.id} className={`alert alert-${alert.type}`}>
                <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-details">
                    {alert.metric}: {
                      alert.metric === 'Memory' 
                        ? formatBytes(alert.value)
                        : alert.metric.includes('Time') || alert.metric === 'LCP' || alert.metric === 'FCP'
                        ? formatTime(alert.value)
                        : alert.value.toFixed(2)
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;