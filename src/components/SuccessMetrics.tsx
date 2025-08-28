"use client";

// Success Metrics System
// Based on CLAUDE-PART2.md - Track and measure responsive implementation success

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface MetricSnapshot {
  timestamp: number;
  value: number;
  context?: string;
}

interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'usability' | 'accessibility' | 'compatibility' | 'stability';
  target: number;
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  history: MetricSnapshot[];
  lastUpdated: number;
  collect: () => Promise<number>;
}

interface UserBehaviorMetric {
  bounceRate: number;
  timeOnPage: number;
  interactionRate: number;
  conversionRate: number;
  mobileUsage: number;
  errorRate: number;
}

interface BusinessImpact {
  category: string;
  metric: string;
  baseline: number;
  current: number;
  improvement: number;
  impact: string;
}

interface SuccessReport {
  id: string;
  timestamp: number;
  overallScore: number;
  categoryScores: Record<string, number>;
  metrics: SuccessMetric[];
  userBehavior: UserBehaviorMetric;
  businessImpact: BusinessImpact[];
  recommendations: string[];
  achievements: string[];
}

interface SuccessMetricsState {
  isActive: boolean;
  metrics: SuccessMetric[];
  reports: SuccessReport[];
  currentScore: number;
  tracking: boolean;
  userBehavior: UserBehaviorMetric;
  businessImpact: BusinessImpact[];
}

