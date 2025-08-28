"use client";

// Emergency Rollback System
// Based on CLAUDE-PART2.md - Complete rollback system for safe deployment

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Rollback interfaces
interface SystemBackup {
  timestamp: number;
  version: string;
  viewport: string | null;
  bodyClasses: string[];
  htmlClasses: string[];
  stylesheets: StylesheetBackup[];
  elements: ElementBackup[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  scripts: ScriptBackup;
  customProperties: Record<string, string>;
}

interface StylesheetBackup {
  index: number;
  href: string | null;
  disabled: boolean;
  isResponsive: boolean;
}

interface ElementBackup {
  selector: string;
  element: Element;
  classList: string[];
  attributes: Array<{ name: string; value: string }>;
  computedStyle: Partial<CSSStyleDeclaration>;
  innerHTML?: string;
}

interface ScriptBackup {
  responsiveFeatures: string[];
  globalVariables: Record<string, any>;
  eventListeners: Array<{
    element: string;
    event: string;
    handler: string;
  }>;
}

interface RollbackPoint {
  id: string;
  label: string;
  timestamp: number;
  backup: SystemBackup;
  automatic: boolean;
}

interface HealthMetrics {
  jsErrors: number;
  layoutShifts: number;
  performanceIssues: number;
  memoryLeaks: number;
  renderingProblems: number;
  lastUpdated: number;
}

// Emergency Rollback System Hook
export function useEmergencyRollback() {
  const [isActive, setIsActive] = useState(false);
  const [rollbackPoints, setRollbackPoints] = useState<RollbackPoint[]>([]);
  const [currentBackup, setCurrentBackup] = useState<SystemBackup | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    jsErrors: 0,
    layoutShifts: 0,
    performanceIssues: 0,
    memoryLeaks: 0,
    renderingProblems: 0,
    lastUpdated: Date.now()
  });
  
  const observersRef = useRef<{
    mutationObserver?: MutationObserver;
    performanceObserver?: PerformanceObserver;
    resizeObserver?: ResizeObserver;
  }>({});

  const errorCountRef = useRef(0);
  const layoutShiftCountRef = useRef(0);
  const isRolledBackRef = useRef(false);

  // Create system backup
  const createSystemBackup = useCallback((): SystemBackup => {
    const backup: SystemBackup = {
      timestamp: Date.now(),
      version: '1.0.0',
      viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || null,
      bodyClasses: Array.from(document.body.classList),
      htmlClasses: Array.from(document.documentElement.classList),
      stylesheets: [],
      elements: [],
      localStorage: {},
      sessionStorage: {},
      scripts: {
        responsiveFeatures: [],
        globalVariables: {},
        eventListeners: []
      },
      customProperties: {}
    };

    // Backup stylesheets
    Array.from(document.styleSheets).forEach((sheet, index) => {
      try {
        const isResponsive = sheet.href ? 
          sheet.href.includes('responsive') || 
          sheet.href.includes('mobile') ||
          sheet.href.includes('tablet') : false;
          
        backup.stylesheets.push({
          index,
          href: sheet.href,
          disabled: sheet.disabled,
          isResponsive
        });
      } catch (error) {
        console.warn('Could not backup stylesheet:', error);
      }
    });

    // Backup responsive elements
    const responsiveElements = document.querySelectorAll('[class*="responsive"], [data-responsive]');
    responsiveElements.forEach((element, index) => {
      if (index < 50) { // Limit to prevent memory issues
        const computedStyle = getComputedStyle(element);
        backup.elements.push({
          selector: generateElementSelector(element),
          element: element,
          classList: Array.from(element.classList),
          attributes: Array.from(element.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          })),
          computedStyle: {
            display: computedStyle.display,
            position: computedStyle.position,
            transform: computedStyle.transform,
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility
          }
        });
      }
    });

    // Backup storage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) backup.localStorage[key] = localStorage.getItem(key) || '';
      }
    } catch (error) {
      console.warn('Could not backup localStorage:', error);
    }

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) backup.sessionStorage[key] = sessionStorage.getItem(key) || '';
      }
    } catch (error) {
      console.warn('Could not backup sessionStorage:', error);
    }

    // Backup global variables
    const globalVars = ['safeResponsiveNav', 'ResponsiveNav', 'responsiveMigration'];
    globalVars.forEach(varName => {
      if ((window as any)[varName]) {
        backup.scripts.globalVariables[varName] = typeof (window as any)[varName];
      }
    });

    // Backup CSS custom properties
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars = Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules);
        } catch {
          return [];
        }
      })
      .filter(rule => rule.cssText.includes('--'))
      .map(rule => rule.cssText.match(/--[^:]+/g))
      .flat()
      .filter(Boolean) as string[];
    
    cssVars.forEach(varName => {
      const value = rootStyles.getPropertyValue(varName);
      if (value) backup.customProperties[varName] = value;
    });

    return backup;
  }, []);

  // Generate element selector
  const generateElementSelector = useCallback((element: Element): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classNames = element.className.split(' ').filter(Boolean);
      if (classNames.length > 0) return `.${classNames[0]}`;
    }
    return element.tagName.toLowerCase();
  }, []);

  // Create rollback point
  const createRollbackPoint = useCallback((label: string, automatic = false): string => {
    const backup = createSystemBackup();
    const id = `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const rollbackPoint: RollbackPoint = {
      id,
      label,
      timestamp: Date.now(),
      backup,
      automatic
    };

    setRollbackPoints(prev => {
      const updated = [rollbackPoint, ...prev];
      // Keep only last 20 rollback points
      return updated.slice(0, 20);
    });

    console.log(`📍 Rollback point created: ${label} (${id})`);
    return id;
  }, [createSystemBackup]);

  // Execute rollback
  const executeRollback = useCallback(async (rollbackPointId?: string): Promise<boolean> => {
    try {
      console.log('🔄 Executing emergency rollback...');
      
      const targetRollbackPoint = rollbackPointId 
        ? rollbackPoints.find(point => point.id === rollbackPointId)
        : rollbackPoints[0]; // Latest rollback point

      if (!targetRollbackPoint && !currentBackup) {
        console.error('❌ No rollback point or backup available');
        return false;
      }

      const backup = targetRollbackPoint?.backup || currentBackup;
      if (!backup) return false;

      // 1. Disable responsive stylesheets
      backup.stylesheets.forEach(sheet => {
        const styleSheet = document.styleSheets[sheet.index];
        if (styleSheet && sheet.isResponsive) {
          styleSheet.disabled = true;
        }
      });

      // 2. Remove responsive CSS files
      const responsiveLinks = document.querySelectorAll('link[href*="responsive"]');
      responsiveLinks.forEach(link => link.remove());

      // 3. Restore element states
      backup.elements.forEach(elementBackup => {
        try {
          const element = document.querySelector(elementBackup.selector);
          if (element) {
            // Restore classes
            element.className = elementBackup.classList.join(' ');
            
            // Restore attributes
            elementBackup.attributes.forEach(attr => {
              element.setAttribute(attr.name, attr.value);
            });
            
            // Remove responsive attributes
            element.removeAttribute('data-responsive');
            element.removeAttribute('data-migrated');
          }
        } catch (error) {
          console.warn(`Could not restore element ${elementBackup.selector}:`, error);
        }
      });

      // 4. Remove added elements
      const addedElements = document.querySelectorAll('#responsive-nav-toggle, #responsive-nav-overlay');
      addedElements.forEach(element => element.remove());

      // 5. Restore viewport
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta && backup.viewport) {
        viewportMeta.setAttribute('content', backup.viewport);
      } else if (viewportMeta && !backup.viewport) {
        viewportMeta.remove();
      }

      // 6. Clean up classes
      const responsiveClasses = [
        'responsive-enhanced',
        'responsive-nav-open',
        'mobile-menu-active',
        'touch-device',
        'supports-grid',
        'supports-flexbox'
      ];
      
      responsiveClasses.forEach(className => {
        document.body.classList.remove(className);
        document.documentElement.classList.remove(className);
      });

      // Restore original classes
      document.body.className = backup.bodyClasses.join(' ');
      document.documentElement.className = backup.htmlClasses.join(' ');

      // 7. Remove JavaScript instances
      ['safeResponsiveNav', 'ResponsiveNav', 'responsiveMigration'].forEach(varName => {
        if ((window as any)[varName]) {
          if (typeof (window as any)[varName].destroy === 'function') {
            (window as any)[varName].destroy();
          }
          (window as any)[varName] = null;
        }
      });

      // 8. Restore CSS custom properties
      Object.entries(backup.customProperties).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });

      // 9. Clear responsive storage items
      const responsiveKeys = Object.keys(localStorage).filter(key => 
        key.includes('responsive') || key.includes('mobile') || key.includes('nav')
      );
      responsiveKeys.forEach(key => localStorage.removeItem(key));

      isRolledBackRef.current = true;
      
      console.log('✅ Rollback completed successfully');
      showRollbackNotification('success');
      
      return true;
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      showRollbackNotification('error');
      return false;
    }
  }, [rollbackPoints, currentBackup]);

  // Show rollback notification
  const showRollbackNotification = useCallback((type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 10003;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-weight: 600;
    `;
    
    notification.innerHTML = type === 'success' 
      ? '✅ Emergency Rollback Completed'
      : '❌ Rollback Failed - Check Console';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }, []);

  // Setup health monitoring
  const setupHealthMonitoring = useCallback(() => {
    // Monitor JavaScript errors
    const errorHandler = (event: ErrorEvent) => {
      if (event.filename && event.filename.includes('responsive')) {
        errorCountRef.current++;
        setHealthMetrics(prev => ({
          ...prev,
          jsErrors: errorCountRef.current,
          lastUpdated: Date.now()
        }));
      }
    };

    // Monitor unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection:', event.reason);
      errorCountRef.current++;
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Monitor layout shifts
    if ('PerformanceObserver' in window) {
      const perfObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            layoutShiftCountRef.current++;
          }
        });
        
        setHealthMetrics(prev => ({
          ...prev,
          layoutShifts: layoutShiftCountRef.current,
          lastUpdated: Date.now()
        }));
      });

      try {
        perfObserver.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.performanceObserver = perfObserver;
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }

    // Monitor DOM mutations for excessive changes
    const mutationObserver = new MutationObserver((mutations) => {
      let significantChanges = 0;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 3) {
          significantChanges++;
        }
      });
      
      if (significantChanges > 10) {
        setHealthMetrics(prev => ({
          ...prev,
          renderingProblems: prev.renderingProblems + 1,
          lastUpdated: Date.now()
        }));
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    observersRef.current.mutationObserver = mutationObserver;

    // Auto-rollback on critical issues
    const healthCheckInterval = setInterval(() => {
      const shouldAutoRollback = 
        errorCountRef.current > 5 ||
        layoutShiftCountRef.current > 15 ||
        healthMetrics.performanceIssues > 10;

      if (shouldAutoRollback && !isRolledBackRef.current) {
        console.warn('🚨 Auto-rollback triggered due to system health issues');
        createRollbackPoint('Auto-rollback: Health issues detected', true);
        executeRollback();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      clearInterval(healthCheckInterval);
      
      Object.values(observersRef.current).forEach(observer => {
        observer?.disconnect();
      });
    };
  }, [healthMetrics.performanceIssues, createRollbackPoint, executeRollback]);

  // Initialize system
  const initialize = useCallback(() => {
    if (isActive) return;
    
    setIsActive(true);
    const initialBackup = createSystemBackup();
    setCurrentBackup(initialBackup);
    
    // Create initial rollback point
    createRollbackPoint('Initial system state', true);
    
    // Setup health monitoring
    const cleanup = setupHealthMonitoring();
    
    // Global emergency shortcuts
    const emergencyKeyHandler = (event: KeyboardEvent) => {
      // Ctrl+Shift+Alt+R for emergency rollback
      if (event.ctrlKey && event.shiftKey && event.altKey && event.key === 'R') {
        event.preventDefault();
        if (confirm('🚨 Emergency Rollback - This will disable all responsive features. Continue?')) {
          executeRollback();
        }
      }
    };

    document.addEventListener('keydown', emergencyKeyHandler);
    
    console.log('🛡️ Emergency Rollback System initialized');
    
    return () => {
      cleanup();
      document.removeEventListener('keydown', emergencyKeyHandler);
    };
  }, [isActive, createSystemBackup, createRollbackPoint, setupHealthMonitoring, executeRollback]);

  // Cleanup
  const cleanup = useCallback(() => {
    setIsActive(false);
    Object.values(observersRef.current).forEach(observer => {
      observer?.disconnect();
    });
  }, []);

  // Get system status
  const getSystemStatus = useCallback(() => {
    return {
      isActive,
      isRolledBack: isRolledBackRef.current,
      rollbackPointsCount: rollbackPoints.length,
      healthMetrics,
      lastBackup: currentBackup?.timestamp,
      canRollback: rollbackPoints.length > 0 || currentBackup !== null
    };
  }, [isActive, rollbackPoints.length, healthMetrics, currentBackup]);

  return {
    initialize,
    cleanup,
    createRollbackPoint,
    executeRollback,
    rollbackPoints,
    healthMetrics,
    getSystemStatus,
    isActive
  };
}

export default useEmergencyRollback;