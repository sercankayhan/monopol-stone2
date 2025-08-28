"use client";

// Maintenance Automation System
// Based on CLAUDE-PART2.md - Automated maintenance and monitoring

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'on-change';
  lastRun: number | null;
  nextRun: number | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  result?: string;
  error?: string;
  autoExecute: boolean;
  task: () => Promise<{ success: boolean; message: string; data?: any }>;
}

interface MaintenanceSchedule {
  dailyTasks: MaintenanceTask[];
  weeklyTasks: MaintenanceTask[];
  monthlyTasks: MaintenanceTask[];
  onChangeTasks: MaintenanceTask[];
}

interface HealthMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

interface MaintenanceReport {
  timestamp: number;
  duration: number;
  tasksRun: number;
  tasksSucceeded: number;
  tasksFailed: number;
  healthScore: number;
  issues: string[];
  recommendations: string[];
}

interface MaintenanceAutomationState {
  isActive: boolean;
  schedule: MaintenanceSchedule;
  currentTask: MaintenanceTask | null;
  healthMetrics: HealthMetric[];
  reports: MaintenanceReport[];
  autoRunEnabled: boolean;
  nextMaintenanceTime: number | null;
}

export function useMaintenanceAutomation() {
  const [state, setState] = useState<MaintenanceAutomationState>({
    isActive: false,
    schedule: {
      dailyTasks: [],
      weeklyTasks: [],
      monthlyTasks: [],
      onChangeTasks: []
    },
    currentTask: null,
    healthMetrics: [],
    reports: [],
    autoRunEnabled: true,
    nextMaintenanceTime: null
  });

  const intervalRefs = useRef<{
    maintenance?: NodeJS.Timeout;
    healthCheck?: NodeJS.Timeout;
    monitoring?: NodeJS.Timeout;
  }>({});

  const mutationObserverRef = useRef<MutationObserver | null>(null);

  // Create maintenance tasks
  const createMaintenanceTasks = useCallback((): MaintenanceSchedule => {
    return {
      dailyTasks: [
        {
          id: 'daily-health-check',
          name: 'Daily Health Check',
          description: 'Check system health metrics and responsive features',
          frequency: 'daily',
          lastRun: null,
          nextRun: null,
          priority: 'high',
          status: 'pending',
          autoExecute: true,
          task: async () => {
            try {
              const metrics = await performHealthCheck();
              const criticalIssues = metrics.filter(m => m.status === 'critical').length;
              
              return {
                success: criticalIssues === 0,
                message: `Health check completed. ${criticalIssues} critical issues found.`,
                data: metrics
              };
            } catch (error) {
              return {
                success: false,
                message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        },
        {
          id: 'daily-performance-audit',
          name: 'Performance Audit',
          description: 'Audit responsive performance and Core Web Vitals',
          frequency: 'daily',
          lastRun: null,
          nextRun: null,
          priority: 'medium',
          status: 'pending',
          autoExecute: true,
          task: async () => {
            try {
              const performanceData = await auditPerformance();
              const score = performanceData.overallScore;
              
              return {
                success: score >= 70,
                message: `Performance audit completed. Score: ${score}/100`,
                data: performanceData
              };
            } catch (error) {
              return {
                success: false,
                message: `Performance audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        },
        {
          id: 'daily-error-cleanup',
          name: 'Error Log Cleanup',
          description: 'Clean up old error logs and analyze patterns',
          frequency: 'daily',
          lastRun: null,
          nextRun: null,
          priority: 'low',
          status: 'pending',
          autoExecute: true,
          task: async () => {
            try {
              const cleaned = await cleanupErrorLogs();
              return {
                success: true,
                message: `Cleaned up ${cleaned.removedEntries} old error entries`,
                data: cleaned
              };
            } catch (error) {
              return {
                success: false,
                message: `Error cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        }
      ],
      
      weeklyTasks: [
        {
          id: 'weekly-compatibility-scan',
          name: 'Compatibility Scan',
          description: 'Scan for new browser compatibility issues',
          frequency: 'weekly',
          lastRun: null,
          nextRun: null,
          priority: 'high',
          status: 'pending',
          autoExecute: true,
          task: async () => {
            try {
              const compatibilityIssues = await scanCompatibility();
              const criticalIssues = compatibilityIssues.filter(i => i.severity === 'critical').length;
              
              return {
                success: criticalIssues === 0,
                message: `Compatibility scan completed. ${criticalIssues} critical issues found.`,
                data: compatibilityIssues
              };
            } catch (error) {
              return {
                success: false,
                message: `Compatibility scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        },
        {
          id: 'weekly-responsive-audit',
          name: 'Responsive Design Audit',
          description: 'Audit responsive design implementation',
          frequency: 'weekly',
          lastRun: null,
          nextRun: null,
          priority: 'medium',
          status: 'pending',
          autoExecute: true,
          task: async () => {
            try {
              const auditResults = await auditResponsiveDesign();
              const score = auditResults.overallScore;
              
              return {
                success: score >= 80,
                message: `Responsive audit completed. Score: ${score}/100`,
                data: auditResults
              };
            } catch (error) {
              return {
                success: false,
                message: `Responsive audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        }
      ],
      
      monthlyTasks: [
        {
          id: 'monthly-full-system-review',
          name: 'Full System Review',
          description: 'Comprehensive review of all responsive systems',
          frequency: 'monthly',
          lastRun: null,
          nextRun: null,
          priority: 'critical',
          status: 'pending',
          autoExecute: false, // Manual approval required
          task: async () => {
            try {
              const review = await performFullSystemReview();
              
              return {
                success: review.criticalIssues === 0,
                message: `System review completed. ${review.criticalIssues} critical issues found.`,
                data: review
              };
            } catch (error) {
              return {
                success: false,
                message: `System review failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        },
        {
          id: 'monthly-optimization-review',
          name: 'Optimization Opportunities',
          description: 'Identify new optimization opportunities',
          frequency: 'monthly',
          lastRun: null,
          nextRun: null,
          priority: 'medium',
          status: 'pending',
          autoExecute: true,
          task: async () => {
            try {
              const opportunities = await identifyOptimizations();
              
              return {
                success: true,
                message: `Found ${opportunities.length} optimization opportunities`,
                data: opportunities
              };
            } catch (error) {
              return {
                success: false,
                message: `Optimization review failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        }
      ],
      
      onChangeTasks: [
        {
          id: 'on-change-responsive-validation',
          name: 'Responsive Validation',
          description: 'Validate responsive features after DOM changes',
          frequency: 'on-change',
          lastRun: null,
          nextRun: null,
          priority: 'high',
          status: 'pending',
          autoExecute: true,
          task: async () => {
            try {
              const validation = await validateResponsiveFeatures();
              
              return {
                success: validation.isValid,
                message: validation.isValid ? 'Validation passed' : `Validation failed: ${validation.errors.join(', ')}`,
                data: validation
              };
            } catch (error) {
              return {
                success: false,
                message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        }
      ]
    };
  }, []);

  // Health check functions
  const performHealthCheck = async (): Promise<HealthMetric[]> => {
    const metrics: HealthMetric[] = [];
    
    // Check responsive navigation
    const navToggle = document.getElementById('responsive-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    metrics.push({
      name: 'Navigation Health',
      value: (navToggle && navMenu) ? 100 : 0,
      threshold: 100,
      status: (navToggle && navMenu) ? 'healthy' : 'critical',
      trend: 'stable',
      lastUpdated: Date.now()
    });

    // Check CSS loading
    const responsiveStylesheets = Array.from(document.styleSheets)
      .filter(sheet => sheet.href && sheet.href.includes('responsive'));
    metrics.push({
      name: 'CSS Health',
      value: responsiveStylesheets.length > 0 ? 100 : 0,
      threshold: 100,
      status: responsiveStylesheets.length > 0 ? 'healthy' : 'critical',
      trend: 'stable',
      lastUpdated: Date.now()
    });

    // Check JavaScript errors
    const errorCount = (window as any).responsiveErrorCount || 0;
    metrics.push({
      name: 'Error Rate',
      value: Math.max(0, 100 - errorCount * 10),
      threshold: 90,
      status: errorCount === 0 ? 'healthy' : errorCount < 3 ? 'warning' : 'critical',
      trend: 'stable',
      lastUpdated: Date.now()
    });

    // Check performance
    if ('performance' in window && performance.navigation) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      const performanceScore = Math.max(0, Math.min(100, 100 - (loadTime - 2000) / 100));
      metrics.push({
        name: 'Load Performance',
        value: performanceScore,
        threshold: 80,
        status: performanceScore >= 80 ? 'healthy' : performanceScore >= 60 ? 'warning' : 'critical',
        trend: 'stable',
        lastUpdated: Date.now()
      });
    }

    return metrics;
  };

  const auditPerformance = async () => {
    const metrics = {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      overallScore: 0
    };

    if ('performance' in window) {
      // Basic load time
      if (performance.timing) {
        metrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      }

      // Try to get paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.firstContentfulPaint = fcpEntry.startTime;
      }

      // Calculate basic score
      const loadScore = Math.max(0, Math.min(100, 100 - (metrics.loadTime - 2000) / 100));
      const fcpScore = Math.max(0, Math.min(100, 100 - (metrics.firstContentfulPaint - 1500) / 50));
      metrics.overallScore = Math.round((loadScore + fcpScore) / 2);
    }

    return metrics;
  };

  const cleanupErrorLogs = async () => {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    let removedEntries = 0;

    // Clean up localStorage error logs
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('responsive-error-') || key.startsWith('maintenance-log-')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (entry.timestamp && entry.timestamp < cutoffTime) {
            localStorage.removeItem(key);
            removedEntries++;
          }
        } catch {
          // Remove invalid entries
          localStorage.removeItem(key);
          removedEntries++;
        }
      }
    });

    return { removedEntries, cutoffTime };
  };

  const scanCompatibility = async () => {
    const issues = [];
    
    // Check for new unsupported features
    const features = {
      'CSS Grid': CSS.supports('display', 'grid'),
      'Flexbox': CSS.supports('display', 'flex'),
      'Custom Properties': CSS.supports('color', 'var(--test)'),
      'Clamp': CSS.supports('width', 'clamp(1rem, 5vw, 3rem)'),
      'Container Queries': CSS.supports('container-type', 'inline-size')
    };

    Object.entries(features).forEach(([feature, supported]) => {
      if (!supported) {
        issues.push({
          feature,
          severity: 'high' as const,
          description: `${feature} is not supported in current browser`,
          impact: 'Layout may not display correctly'
        });
      }
    });

    return issues;
  };

  const auditResponsiveDesign = async () => {
    let score = 100;
    const issues = [];

    // Check viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      score -= 20;
      issues.push('Missing viewport meta tag');
    }

    // Check responsive navigation
    const navToggle = document.getElementById('responsive-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!navToggle || !navMenu) {
      score -= 30;
      issues.push('Responsive navigation not implemented');
    }

    // Check responsive images
    const images = document.querySelectorAll('img');
    let responsiveImages = 0;
    images.forEach(img => {
      const style = getComputedStyle(img);
      if (style.maxWidth === '100%' || img.hasAttribute('sizes')) {
        responsiveImages++;
      }
    });
    
    if (images.length > 0 && responsiveImages / images.length < 0.8) {
      score -= 20;
      issues.push('Not all images are responsive');
    }

    return {
      overallScore: Math.max(0, score),
      issues,
      responsiveImages,
      totalImages: images.length
    };
  };

  const performFullSystemReview = async () => {
    const health = await performHealthCheck();
    const performance = await auditPerformance();
    const compatibility = await scanCompatibility();
    const responsive = await auditResponsiveDesign();

    const criticalIssues = health.filter(h => h.status === 'critical').length +
                          compatibility.filter(c => c.severity === 'critical').length;

    return {
      timestamp: Date.now(),
      healthMetrics: health,
      performanceMetrics: performance,
      compatibilityIssues: compatibility,
      responsiveAudit: responsive,
      criticalIssues,
      overallScore: Math.round((
        health.reduce((acc, h) => acc + h.value, 0) / health.length +
        performance.overallScore +
        responsive.overallScore
      ) / 3)
    };
  };

  const identifyOptimizations = async () => {
    const opportunities = [];

    // Check for unused CSS
    const stylesheets = Array.from(document.styleSheets);
    opportunities.push({
      type: 'CSS Optimization',
      description: 'Consider removing unused CSS rules',
      impact: 'Reduce bundle size and improve load times',
      effort: 'Medium'
    });

    // Check for image optimization
    const images = document.querySelectorAll('img');
    const largeImages = Array.from(images).filter(img => {
      return img.naturalWidth > 1920 || img.naturalHeight > 1080;
    });
    
    if (largeImages.length > 0) {
      opportunities.push({
        type: 'Image Optimization',
        description: `${largeImages.length} images could be optimized`,
        impact: 'Improve load performance',
        effort: 'Low'
      });
    }

    // Check for JavaScript bundling opportunities
    const scripts = document.querySelectorAll('script[src]');
    if (scripts.length > 5) {
      opportunities.push({
        type: 'Script Bundling',
        description: 'Consider bundling JavaScript files',
        impact: 'Reduce HTTP requests',
        effort: 'High'
      });
    }

    return opportunities;
  };

  const validateResponsiveFeatures = async () => {
    const errors = [];
    let isValid = true;

    // Check navigation
    const navToggle = document.getElementById('responsive-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!navToggle || !navMenu) {
      errors.push('Responsive navigation elements missing');
      isValid = false;
    }

    // Check responsive classes
    const responsiveElements = document.querySelectorAll('[class*="responsive"]');
    if (responsiveElements.length === 0) {
      errors.push('No responsive elements found');
      isValid = false;
    }

    return { isValid, errors, elementCount: responsiveElements.length };
  };

  // Task execution
  const executeTask = useCallback(async (task: MaintenanceTask): Promise<MaintenanceTask> => {
    const startTime = Date.now();
    
    setState(prev => ({
      ...prev,
      currentTask: { ...task, status: 'running' }
    }));

    try {
      const result = await task.task();
      const duration = Date.now() - startTime;
      
      const updatedTask: MaintenanceTask = {
        ...task,
        status: result.success ? 'completed' : 'failed',
        duration,
        result: result.message,
        error: result.success ? undefined : result.message,
        lastRun: Date.now()
      };

      setState(prev => ({
        ...prev,
        currentTask: null
      }));

      return updatedTask;
    } catch (error) {
      const duration = Date.now() - startTime;
      const updatedTask: MaintenanceTask = {
        ...task,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastRun: Date.now()
      };

      setState(prev => ({
        ...prev,
        currentTask: null
      }));

      return updatedTask;
    }
  }, []);

  // Schedule calculations
  const calculateNextRun = useCallback((task: MaintenanceTask): number => {
    const now = Date.now();
    const lastRun = task.lastRun || now;
    
    switch (task.frequency) {
      case 'daily':
        return lastRun + (24 * 60 * 60 * 1000);
      case 'weekly':
        return lastRun + (7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return lastRun + (30 * 24 * 60 * 60 * 1000);
      case 'on-change':
        return now; // Run immediately when triggered
      default:
        return now + (24 * 60 * 60 * 1000);
    }
  }, []);

  // Run maintenance cycle
  const runMaintenanceCycle = useCallback(async () => {
    if (!state.isActive || !state.autoRunEnabled) return;

    const allTasks = [
      ...state.schedule.dailyTasks,
      ...state.schedule.weeklyTasks,
      ...state.schedule.monthlyTasks
    ];

    const tasksToRun = allTasks.filter(task => {
      if (!task.autoExecute) return false;
      const nextRun = calculateNextRun(task);
      return Date.now() >= nextRun;
    });

    if (tasksToRun.length === 0) return;

    console.log(`🔧 Running ${tasksToRun.length} maintenance tasks...`);
    
    const results = [];
    let tasksSucceeded = 0;
    let tasksFailed = 0;

    for (const task of tasksToRun) {
      const result = await executeTask(task);
      results.push(result);
      
      if (result.status === 'completed') {
        tasksSucceeded++;
      } else {
        tasksFailed++;
      }
    }

    // Update health metrics
    const healthMetrics = await performHealthCheck();
    
    // Generate report
    const report: MaintenanceReport = {
      timestamp: Date.now(),
      duration: results.reduce((acc, task) => acc + (task.duration || 0), 0),
      tasksRun: results.length,
      tasksSucceeded,
      tasksFailed,
      healthScore: healthMetrics.reduce((acc, metric) => acc + metric.value, 0) / healthMetrics.length,
      issues: results.filter(r => r.error).map(r => r.error!),
      recommendations: []
    };

    setState(prev => ({
      ...prev,
      healthMetrics,
      reports: [report, ...prev.reports.slice(0, 9)] // Keep last 10 reports
    }));

    console.log(`✅ Maintenance completed: ${tasksSucceeded} succeeded, ${tasksFailed} failed`);
  }, [state.isActive, state.autoRunEnabled, state.schedule, executeTask, calculateNextRun]);

  // Setup DOM change monitoring
  const setupChangeMonitoring = useCallback(() => {
    if (mutationObserverRef.current) return;

    mutationObserverRef.current = new MutationObserver((mutations) => {
      let hasSignificantChanges = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.className && 
                  (element.className.includes('responsive') || 
                   element.className.includes('nav') ||
                   element.tagName.toLowerCase() === 'nav')) {
                hasSignificantChanges = true;
              }
            }
          });
        }
      });

      if (hasSignificantChanges) {
        // Trigger on-change tasks
        state.schedule.onChangeTasks.forEach(task => {
          if (task.autoExecute) {
            setTimeout(() => executeTask(task), 1000); // Delay to allow DOM to settle
          }
        });
      }
    });

    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }, [state.schedule.onChangeTasks, executeTask]);

  // Initialize maintenance system
  const initialize = useCallback(() => {
    if (state.isActive) return;

    console.log('🔧 Initializing Maintenance Automation...');

    const schedule = createMaintenanceTasks();
    
    setState(prev => ({
      ...prev,
      isActive: true,
      schedule,
      nextMaintenanceTime: Date.now() + (60 * 60 * 1000) // 1 hour from now
    }));

    // Setup intervals
    intervalRefs.current.maintenance = setInterval(runMaintenanceCycle, 60 * 60 * 1000); // Every hour
    intervalRefs.current.healthCheck = setInterval(async () => {
      const metrics = await performHealthCheck();
      setState(prev => ({ ...prev, healthMetrics: metrics }));
    }, 5 * 60 * 1000); // Every 5 minutes

    // Setup change monitoring
    setupChangeMonitoring();

    // Run initial health check
    setTimeout(async () => {
      const metrics = await performHealthCheck();
      setState(prev => ({ ...prev, healthMetrics: metrics }));
    }, 1000);

  }, [state.isActive, createMaintenanceTasks, runMaintenanceCycle, setupChangeMonitoring]);

  // Cleanup function
  const cleanup = useCallback(() => {
    Object.values(intervalRefs.current).forEach(interval => {
      if (interval) clearInterval(interval);
    });

    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      currentTask: null
    }));

    console.log('🔧 Maintenance Automation cleaned up');
  }, []);

  // Manual task execution
  const runTask = useCallback(async (taskId: string) => {
    const allTasks = [
      ...state.schedule.dailyTasks,
      ...state.schedule.weeklyTasks,
      ...state.schedule.monthlyTasks,
      ...state.schedule.onChangeTasks
    ];

    const task = allTasks.find(t => t.id === taskId);
    if (!task) return null;

    return await executeTask(task);
  }, [state.schedule, executeTask]);

  return {
    isActive: state.isActive,
    schedule: state.schedule,
    currentTask: state.currentTask,
    healthMetrics: state.healthMetrics,
    reports: state.reports,
    autoRunEnabled: state.autoRunEnabled,
    nextMaintenanceTime: state.nextMaintenanceTime,
    initialize,
    cleanup,
    runTask,
    runMaintenanceCycle,
    toggleAutoRun: (enabled: boolean) => setState(prev => ({ ...prev, autoRunEnabled: enabled }))
  };
}

export default useMaintenanceAutomation;