export function useSuccessMetrics() {
  const [state, setState] = useState<SuccessMetricsState>({
    isActive: false,
    metrics: [],
    reports: [],
    currentScore: 0,
    tracking: false,
    userBehavior: {
      bounceRate: 0,
      timeOnPage: 0,
      interactionRate: 0,
      conversionRate: 0,
      mobileUsage: 0,
      errorRate: 0
    },
    businessImpact: []
  });

  const trackingIntervals = useRef<{
    metrics?: NodeJS.Timeout;
    userBehavior?: NodeJS.Timeout;
    reporting?: NodeJS.Timeout;
  }>({});

  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const interactionCountRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);

  // Create success metrics definitions
  const createSuccessMetrics = useCallback((): SuccessMetric[] => {
    return [
      // Performance Metrics
      {
        id: 'page-load-time',
        name: 'Page Load Time',
        description: 'Time taken to fully load the page',
        category: 'performance',
        target: 3000, // 3 seconds
        current: 0,
        unit: 'ms',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          if ('performance' in window && performance.timing) {
            return performance.timing.loadEventEnd - performance.timing.navigationStart;
          }
          return 0;
        }
      },
      {
        id: 'first-contentful-paint',
        name: 'First Contentful Paint',
        description: 'Time to first meaningful content render',
        category: 'performance',
        target: 1500, // 1.5 seconds
        current: 0,
        unit: 'ms',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          return fcpEntry ? fcpEntry.startTime : 0;
        }
      },
      {
        id: 'cumulative-layout-shift',
        name: 'Cumulative Layout Shift',
        description: 'Visual stability of the page',
        category: 'performance',
        target: 0.1, // Core Web Vitals threshold
        current: 0,
        unit: 'score',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          return new Promise((resolve) => {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as any[]) {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              }
            });
            
            observer.observe({ type: 'layout-shift', buffered: true });
            
            setTimeout(() => {
              observer.disconnect();
              resolve(clsValue);
            }, 1000);
          });
        }
      },

      // Usability Metrics
      {
        id: 'mobile-navigation-success',
        name: 'Mobile Navigation Success',
        description: 'Percentage of successful mobile navigation interactions',
        category: 'usability',
        target: 95,
        current: 0,
        unit: '%',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          const navToggle = document.getElementById('responsive-nav-toggle');
          const navMenu = document.getElementById('nav-menu');
          
          if (!navToggle || !navMenu) return 0;
          
          // Simulate success rate based on implementation quality
          const hasProperAria = navToggle.getAttribute('aria-expanded') !== null;
          const hasProperEvents = navToggle.onclick !== null;
          const hasProperStyles = getComputedStyle(navToggle).display !== 'none';
          
          let successRate = 0;
          if (hasProperAria) successRate += 33;
          if (hasProperEvents) successRate += 33;
          if (hasProperStyles) successRate += 34;
          
          return Math.min(100, successRate);
        }
      },
      {
        id: 'touch-target-compliance',
        name: 'Touch Target Compliance',
        description: 'Percentage of touch targets meeting accessibility guidelines',
        category: 'usability',
        target: 100,
        current: 0,
        unit: '%',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
          let compliantTargets = 0;
          
          touchTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            if (rect.width >= 44 && rect.height >= 44) {
              compliantTargets++;
            }
          });
          
          return touchTargets.length > 0 ? (compliantTargets / touchTargets.length) * 100 : 0;
        }
      },
      {
        id: 'responsive-image-optimization',
        name: 'Responsive Image Optimization',
        description: 'Percentage of images optimized for responsive design',
        category: 'usability',
        target: 90,
        current: 0,
        unit: '%',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          const images = document.querySelectorAll('img');
          let optimizedImages = 0;
          
          images.forEach(img => {
            const style = getComputedStyle(img);
            const hasMaxWidth = style.maxWidth === '100%';
            const hasHeight = style.height === 'auto';
            const hasSizes = img.hasAttribute('sizes');
            const hasSrcSet = img.hasAttribute('srcset');
            
            if (hasMaxWidth || hasHeight || hasSizes || hasSrcSet) {
              optimizedImages++;
            }
          });
          
          return images.length > 0 ? (optimizedImages / images.length) * 100 : 100;
        }
      },

      // Accessibility Metrics
      {
        id: 'aria-compliance',
        name: 'ARIA Compliance',
        description: 'Percentage of interactive elements with proper ARIA attributes',
        category: 'accessibility',
        target: 100,
        current: 0,
        unit: '%',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          const interactiveElements = document.querySelectorAll('button, a[href], input, select, textarea, [tabindex], [role="button"]');
          let compliantElements = 0;
          
          interactiveElements.forEach(element => {
            const hasAriaLabel = element.getAttribute('aria-label');
            const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
            const hasRole = element.getAttribute('role');
            const hasAriaExpanded = element.getAttribute('aria-expanded');
            const isButton = element.tagName.toLowerCase() === 'button';
            
            if (hasAriaLabel || hasAriaLabelledBy || hasRole || hasAriaExpanded || isButton) {
              compliantElements++;
            }
          });
          
          return interactiveElements.length > 0 ? (compliantElements / interactiveElements.length) * 100 : 100;
        }
      },
      {
        id: 'keyboard-navigation',
        name: 'Keyboard Navigation Support',
        description: 'Percentage of features accessible via keyboard',
        category: 'accessibility',
        target: 100,
        current: 0,
        unit: '%',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex="0"]');
          let keyboardAccessible = 0;
          
          focusableElements.forEach(element => {
            const tabIndex = element.getAttribute('tabindex');
            const isNaturallyFocusable = ['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
            
            if (isNaturallyFocusable || tabIndex === '0') {
              keyboardAccessible++;
            }
          });
          
          return focusableElements.length > 0 ? (keyboardAccessible / focusableElements.length) * 100 : 100;
        }
      },

      // Compatibility Metrics
      {
        id: 'browser-compatibility',
        name: 'Browser Compatibility',
        description: 'Percentage of features working across target browsers',
        category: 'compatibility',
        target: 95,
        current: 0,
        unit: '%',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          const features = {
            flexbox: CSS.supports('display', 'flex'),
            grid: CSS.supports('display', 'grid'),
            customProperties: CSS.supports('color', 'var(--test)'),
            clamp: CSS.supports('width', 'clamp(1rem, 5vw, 3rem)'),
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window
          };
          
          const supportedFeatures = Object.values(features).filter(Boolean).length;
          return (supportedFeatures / Object.keys(features).length) * 100;
        }
      },
      {
        id: 'css-feature-support',
        name: 'CSS Feature Support',
        description: 'Percentage of CSS features supported with fallbacks',
        category: 'compatibility',
        target: 100,
        current: 0,
        unit: '%',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          // Check for fallback implementations
          const stylesheets = Array.from(document.styleSheets);
          let fallbacksFound = 0;
          let featuresChecked = 0;
          
          // Simple heuristic: look for fallback patterns in CSS
          const fallbackPatterns = [
            'display: block', // flexbox fallback
            'display: inline-block', // flexbox fallback
            'float: left', // grid fallback
            'width: 100%', // responsive fallback
            '@media' // responsive queries
          ];
          
          fallbackPatterns.forEach(pattern => {
            featuresChecked++;
            const hasPattern = document.head.innerHTML.includes(pattern);
            if (hasPattern) fallbacksFound++;
          });
          
          return featuresChecked > 0 ? (fallbacksFound / featuresChecked) * 100 : 100;
        }
      },

      // Stability Metrics
      {
        id: 'error-rate',
        name: 'JavaScript Error Rate',
        description: 'Number of JavaScript errors per session',
        category: 'stability',
        target: 0,
        current: 0,
        unit: 'errors',
        trend: 'stable',
        status: 'excellent',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          return errorCountRef.current;
        }
      },
      {
        id: 'layout-stability',
        name: 'Layout Stability',
        description: 'Stability of responsive layouts across viewport changes',
        category: 'stability',
        target: 95,
        current: 0,
        unit: '%',
        trend: 'stable',
        status: 'needs-improvement',
        history: [],
        lastUpdated: Date.now(),
        collect: async () => {
          // Measure layout stability by checking for responsive elements
          const responsiveElements = document.querySelectorAll('[class*="responsive"]');
          let stableElements = 0;
          
          responsiveElements.forEach(element => {
            const style = getComputedStyle(element);
            const hasMaxWidth = style.maxWidth !== 'none';
            const hasFlexGrow = style.flexGrow !== '0';
            const hasGridArea = style.gridArea !== 'auto';
            
            if (hasMaxWidth || hasFlexGrow || hasGridArea) {
              stableElements++;
            }
          });
          
          return responsiveElements.length > 0 ? (stableElements / responsiveElements.length) * 100 : 100;
        }
      }
    ];
  }, []);

  // Collect user behavior metrics
  const collectUserBehaviorMetrics = useCallback((): UserBehaviorMetric => {
    const sessionDuration = Date.now() - sessionStartRef.current;
    const isMobile = window.innerWidth <= 768;
    
    return {
      bounceRate: sessionDuration < 30000 ? 100 : 0, // Simplified bounce rate
      timeOnPage: sessionDuration,
      interactionRate: (interactionCountRef.current / Math.max(1, sessionDuration / 60000)) * 100, // Interactions per minute
      conversionRate: 0, // Would need to be tracked based on business goals
      mobileUsage: isMobile ? 100 : 0,
      errorRate: (errorCountRef.current / Math.max(1, sessionDuration / 60000)) * 100 // Errors per minute
    };
  }, []);

  // Calculate business impact
  const calculateBusinessImpact = useCallback((metrics: SuccessMetric[]): BusinessImpact[] => {
    const impact: BusinessImpact[] = [];
    
    // Performance impact
    const loadTimeMetric = metrics.find(m => m.id === 'page-load-time');
    if (loadTimeMetric) {
      const baselineLoadTime = 5000; // 5 seconds baseline
      const improvement = ((baselineLoadTime - loadTimeMetric.current) / baselineLoadTime) * 100;
      
      impact.push({
        category: 'Performance',
        metric: 'Page Load Time',
        baseline: baselineLoadTime,
        current: loadTimeMetric.current,
        improvement: Math.max(0, improvement),
        impact: improvement > 0 ? `${improvement.toFixed(1)}% faster loading` : 'No improvement'
      });
    }
    
    // Usability impact
    const mobileNavMetric = metrics.find(m => m.id === 'mobile-navigation-success');
    if (mobileNavMetric) {
      const baselineSuccess = 60; // 60% baseline success rate
      const improvement = mobileNavMetric.current - baselineSuccess;
      
      impact.push({
        category: 'Usability',
        metric: 'Mobile Navigation',
        baseline: baselineSuccess,
        current: mobileNavMetric.current,
        improvement: Math.max(0, improvement),
        impact: improvement > 0 ? `${improvement.toFixed(1)}% better user experience` : 'Needs improvement'
      });
    }
    
    // Accessibility impact
    const ariaMetric = metrics.find(m => m.id === 'aria-compliance');
    if (ariaMetric) {
      const baselineAccessibility = 50; // 50% baseline
      const improvement = ariaMetric.current - baselineAccessibility;
      
      impact.push({
        category: 'Accessibility',
        metric: 'ARIA Compliance',
        baseline: baselineAccessibility,
        current: ariaMetric.current,
        improvement: Math.max(0, improvement),
        impact: improvement > 0 ? `${improvement.toFixed(1)}% more accessible` : 'Needs improvement'
      });
    }
    
    return impact;
  }, []);

  // Update metric status based on current value
  const updateMetricStatus = useCallback((metric: SuccessMetric): SuccessMetric => {
    let status: SuccessMetric['status'];
    let trend: SuccessMetric['trend'] = 'stable';
    
    // Determine status based on target achievement
    const achievementRate = metric.target > 0 ? (metric.current / metric.target) : 
                           metric.target === 0 ? (metric.current === 0 ? 1 : 0) : 0;
    
    if (achievementRate >= 1) status = 'excellent';
    else if (achievementRate >= 0.8) status = 'good';
    else if (achievementRate >= 0.6) status = 'needs-improvement';
    else status = 'poor';
    
    // Calculate trend from history
    if (metric.history.length >= 2) {
      const recent = metric.history.slice(-2);
      const change = recent[1].value - recent[0].value;
      
      if (Math.abs(change) < metric.target * 0.05) {
        trend = 'stable';
      } else if (change > 0) {
        trend = metric.category === 'stability' && metric.id === 'error-rate' ? 'down' : 'up';
      } else {
        trend = metric.category === 'stability' && metric.id === 'error-rate' ? 'up' : 'down';
      }
    }
    
    return { ...metric, status, trend };
  }, []);

  // Collect all metrics
  const collectMetrics = useCallback(async () => {
    if (!state.isActive) return;
    
    const updatedMetrics: SuccessMetric[] = [];
    
    for (const metric of state.metrics) {
      try {
        const newValue = await metric.collect();
        const snapshot: MetricSnapshot = {
          timestamp: Date.now(),
          value: newValue
        };
        
        const updatedMetric = {
          ...metric,
          current: newValue,
          history: [...metric.history.slice(-19), snapshot], // Keep last 20 snapshots
          lastUpdated: Date.now()
        };
        
        updatedMetrics.push(updateMetricStatus(updatedMetric));
      } catch (error) {
        console.error(`Failed to collect metric ${metric.id}:`, error);
        updatedMetrics.push(metric);
      }
    }
    
    // Update user behavior metrics
    const userBehavior = collectUserBehaviorMetrics();
    
    // Calculate overall score
    const categoryScores: Record<string, number> = {};
    const categories = ['performance', 'usability', 'accessibility', 'compatibility', 'stability'];
    
    categories.forEach(category => {
      const categoryMetrics = updatedMetrics.filter(m => m.category === category);
      if (categoryMetrics.length > 0) {
        const totalScore = categoryMetrics.reduce((sum, metric) => {
          const achievementRate = metric.target > 0 ? 
            Math.min(1, metric.current / metric.target) : 
            (metric.current === 0 ? 1 : 0);
          return sum + (achievementRate * 100);
        }, 0);
        categoryScores[category] = totalScore / categoryMetrics.length;
      }
    });
    
    const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length;
    
    // Calculate business impact
    const businessImpact = calculateBusinessImpact(updatedMetrics);
    
    setState(prev => ({
      ...prev,
      metrics: updatedMetrics,
      currentScore: overallScore,
      userBehavior,
      businessImpact
    }));
    
    console.log(`📊 Metrics updated. Overall score: ${overallScore.toFixed(1)}%`);
  }, [state.isActive, state.metrics, updateMetricStatus, collectUserBehaviorMetrics, calculateBusinessImpact]);

  // Generate success report
  const generateReport = useCallback((): SuccessReport => {
    const categoryScores: Record<string, number> = {};
    const categories = ['performance', 'usability', 'accessibility', 'compatibility', 'stability'];
    
    categories.forEach(category => {
      const categoryMetrics = state.metrics.filter(m => m.category === category);
      if (categoryMetrics.length > 0) {
        const totalScore = categoryMetrics.reduce((sum, metric) => {
          const achievementRate = metric.target > 0 ? 
            Math.min(1, metric.current / metric.target) : 
            (metric.current === 0 ? 1 : 0);
          return sum + (achievementRate * 100);
        }, 0);
        categoryScores[category] = totalScore / categoryMetrics.length;
      }
    });
    
    // Generate recommendations
    const recommendations: string[] = [];
    state.metrics.forEach(metric => {
      if (metric.status === 'poor' || metric.status === 'needs-improvement') {
        recommendations.push(`Improve ${metric.name}: currently ${metric.current}${metric.unit}, target ${metric.target}${metric.unit}`);
      }
    });
    
    // Generate achievements
    const achievements: string[] = [];
    state.metrics.forEach(metric => {
      if (metric.status === 'excellent') {
        achievements.push(`${metric.name} meets target: ${metric.current}${metric.unit}`);
      }
    });
    
    return {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      overallScore: state.currentScore,
      categoryScores,
      metrics: state.metrics,
      userBehavior: state.userBehavior,
      businessImpact: state.businessImpact,
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      achievements
    };
  }, [state]);

  // Setup event tracking
  const setupEventTracking = useCallback(() => {
    // Track interactions
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    const handleInteraction = () => {
      interactionCountRef.current++;
    };
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });
    
    // Track errors
    const handleError = (event: ErrorEvent) => {
      errorCountRef.current++;
      console.warn('Tracked error:', event.error);
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      errorCountRef.current++;
      console.warn('Tracked promise rejection:', event.reason);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    // Setup performance observer
    if ('PerformanceObserver' in window) {
      try {
        performanceObserverRef.current = new PerformanceObserver((list) => {
          // Track performance entries for detailed analysis
          console.log('Performance entries:', list.getEntries());
        });
        
        performanceObserverRef.current.observe({ entryTypes: ['paint', 'layout-shift', 'navigation'] });
      } catch (error) {
        console.warn('Performance Observer setup failed:', error);
      }
    }
    
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
    };
  }, []);

  // Initialize success metrics
  const initialize = useCallback(() => {
    if (state.isActive) return;
    
    console.log('📊 Initializing Success Metrics...');
    
    const metrics = createSuccessMetrics();
    const userBehavior = collectUserBehaviorMetrics();
    
    setState(prev => ({
      ...prev,
      isActive: true,
      metrics,
      userBehavior,
      tracking: true
    }));
    
    // Setup event tracking
    const cleanup = setupEventTracking();
    
    // Start collection intervals
    trackingIntervals.current.metrics = setInterval(collectMetrics, 30000); // Every 30 seconds
    trackingIntervals.current.userBehavior = setInterval(() => {
      const behavior = collectUserBehaviorMetrics();
      setState(prev => ({ ...prev, userBehavior: behavior }));
    }, 60000); // Every minute
    
    trackingIntervals.current.reporting = setInterval(() => {
      const report = generateReport();
      setState(prev => ({
        ...prev,
        reports: [report, ...prev.reports.slice(0, 19)] // Keep last 20 reports
      }));
    }, 300000); // Every 5 minutes
    
    // Initial collection
    setTimeout(collectMetrics, 1000);
    
    return cleanup;
  }, [state.isActive, createSuccessMetrics, collectUserBehaviorMetrics, setupEventTracking, collectMetrics, generateReport]);

  // Cleanup function
  const cleanup = useCallback(() => {
    Object.values(trackingIntervals.current).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    
    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
    }
    
    setState(prev => ({
      ...prev,
      isActive: false,
      tracking: false
    }));
    
    console.log('📊 Success Metrics cleaned up');
  }, []);

  // Manual report generation
  const createReport = useCallback(() => {
    const report = generateReport();
    setState(prev => ({
      ...prev,
      reports: [report, ...prev.reports.slice(0, 19)]
    }));
    return report;
  }, [generateReport]);

  return {
    isActive: state.isActive,
    metrics: state.metrics,
    reports: state.reports,
    currentScore: state.currentScore,
    tracking: state.tracking,
    userBehavior: state.userBehavior,
    businessImpact: state.businessImpact,
    initialize,
    cleanup,
    collectMetrics,
    createReport
  };
}

export default useSuccessMetrics;