"use client";

// Compatibility Safeguards System
// Based on CLAUDE-PART2.md - Ensures backward compatibility and safe responsive implementation

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface BrowserCapabilities {
  flexbox: boolean;
  grid: boolean;
  customProperties: boolean;
  clamp: boolean;
  containerQueries: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  performanceObserver: boolean;
  cssSupportsApi: boolean;
  touchEvents: boolean;
}

interface CompatibilityIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  feature: string;
  description: string;
  impact: string;
  fallback?: string;
  autoFixAvailable: boolean;
  affectedElements: string[];
}

interface SafeguardRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  check: () => boolean;
  fix?: () => void;
  fallback?: () => void;
}

interface CompatibilitySafeguardsState {
  isActive: boolean;
  browserCapabilities: BrowserCapabilities;
  detectedIssues: CompatibilityIssue[];
  appliedFixes: string[];
  safeguardRules: SafeguardRule[];
  monitoring: boolean;
}

export function useCompatibilitySafeguards() {
  const [state, setState] = useState<CompatibilitySafeguardsState>({
    isActive: false,
    browserCapabilities: {
      flexbox: false,
      grid: false,
      customProperties: false,
      clamp: false,
      containerQueries: false,
      intersectionObserver: false,
      resizeObserver: false,
      performanceObserver: false,
      cssSupportsApi: false,
      touchEvents: false
    },
    detectedIssues: [],
    appliedFixes: [],
    safeguardRules: [],
    monitoring: false
  });

  const monitoringRef = useRef<{
    mutationObserver?: MutationObserver;
    resizeObserver?: ResizeObserver;
    performanceObserver?: PerformanceObserver;
  }>({});

  // Detect browser capabilities
  const detectBrowserCapabilities = useCallback((): BrowserCapabilities => {
    const capabilities: BrowserCapabilities = {
      flexbox: CSS.supports('display', 'flex'),
      grid: CSS.supports('display', 'grid'),
      customProperties: CSS.supports('color', 'var(--test)'),
      clamp: CSS.supports('width', 'clamp(1rem, 5vw, 3rem)'),
      containerQueries: CSS.supports('container-type', 'inline-size'),
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,
      cssSupportsApi: 'CSS' in window && 'supports' in CSS,
      touchEvents: 'ontouchstart' in window
    };

    // Add feature classes to document
    Object.entries(capabilities).forEach(([feature, supported]) => {
      const className = supported ? `supports-${feature}` : `no-${feature}`;
      document.documentElement.classList.add(className);
    });

    return capabilities;
  }, []);

  // Define safeguard rules
  const createSafeguardRules = useCallback((): SafeguardRule[] => {
    return [
      {
        id: 'flexbox-fallback',
        name: 'Flexbox Fallback',
        description: 'Provides float/inline-block fallbacks for flexbox layouts',
        enabled: true,
        check: () => !state.browserCapabilities.flexbox,
        fix: () => {
          const flexElements = document.querySelectorAll('[class*="flex"], .d-flex');
          flexElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            htmlElement.style.display = 'block';
            htmlElement.style.overflow = 'hidden';
            
            const children = htmlElement.children;
            Array.from(children).forEach((child, index) => {
              const childElement = child as HTMLElement;
              childElement.style.float = 'left';
              childElement.style.marginRight = '1rem';
              if (index === children.length - 1) {
                childElement.style.marginRight = '0';
              }
            });
          });
        }
      },
      {
        id: 'grid-fallback',
        name: 'CSS Grid Fallback',
        description: 'Provides flexbox/float fallbacks for CSS Grid layouts',
        enabled: true,
        check: () => !state.browserCapabilities.grid,
        fix: () => {
          const gridElements = document.querySelectorAll('[class*="grid"], .d-grid');
          gridElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            htmlElement.style.display = 'flex';
            htmlElement.style.flexWrap = 'wrap';
            htmlElement.style.gap = '1rem';
            
            const children = htmlElement.children;
            Array.from(children).forEach(child => {
              const childElement = child as HTMLElement;
              childElement.style.flex = '1 1 250px';
            });
          });
        }
      },
      {
        id: 'custom-properties-fallback',
        name: 'CSS Custom Properties Fallback',
        description: 'Provides static values for CSS custom properties',
        enabled: true,
        check: () => !state.browserCapabilities.customProperties,
        fix: () => {
          const style = document.createElement('style');
          style.textContent = `
            /* CSS Custom Properties Fallbacks */
            .responsive-container { max-width: 1200px; }
            .responsive-spacing { padding: 1rem; }
            .responsive-text { font-size: 1rem; }
            .primary-color { color: #007bff; }
            .secondary-color { color: #6c757d; }
          `;
          document.head.appendChild(style);
        }
      },
      {
        id: 'clamp-fallback',
        name: 'CSS Clamp Fallback',
        description: 'Provides media query fallbacks for clamp() function',
        enabled: true,
        check: () => !state.browserCapabilities.clamp,
        fix: () => {
          const style = document.createElement('style');
          style.textContent = `
            /* Clamp Fallbacks */
            .responsive-text { font-size: 0.875rem; }
            .responsive-spacing { padding: 1rem; }
            .responsive-margin { margin: 1rem; }
            
            @media (min-width: 768px) {
              .responsive-text { font-size: 1rem; }
              .responsive-spacing { padding: 1.5rem; }
              .responsive-margin { margin: 1.5rem; }
            }
            
            @media (min-width: 1200px) {
              .responsive-text { font-size: 1.125rem; }
              .responsive-spacing { padding: 2rem; }
              .responsive-margin { margin: 2rem; }
            }
          `;
          document.head.appendChild(style);
        }
      },
      {
        id: 'intersection-observer-fallback',
        name: 'Intersection Observer Fallback',
        description: 'Provides scroll event fallbacks for Intersection Observer',
        enabled: true,
        check: () => !state.browserCapabilities.intersectionObserver,
        fix: () => {
          // Simple scroll-based animation fallback
          const animatedElements = document.querySelectorAll('[data-animate-on-scroll]');
          
          const checkVisibility = () => {
            animatedElements.forEach(element => {
              const rect = element.getBoundingClientRect();
              const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
              
              if (isVisible) {
                element.classList.add('animated-in');
              }
            });
          };
          
          window.addEventListener('scroll', checkVisibility);
          checkVisibility(); // Initial check
        }
      },
      {
        id: 'touch-events-enhancement',
        name: 'Touch Events Enhancement',
        description: 'Enhances touch interactions when touch events are available',
        enabled: true,
        check: () => state.browserCapabilities.touchEvents,
        fix: () => {
          const style = document.createElement('style');
          style.textContent = `
            /* Touch-friendly enhancements */
            .supports-touch button,
            .supports-touch a,
            .supports-touch input,
            .supports-touch select {
              min-height: 44px;
              min-width: 44px;
            }
            
            .supports-touch .responsive-nav-toggle {
              padding: 12px;
            }
            
            .supports-touch .nav-link {
              padding: 12px 16px;
            }
          `;
          document.head.appendChild(style);
        }
      },
      {
        id: 'ie11-compatibility',
        name: 'Internet Explorer 11 Compatibility',
        description: 'Provides compatibility fixes for IE11',
        enabled: true,
        check: () => navigator.userAgent.indexOf('Trident') > -1,
        fix: () => {
          const style = document.createElement('style');
          style.textContent = `
            /* IE11 Compatibility */
            .responsive-grid {
              display: -ms-flexbox;
              display: flex;
              -ms-flex-wrap: wrap;
              flex-wrap: wrap;
            }
            
            .responsive-grid > * {
              -ms-flex: 1 1 250px;
              flex: 1 1 250px;
              margin: 0.5rem;
            }
            
            .responsive-container {
              -ms-box-sizing: border-box;
              box-sizing: border-box;
            }
            
            /* IE11 Object-fit fallback */
            .responsive-image {
              width: 100%;
              height: auto;
            }
          `;
          document.head.appendChild(style);
        }
      },
      {
        id: 'reduced-motion',
        name: 'Reduced Motion Respect',
        description: 'Respects user preference for reduced motion',
        enabled: true,
        check: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        fix: () => {
          const style = document.createElement('style');
          style.textContent = `
            @media (prefers-reduced-motion: reduce) {
              *,
              *::before,
              *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
              }
            }
          `;
          document.head.appendChild(style);
        }
      }
    ];
  }, [state.browserCapabilities]);

  // Analyze compatibility issues
  const analyzeCompatibility = useCallback(() => {
    const issues: CompatibilityIssue[] = [];
    const capabilities = state.browserCapabilities;

    // Check for flexbox issues
    if (!capabilities.flexbox) {
      const flexElements = document.querySelectorAll('[class*="flex"], .d-flex');
      if (flexElements.length > 0) {
        issues.push({
          id: 'flexbox-not-supported',
          severity: 'high',
          feature: 'Flexbox',
          description: 'Flexbox is not supported in this browser',
          impact: 'Layout may break or appear incorrectly',
          fallback: 'Float/inline-block layout will be used instead',
          autoFixAvailable: true,
          affectedElements: Array.from(flexElements).map(el => el.tagName.toLowerCase())
        });
      }
    }

    // Check for grid issues
    if (!capabilities.grid) {
      const gridElements = document.querySelectorAll('[class*="grid"], .d-grid');
      if (gridElements.length > 0) {
        issues.push({
          id: 'grid-not-supported',
          severity: 'medium',
          feature: 'CSS Grid',
          description: 'CSS Grid is not supported in this browser',
          impact: 'Grid layouts will not display correctly',
          fallback: 'Flexbox layout will be used instead',
          autoFixAvailable: true,
          affectedElements: Array.from(gridElements).map(el => el.tagName.toLowerCase())
        });
      }
    }

    // Check for custom properties issues
    if (!capabilities.customProperties) {
      const elementsWithVars = document.querySelectorAll('[style*="var("], [class*="var-"]');
      if (elementsWithVars.length > 0) {
        issues.push({
          id: 'custom-properties-not-supported',
          severity: 'medium',
          feature: 'CSS Custom Properties',
          description: 'CSS Custom Properties (variables) are not supported',
          impact: 'Theming and dynamic styles may not work',
          fallback: 'Static CSS values will be used instead',
          autoFixAvailable: true,
          affectedElements: Array.from(elementsWithVars).map(el => el.tagName.toLowerCase())
        });
      }
    }

    // Check for clamp function issues
    if (!capabilities.clamp) {
      const elementsWithClamp = document.querySelectorAll('[style*="clamp("]');
      if (elementsWithClamp.length > 0) {
        issues.push({
          id: 'clamp-not-supported',
          severity: 'low',
          feature: 'CSS Clamp Function',
          description: 'CSS clamp() function is not supported',
          impact: 'Responsive typography and spacing may not scale smoothly',
          fallback: 'Media queries will be used for responsive scaling',
          autoFixAvailable: true,
          affectedElements: Array.from(elementsWithClamp).map(el => el.tagName.toLowerCase())
        });
      }
    }

    // Check for Intersection Observer issues
    if (!capabilities.intersectionObserver) {
      const elementsWithScrollAnimation = document.querySelectorAll('[data-animate-on-scroll]');
      if (elementsWithScrollAnimation.length > 0) {
        issues.push({
          id: 'intersection-observer-not-supported',
          severity: 'low',
          feature: 'Intersection Observer',
          description: 'Intersection Observer API is not supported',
          impact: 'Scroll-based animations may not work efficiently',
          fallback: 'Scroll event listeners will be used instead',
          autoFixAvailable: true,
          affectedElements: Array.from(elementsWithScrollAnimation).map(el => el.tagName.toLowerCase())
        });
      }
    }

    // Check for performance issues
    if (!capabilities.performanceObserver) {
      issues.push({
        id: 'performance-observer-not-supported',
        severity: 'low',
        feature: 'Performance Observer',
        description: 'Performance Observer API is not supported',
        impact: 'Performance monitoring will be limited',
        fallback: 'Basic performance.now() timing will be used',
        autoFixAvailable: false,
        affectedElements: []
      });
    }

    setState(prev => ({ ...prev, detectedIssues: issues }));
    return issues;
  }, [state.browserCapabilities]);

  // Apply safeguard fixes
  const applySafeguards = useCallback(() => {
    const rules = state.safeguardRules;
    const appliedFixes: string[] = [];

    rules.forEach(rule => {
      if (rule.enabled && rule.check()) {
        try {
          rule.fix?.();
          appliedFixes.push(rule.id);
          console.log(`✅ Applied safeguard: ${rule.name}`);
        } catch (error) {
          console.error(`❌ Failed to apply safeguard ${rule.name}:`, error);
        }
      }
    });

    setState(prev => ({ ...prev, appliedFixes }));
    return appliedFixes;
  }, [state.safeguardRules]);

  // Setup monitoring
  const setupMonitoring = useCallback(() => {
    if (state.monitoring) return;

    // Monitor DOM mutations for new responsive elements
    if ('MutationObserver' in window) {
      const mutationObserver = new MutationObserver((mutations) => {
        let hasResponsiveChanges = false;

        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.className && 
                    (element.className.includes('responsive') || 
                     element.className.includes('flex') ||
                     element.className.includes('grid'))) {
                  hasResponsiveChanges = true;
                }
              }
            });
          }
        });

        if (hasResponsiveChanges) {
          // Re-analyze and apply safeguards for new elements
          setTimeout(() => {
            analyzeCompatibility();
            applySafeguards();
          }, 100);
        }
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      monitoringRef.current.mutationObserver = mutationObserver;
    }

    // Monitor viewport changes
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        // Check if any responsive elements need safeguard updates
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (element.className.includes('responsive')) {
            // Re-apply safeguards if needed
            applySafeguards();
          }
        });
      });

      const responsiveElements = document.querySelectorAll('[class*="responsive"]');
      responsiveElements.forEach(element => {
        resizeObserver.observe(element);
      });

      monitoringRef.current.resizeObserver = resizeObserver;
    }

    setState(prev => ({ ...prev, monitoring: true }));
  }, [state.monitoring, analyzeCompatibility, applySafeguards]);

  // Initialize safeguards
  const initialize = useCallback(() => {
    if (state.isActive) return;

    console.log('🛡️ Initializing Compatibility Safeguards...');

    // Detect browser capabilities
    const capabilities = detectBrowserCapabilities();
    
    // Create safeguard rules
    const rules = createSafeguardRules();

    setState(prev => ({
      ...prev,
      isActive: true,
      browserCapabilities: capabilities,
      safeguardRules: rules
    }));

    // Analyze compatibility after state update
    setTimeout(() => {
      analyzeCompatibility();
      applySafeguards();
      setupMonitoring();
    }, 100);

  }, [state.isActive, detectBrowserCapabilities, createSafeguardRules, analyzeCompatibility, applySafeguards, setupMonitoring]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Disconnect observers
    Object.values(monitoringRef.current).forEach(observer => {
      observer?.disconnect();
    });

    setState(prev => ({
      ...prev,
      isActive: false,
      monitoring: false
    }));

    console.log('🛡️ Compatibility Safeguards cleaned up');
  }, []);

  // Auto-fix detected issues
  const autoFixIssues = useCallback(() => {
    const fixableIssues = state.detectedIssues.filter(issue => issue.autoFixAvailable);
    let fixedCount = 0;

    fixableIssues.forEach(issue => {
      const rule = state.safeguardRules.find(r => r.id.includes(issue.feature.toLowerCase().replace(/\s+/g, '-')));
      if (rule && rule.fix) {
        try {
          rule.fix();
          fixedCount++;
        } catch (error) {
          console.error(`Failed to auto-fix ${issue.feature}:`, error);
        }
      }
    });

    console.log(`✅ Auto-fixed ${fixedCount} compatibility issues`);
    return fixedCount;
  }, [state.detectedIssues, state.safeguardRules]);

  // Get compatibility report
  const getCompatibilityReport = useCallback(() => {
    return {
      browserCapabilities: state.browserCapabilities,
      detectedIssues: state.detectedIssues,
      appliedFixes: state.appliedFixes,
      safeguardRules: state.safeguardRules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        enabled: rule.enabled,
        applicable: rule.check()
      }))
    };
  }, [state]);

  return {
    isActive: state.isActive,
    browserCapabilities: state.browserCapabilities,
    detectedIssues: state.detectedIssues,
    appliedFixes: state.appliedFixes,
    safeguardRules: state.safeguardRules,
    monitoring: state.monitoring,
    initialize,
    cleanup,
    analyzeCompatibility,
    applySafeguards,
    autoFixIssues,
    getCompatibilityReport
  };
}

export default useCompatibilitySafeguards;