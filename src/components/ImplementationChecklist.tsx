"use client";

// Implementation Checklist System
// Based on CLAUDE-PART2.md - Comprehensive checklist for responsive implementation

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'preparation' | 'foundation' | 'navigation' | 'migration' | 'testing' | 'deployment';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
  dependencies: string[];
  estimatedTime: number; // in minutes
  actualTime?: number;
  startTime?: number;
  completedTime?: number;
  notes?: string;
  validationRules?: ValidationRule[];
  autoCheck?: () => Promise<boolean>;
}

interface ValidationRule {
  id: string;
  description: string;
  check: () => Promise<boolean>;
  errorMessage?: string;
}

interface ChecklistPhase {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  completionRate: number;
}

interface ImplementationStats {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  failedItems: number;
  skippedItems: number;
  totalEstimatedTime: number;
  actualTimeSpent: number;
  completionRate: number;
  blockedItems: number;
}

interface ChecklistState {
  isActive: boolean;
  phases: ChecklistPhase[];
  currentPhase: string | null;
  stats: ImplementationStats;
  notifications: ChecklistNotification[];
}

interface ChecklistNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: number;
  dismissed: boolean;
}

export function useImplementationChecklist() {
  const [state, setState] = useState<ChecklistState>({
    isActive: false,
    phases: [],
    currentPhase: null,
    stats: {
      totalItems: 0,
      completedItems: 0,
      inProgressItems: 0,
      failedItems: 0,
      skippedItems: 0,
      totalEstimatedTime: 0,
      actualTimeSpent: 0,
      completionRate: 0,
      blockedItems: 0
    },
    notifications: []
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Create comprehensive checklist phases
  const createChecklistPhases = useCallback((): ChecklistPhase[] => {
    return [
      {
        id: 'preparation',
        name: 'Pre-Implementation Analysis',
        description: 'Analyze current system and prepare for responsive conversion',
        status: 'not-started',
        completionRate: 0,
        items: [
          {
            id: 'code-audit',
            title: 'Complete Code Audit',
            description: 'Perform comprehensive audit of existing codebase',
            category: 'preparation',
            priority: 'critical',
            status: 'pending',
            dependencies: [],
            estimatedTime: 120,
            autoCheck: async () => {
              // Check if audit files exist or audit data is available
              const auditElements = document.querySelectorAll('[data-audit-complete]');
              return auditElements.length > 0;
            }
          },
          {
            id: 'backup-creation',
            title: 'Create System Backup',
            description: 'Create complete backup of current codebase and configuration',
            category: 'preparation',
            priority: 'critical',
            status: 'pending',
            dependencies: [],
            estimatedTime: 30,
            autoCheck: async () => {
              // Check for backup indicators
              return localStorage.getItem('system-backup-created') === 'true';
            }
          },
          {
            id: 'document-breakpoints',
            title: 'Document Existing Breakpoints',
            description: 'List and document all current responsive breakpoints',
            category: 'preparation',
            priority: 'high',
            status: 'pending',
            dependencies: ['code-audit'],
            estimatedTime: 60,
            validationRules: [
              {
                id: 'breakpoints-documented',
                description: 'At least 3 breakpoints should be documented',
                check: async () => {
                  const mediaQueries = Array.from(document.styleSheets)
                    .flatMap(sheet => {
                      try {
                        return Array.from(sheet.cssRules || []);
                      } catch {
                        return [];
                      }
                    })
                    .filter(rule => rule.type === CSSRule.MEDIA_RULE);
                  return mediaQueries.length >= 3;
                }
              }
            ]
          },
          {
            id: 'identify-critical-flows',
            title: 'Identify Critical User Flows',
            description: 'Map out critical user journeys that must not break',
            category: 'preparation',
            priority: 'high',
            status: 'pending',
            dependencies: ['code-audit'],
            estimatedTime: 90
          },
          {
            id: 'browser-support-requirements',
            title: 'Define Browser Support Requirements',
            description: 'Document target browser versions and compatibility needs',
            category: 'preparation',
            priority: 'medium',
            status: 'pending',
            dependencies: [],
            estimatedTime: 45,
            validationRules: [
              {
                id: 'modern-browser-support',
                description: 'Check for modern browser features',
                check: async () => {
                  return CSS.supports('display', 'flex') && CSS.supports('display', 'grid');
                }
              }
            ]
          }
        ]
      },
      {
        id: 'foundation',
        name: 'Safe Responsive Foundation',
        description: 'Implement responsive foundation without breaking existing functionality',
        status: 'not-started',
        completionRate: 0,
        items: [
          {
            id: 'viewport-meta',
            title: 'Add Viewport Meta Tag',
            description: 'Add responsive viewport meta tag to HTML head',
            category: 'foundation',
            priority: 'critical',
            status: 'pending',
            dependencies: ['backup-creation'],
            estimatedTime: 15,
            autoCheck: async () => {
              const viewport = document.querySelector('meta[name="viewport"]');
              return viewport !== null && viewport.getAttribute('content')?.includes('width=device-width');
            }
          },
          {
            id: 'responsive-css-foundation',
            title: 'Include Responsive CSS Foundation',
            description: 'Add foundational responsive CSS without touching existing styles',
            category: 'foundation',
            priority: 'critical',
            status: 'pending',
            dependencies: ['viewport-meta'],
            estimatedTime: 60,
            validationRules: [
              {
                id: 'responsive-base-classes',
                description: 'Responsive base classes should be available',
                check: async () => {
                  const testElement = document.createElement('div');
                  testElement.className = 'responsive-base';
                  document.body.appendChild(testElement);
                  const hasBoxSizing = getComputedStyle(testElement).boxSizing === 'border-box';
                  document.body.removeChild(testElement);
                  return hasBoxSizing;
                }
              }
            ]
          },
          {
            id: 'progressive-enhancement-classes',
            title: 'Add Progressive Enhancement Classes',
            description: 'Create utility classes for gradual enhancement',
            category: 'foundation',
            priority: 'high',
            status: 'pending',
            dependencies: ['responsive-css-foundation'],
            estimatedTime: 45
          },
          {
            id: 'feature-detection',
            title: 'Implement Feature Detection',
            description: 'Add CSS and JavaScript feature detection',
            category: 'foundation',
            priority: 'high',
            status: 'pending',
            dependencies: ['responsive-css-foundation'],
            estimatedTime: 30,
            autoCheck: async () => {
              return document.documentElement.classList.contains('supports-flexbox') ||
                     document.documentElement.classList.contains('supports-grid');
            }
          }
        ]
      },
      {
        id: 'navigation',
        name: 'Non-Breaking Navigation Enhancement',
        description: 'Implement responsive navigation without affecting desktop version',
        status: 'not-started',
        completionRate: 0,
        items: [
          {
            id: 'hamburger-menu-structure',
            title: 'Add Hamburger Menu HTML Structure',
            description: 'Add hamburger button and overlay to navigation',
            category: 'navigation',
            priority: 'critical',
            status: 'pending',
            dependencies: ['progressive-enhancement-classes'],
            estimatedTime: 30,
            autoCheck: async () => {
              const hamburger = document.getElementById('responsive-nav-toggle');
              const overlay = document.getElementById('responsive-nav-overlay');
              return hamburger !== null && overlay !== null;
            }
          },
          {
            id: 'hamburger-menu-css',
            title: 'Apply Hamburger Menu CSS',
            description: 'Add CSS for hamburger menu that only affects mobile',
            category: 'navigation',
            priority: 'critical',
            status: 'pending',
            dependencies: ['hamburger-menu-structure'],
            estimatedTime: 45,
            validationRules: [
              {
                id: 'desktop-nav-preserved',
                description: 'Desktop navigation should remain unchanged',
                check: async () => {
                  const nav = document.querySelector('nav');
                  if (!nav) return false;
                  const style = getComputedStyle(nav);
                  return style.display !== 'none' && style.visibility !== 'hidden';
                }
              }
            ]
          },
          {
            id: 'hamburger-menu-javascript',
            title: 'Implement Hamburger Menu JavaScript',
            description: 'Add safe JavaScript for hamburger menu functionality',
            category: 'navigation',
            priority: 'critical',
            status: 'pending',
            dependencies: ['hamburger-menu-css'],
            estimatedTime: 60,
            autoCheck: async () => {
              return typeof (window as any).safeResponsiveNav === 'object';
            }
          },
          {
            id: 'navigation-accessibility',
            title: 'Ensure Navigation Accessibility',
            description: 'Add ARIA attributes and keyboard navigation support',
            category: 'navigation',
            priority: 'high',
            status: 'pending',
            dependencies: ['hamburger-menu-javascript'],
            estimatedTime: 45,
            validationRules: [
              {
                id: 'aria-attributes-present',
                description: 'Navigation should have proper ARIA attributes',
                check: async () => {
                  const toggle = document.getElementById('responsive-nav-toggle');
                  return toggle?.getAttribute('aria-expanded') !== null &&
                         toggle?.getAttribute('aria-label') !== null;
                }
              }
            ]
          },
          {
            id: 'navigation-testing',
            title: 'Test Navigation Functionality',
            description: 'Comprehensive testing of navigation on different devices',
            category: 'navigation',
            priority: 'high',
            status: 'pending',
            dependencies: ['navigation-accessibility'],
            estimatedTime: 90
          }
        ]
      },
      {
        id: 'migration',
        name: 'Gradual Responsive Migration',
        description: 'Systematically migrate elements to responsive design',
        status: 'not-started',
        completionRate: 0,
        items: [
          {
            id: 'migration-plan',
            title: 'Create Migration Plan',
            description: 'Plan gradual migration of elements from least to most critical',
            category: 'migration',
            priority: 'high',
            status: 'pending',
            dependencies: ['navigation-testing'],
            estimatedTime: 120
          },
          {
            id: 'migrate-images',
            title: 'Make Images Responsive',
            description: 'Apply responsive image techniques without breaking layout',
            category: 'migration',
            priority: 'high',
            status: 'pending',
            dependencies: ['migration-plan'],
            estimatedTime: 60,
            validationRules: [
              {
                id: 'responsive-images-check',
                description: 'Images should be responsive',
                check: async () => {
                  const images = document.querySelectorAll('img');
                  let responsiveCount = 0;
                  images.forEach(img => {
                    const style = getComputedStyle(img);
                    if (style.maxWidth === '100%' || img.hasAttribute('sizes')) {
                      responsiveCount++;
                    }
                  });
                  return images.length === 0 || responsiveCount / images.length >= 0.8;
                }
              }
            ]
          },
          {
            id: 'migrate-typography',
            title: 'Implement Responsive Typography',
            description: 'Apply responsive typography scales and sizes',
            category: 'migration',
            priority: 'medium',
            status: 'pending',
            dependencies: ['migrate-images'],
            estimatedTime: 90
          },
          {
            id: 'migrate-layout-containers',
            title: 'Migrate Layout Containers',
            description: 'Apply responsive containers and grid systems',
            category: 'migration',
            priority: 'high',
            status: 'pending',
            dependencies: ['migrate-typography'],
            estimatedTime: 150
          },
          {
            id: 'migrate-components',
            title: 'Migrate Individual Components',
            description: 'Apply responsive design to forms, buttons, and other components',
            category: 'migration',
            priority: 'medium',
            status: 'pending',
            dependencies: ['migrate-layout-containers'],
            estimatedTime: 180
          }
        ]
      },
      {
        id: 'testing',
        name: 'Comprehensive Testing',
        description: 'Test responsive implementation across devices and browsers',
        status: 'not-started',
        completionRate: 0,
        items: [
          {
            id: 'setup-testing-framework',
            title: 'Setup Testing Framework',
            description: 'Initialize comprehensive responsive testing system',
            category: 'testing',
            priority: 'critical',
            status: 'pending',
            dependencies: ['migrate-components'],
            estimatedTime: 60,
            autoCheck: async () => {
              return typeof (window as any).ResponsiveTestFramework === 'object';
            }
          },
          {
            id: 'run-navigation-tests',
            title: 'Run Navigation Tests',
            description: 'Test hamburger menu and navigation functionality',
            category: 'testing',
            priority: 'critical',
            status: 'pending',
            dependencies: ['setup-testing-framework'],
            estimatedTime: 45
          },
          {
            id: 'run-layout-tests',
            title: 'Run Layout Tests',
            description: 'Test responsive layouts across different viewport sizes',
            category: 'testing',
            priority: 'critical',
            status: 'pending',
            dependencies: ['setup-testing-framework'],
            estimatedTime: 60
          },
          {
            id: 'run-performance-tests',
            title: 'Run Performance Tests',
            description: 'Test performance impact of responsive changes',
            category: 'testing',
            priority: 'high',
            status: 'pending',
            dependencies: ['run-layout-tests'],
            estimatedTime: 90
          },
          {
            id: 'run-accessibility-tests',
            title: 'Run Accessibility Tests',
            description: 'Test accessibility compliance and keyboard navigation',
            category: 'testing',
            priority: 'high',
            status: 'pending',
            dependencies: ['run-navigation-tests'],
            estimatedTime: 75
          },
          {
            id: 'cross-browser-testing',
            title: 'Cross-Browser Testing',
            description: 'Test across target browsers and devices',
            category: 'testing',
            priority: 'high',
            status: 'pending',
            dependencies: ['run-performance-tests', 'run-accessibility-tests'],
            estimatedTime: 120
          }
        ]
      },
      {
        id: 'deployment',
        name: 'Safe Deployment',
        description: 'Deploy responsive features safely with rollback capabilities',
        status: 'not-started',
        completionRate: 0,
        items: [
          {
            id: 'setup-rollback-system',
            title: 'Setup Emergency Rollback System',
            description: 'Initialize rollback system for safe deployment',
            category: 'deployment',
            priority: 'critical',
            status: 'pending',
            dependencies: ['cross-browser-testing'],
            estimatedTime: 45,
            autoCheck: async () => {
              return typeof (window as any).ResponsiveRollback === 'object';
            }
          },
          {
            id: 'create-rollback-point',
            title: 'Create Pre-Deployment Rollback Point',
            description: 'Create rollback point before production deployment',
            category: 'deployment',
            priority: 'critical',
            status: 'pending',
            dependencies: ['setup-rollback-system'],
            estimatedTime: 15
          },
          {
            id: 'canary-deployment',
            title: 'Canary Deployment (10% Users)',
            description: 'Deploy to small percentage of users for testing',
            category: 'deployment',
            priority: 'high',
            status: 'pending',
            dependencies: ['create-rollback-point'],
            estimatedTime: 30
          },
          {
            id: 'monitor-metrics',
            title: 'Monitor Success Metrics',
            description: 'Monitor performance and user behavior metrics',
            category: 'deployment',
            priority: 'critical',
            status: 'pending',
            dependencies: ['canary-deployment'],
            estimatedTime: 60,
            autoCheck: async () => {
              return typeof (window as any).SuccessMetrics === 'object';
            }
          },
          {
            id: 'gradual-rollout',
            title: 'Gradual Rollout (100% Users)',
            description: 'Gradually roll out to all users based on metrics',
            category: 'deployment',
            priority: 'high',
            status: 'pending',
            dependencies: ['monitor-metrics'],
            estimatedTime: 120
          },
          {
            id: 'post-deployment-monitoring',
            title: 'Post-Deployment Monitoring',
            description: 'Continue monitoring for 48 hours after full deployment',
            category: 'deployment',
            priority: 'high',
            status: 'pending',
            dependencies: ['gradual-rollout'],
            estimatedTime: 240
          }
        ]
      }
    ];
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((phases: ChecklistPhase[]): ImplementationStats => {
    const allItems = phases.flatMap(phase => phase.items);
    
    return {
      totalItems: allItems.length,
      completedItems: allItems.filter(item => item.status === 'completed').length,
      inProgressItems: allItems.filter(item => item.status === 'in-progress').length,
      failedItems: allItems.filter(item => item.status === 'failed').length,
      skippedItems: allItems.filter(item => item.status === 'skipped').length,
      totalEstimatedTime: allItems.reduce((sum, item) => sum + item.estimatedTime, 0),
      actualTimeSpent: allItems.reduce((sum, item) => sum + (item.actualTime || 0), 0),
      completionRate: allItems.length > 0 ? 
        (allItems.filter(item => item.status === 'completed').length / allItems.length) * 100 : 0,
      blockedItems: allItems.filter(item => {
        return item.dependencies.some(dep => {
          const depItem = allItems.find(i => i.id === dep);
          return depItem && depItem.status !== 'completed';
        });
      }).length
    };
  }, []);

  // Update phase completion rates
  const updatePhaseCompletionRates = useCallback((phases: ChecklistPhase[]): ChecklistPhase[] => {
    return phases.map(phase => {
      const completedItems = phase.items.filter(item => item.status === 'completed').length;
      const totalItems = phase.items.length;
      const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
      
      let status: ChecklistPhase['status'] = 'not-started';
      if (completionRate === 100) status = 'completed';
      else if (completionRate > 0) status = 'in-progress';
      else if (phase.items.some(item => item.dependencies.some(dep => {
        const depItem = phases.flatMap(p => p.items).find(i => i.id === dep);
        return depItem && depItem.status !== 'completed';
      }))) status = 'blocked';
      
      return { ...phase, completionRate, status };
    });
  }, []);

  // Start item timer
  const startItem = useCallback((itemId: string) => {
    setState(prev => {
      const updatedPhases = prev.phases.map(phase => ({
        ...phase,
        items: phase.items.map(item => 
          item.id === itemId 
            ? { ...item, status: 'in-progress', startTime: Date.now() }
            : item
        )
      }));
      
      return {
        ...prev,
        phases: updatePhaseCompletionRates(updatedPhases),
        stats: calculateStats(updatedPhases)
      };
    });
  }, [updatePhaseCompletionRates, calculateStats]);

  // Complete item
  const completeItem = useCallback(async (itemId: string, notes?: string) => {
    setState(prev => {
      const updatedPhases = prev.phases.map(phase => ({
        ...phase,
        items: phase.items.map(item => {
          if (item.id === itemId) {
            const actualTime = item.startTime ? Date.now() - item.startTime : 0;
            return {
              ...item,
              status: 'completed',
              completedTime: Date.now(),
              actualTime,
              notes
            };
          }
          return item;
        })
      }));
      
      // Add success notification
      const newNotification: ChecklistNotification = {
        id: `notification_${Date.now()}`,
        type: 'success',
        message: `Completed: ${updatedPhases.flatMap(p => p.items).find(i => i.id === itemId)?.title}`,
        timestamp: Date.now(),
        dismissed: false
      };
      
      return {
        ...prev,
        phases: updatePhaseCompletionRates(updatedPhases),
        stats: calculateStats(updatedPhases),
        notifications: [newNotification, ...prev.notifications.slice(0, 9)]
      };
    });
  }, [updatePhaseCompletionRates, calculateStats]);

  // Skip item
  const skipItem = useCallback((itemId: string, reason?: string) => {
    setState(prev => {
      const updatedPhases = prev.phases.map(phase => ({
        ...phase,
        items: phase.items.map(item => 
          item.id === itemId 
            ? { ...item, status: 'skipped', notes: reason }
            : item
        )
      }));
      
      return {
        ...prev,
        phases: updatePhaseCompletionRates(updatedPhases),
        stats: calculateStats(updatedPhases)
      };
    });
  }, [updatePhaseCompletionRates, calculateStats]);

  // Fail item
  const failItem = useCallback((itemId: string, error?: string) => {
    setState(prev => {
      const updatedPhases = prev.phases.map(phase => ({
        ...phase,
        items: phase.items.map(item => 
          item.id === itemId 
            ? { ...item, status: 'failed', notes: error }
            : item
        )
      }));
      
      // Add error notification
      const newNotification: ChecklistNotification = {
        id: `notification_${Date.now()}`,
        type: 'error',
        message: `Failed: ${updatedPhases.flatMap(p => p.items).find(i => i.id === itemId)?.title}`,
        timestamp: Date.now(),
        dismissed: false
      };
      
      return {
        ...prev,
        phases: updatePhaseCompletionRates(updatedPhases),
        stats: calculateStats(updatedPhases),
        notifications: [newNotification, ...prev.notifications.slice(0, 9)]
      };
    });
  }, [updatePhaseCompletionRates, calculateStats]);

  // Auto-check item
  const autoCheckItem = useCallback(async (itemId: string) => {
    const allItems = state.phases.flatMap(phase => phase.items);
    const item = allItems.find(i => i.id === itemId);
    
    if (!item?.autoCheck) return false;
    
    try {
      const result = await item.autoCheck();
      if (result && item.status !== 'completed') {
        completeItem(itemId, 'Auto-completed via validation check');
      }
      return result;
    } catch (error) {
      console.error(`Auto-check failed for ${itemId}:`, error);
      return false;
    }
  }, [state.phases, completeItem]);

  // Validate item
  const validateItem = useCallback(async (itemId: string) => {
    const allItems = state.phases.flatMap(phase => phase.items);
    const item = allItems.find(i => i.id === itemId);
    
    if (!item?.validationRules) return { valid: true, errors: [] };
    
    const errors: string[] = [];
    
    for (const rule of item.validationRules) {
      try {
        const result = await rule.check();
        if (!result) {
          errors.push(rule.errorMessage || rule.description);
        }
      } catch (error) {
        errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }, [state.phases]);

  // Get next available items
  const getNextAvailableItems = useCallback(() => {
    const allItems = state.phases.flatMap(phase => phase.items);
    
    return allItems.filter(item => {
      if (item.status !== 'pending') return false;
      
      // Check if all dependencies are completed
      return item.dependencies.every(depId => {
        const depItem = allItems.find(i => i.id === depId);
        return depItem?.status === 'completed';
      });
    }).sort((a, b) => {
      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [state.phases]);

  // Initialize checklist
  const initialize = useCallback(() => {
    if (state.isActive) return;
    
    console.log('✅ Initializing Implementation Checklist...');
    
    const phases = createChecklistPhases();
    const stats = calculateStats(phases);
    const updatedPhases = updatePhaseCompletionRates(phases);
    
    setState(prev => ({
      ...prev,
      isActive: true,
      phases: updatedPhases,
      currentPhase: updatedPhases[0]?.id || null,
      stats
    }));
    
    // Add welcome notification
    const welcomeNotification: ChecklistNotification = {
      id: `notification_${Date.now()}`,
      type: 'info',
      message: 'Implementation checklist initialized. Ready to begin responsive conversion.',
      timestamp: Date.now(),
      dismissed: false
    };
    
    setState(prev => ({
      ...prev,
      notifications: [welcomeNotification, ...prev.notifications]
    }));
    
  }, [state.isActive, createChecklistPhases, calculateStats, updatePhaseCompletionRates]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setState(prev => ({
      ...prev,
      isActive: false
    }));
    
    console.log('✅ Implementation Checklist cleaned up');
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === notificationId ? { ...n, dismissed: true } : n
      )
    }));
  }, []);

  return {
    isActive: state.isActive,
    phases: state.phases,
    currentPhase: state.currentPhase,
    stats: state.stats,
    notifications: state.notifications.filter(n => !n.dismissed),
    initialize,
    cleanup,
    startItem,
    completeItem,
    skipItem,
    failItem,
    autoCheckItem,
    validateItem,
    getNextAvailableItems,
    dismissNotification,
    setCurrentPhase: (phaseId: string) => setState(prev => ({ ...prev, currentPhase: phaseId }))
  };
}

export default useImplementationChecklist;