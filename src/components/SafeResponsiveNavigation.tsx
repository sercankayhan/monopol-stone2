"use client";

// Safe Responsive Navigation Component
// Based on CLAUDE.md Part 1 - Non-breaking implementation that enhances existing navigation

import { useEffect, useState, useRef } from 'react';

interface SafeResponsiveNavigationProps {
  children?: React.ReactNode;
  className?: string;
}

export default function SafeResponsiveNavigation({ children, className = '' }: SafeResponsiveNavigationProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const healthChecks = useRef({
    layoutThrashing: 0,
    jsErrors: 0,
    performanceIssues: 0
  });

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe initialization that doesn't break existing functionality
  useEffect(() => {
    if (!isClient || isInitialized) return;

    const navToggle = document.getElementById('responsive-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('responsive-nav-overlay');

    // Only initialize if elements exist (safe check)
    if (navToggle && navMenu) {
      initializeSafeNavigation(navToggle, navMenu, navOverlay);
      setIsInitialized(true);
      console.log('🍔 Safe responsive navigation initialized');
    }
  }, [isClient, isInitialized]);

  const initializeSafeNavigation = (
    navToggle: HTMLElement,
    navMenu: HTMLElement,
    navOverlay: HTMLElement | null
  ) => {
    // Add necessary CSS classes without breaking existing ones
    if (!navMenu.classList.contains('existing-nav-preserved')) {
      navMenu.classList.add('existing-nav-preserved');
    }

    // Set initial ARIA states
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'nav-menu');
    if (navMenu) {
      navMenu.setAttribute('aria-hidden', 'false'); // Don't hide on desktop
    }

    // Bind safe event listeners
    bindSafeEvents(navToggle, navMenu, navOverlay);
    
    // Setup health monitoring
    setupHealthMonitoring();
  };

  const bindSafeEvents = (
    navToggle: HTMLElement,
    navMenu: HTMLElement,
    navOverlay: HTMLElement | null
  ) => {
    // Toggle button click handler
    const toggleHandler = (e: Event) => {
      e.preventDefault();
      toggleMenu(navToggle, navMenu, navOverlay);
    };

    // Overlay click handler
    const overlayHandler = () => {
      closeMenu(navToggle, navMenu, navOverlay);
    };

    // Escape key handler
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu(navToggle, navMenu, navOverlay);
      }
    };

    // Safe resize handler with debounce
    let resizeTimeout: NodeJS.Timeout;
    const resizeHandler = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth > 767 && isOpen) {
          closeMenu(navToggle, navMenu, navOverlay);
        }
      }, 250);
    };

    // Navigation link handlers (close menu on mobile)
    const navLinks = navMenu.querySelectorAll('a');
    const linkHandlers = Array.from(navLinks).map(link => {
      const handler = () => {
        if (window.innerWidth <= 767 && isOpen) {
          closeMenu(navToggle, navMenu, navOverlay);
        }
      };
      link.addEventListener('click', handler);
      return { element: link, handler };
    });

    // Attach event listeners
    navToggle.addEventListener('click', toggleHandler);
    if (navOverlay) {
      navOverlay.addEventListener('click', overlayHandler);
    }
    document.addEventListener('keydown', escapeHandler);
    window.addEventListener('resize', resizeHandler);

    // Cleanup function (stored for potential future use)
    const cleanup = () => {
      navToggle.removeEventListener('click', toggleHandler);
      if (navOverlay) {
        navOverlay.removeEventListener('click', overlayHandler);
      }
      document.removeEventListener('keydown', escapeHandler);
      window.removeEventListener('resize', resizeHandler);
      
      linkHandlers.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
      });
    };

    // Store cleanup function globally for emergency rollback
    if (typeof window !== 'undefined') {
      (window as any).safeResponsiveNavCleanup = cleanup;
    }
  };

  const toggleMenu = (
    navToggle: HTMLElement,
    navMenu: HTMLElement,
    navOverlay: HTMLElement | null
  ) => {
    if (isOpen) {
      closeMenu(navToggle, navMenu, navOverlay);
    } else {
      openMenu(navToggle, navMenu, navOverlay);
    }
  };

  const openMenu = (
    navToggle: HTMLElement,
    navMenu: HTMLElement,
    navOverlay: HTMLElement | null
  ) => {
    // Add active classes
    navToggle.classList.add('active');
    navMenu.classList.add('responsive-active');
    if (navOverlay) {
      navOverlay.classList.add('active');
      (navOverlay as HTMLElement).style.display = 'block';
    }

    // Prevent body scroll
    document.body.classList.add('responsive-nav-open');

    setIsOpen(true);

    // Update ARIA
    navToggle.setAttribute('aria-expanded', 'true');
    if (navMenu) {
      navMenu.setAttribute('aria-hidden', 'false');
    }

    // Focus management
    setTimeout(() => {
      const firstLink = navMenu.querySelector('a');
      if (firstLink) {
        (firstLink as HTMLElement).focus();
      }
    }, 300);
  };

  const closeMenu = (
    navToggle: HTMLElement,
    navMenu: HTMLElement,
    navOverlay: HTMLElement | null
  ) => {
    // Remove active classes
    navToggle.classList.remove('active');
    navMenu.classList.remove('responsive-active');
    if (navOverlay) {
      navOverlay.classList.remove('active');
      // Hide after transition
      setTimeout(() => {
        if (!navOverlay.classList.contains('active')) {
          (navOverlay as HTMLElement).style.display = 'none';
        }
      }, 300);
    }

    // Restore body scroll
    document.body.classList.remove('responsive-nav-open');

    setIsOpen(false);

    // Update ARIA
    navToggle.setAttribute('aria-expanded', 'false');

    // Return focus
    navToggle.focus();
  };

  const setupHealthMonitoring = () => {
    // Monitor for issues that might require rollback
    let resizeCount = 0;
    const resizeStart = Date.now();

    // Monitor resize events (potential layout thrashing)
    const resizeMonitor = () => {
      resizeCount++;
      setTimeout(() => {
        if (resizeCount > 10 && Date.now() - resizeStart < 1000) {
          healthChecks.current.layoutThrashing++;
          console.warn('⚠️ Layout thrashing detected in responsive navigation');
        }
        resizeCount = 0;
      }, 1000);
    };

    // Monitor JavaScript errors
    const errorMonitor = (event: ErrorEvent) => {
      if (event.filename && event.filename.includes('responsive')) {
        healthChecks.current.jsErrors++;
        console.error('⚠️ Responsive JavaScript error detected:', event.error);
      }
    };

    // Attach monitoring
    window.addEventListener('resize', resizeMonitor);
    window.addEventListener('error', errorMonitor);

    // Auto-rollback on critical issues
    const healthCheckInterval = setInterval(() => {
      if (shouldAutoRollback()) {
        console.warn('🚨 Auto-rollback triggered due to system health issues');
        executeEmergencyRollback();
        clearInterval(healthCheckInterval);
      }
    }, 30000); // Check every 30 seconds

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', resizeMonitor);
      window.removeEventListener('error', errorMonitor);
      clearInterval(healthCheckInterval);
    };
  };

  const shouldAutoRollback = () => {
    return healthChecks.current.layoutThrashing > 5 ||
           healthChecks.current.jsErrors > 3 ||
           healthChecks.current.performanceIssues > 10;
  };

  const executeEmergencyRollback = () => {
    // Emergency rollback function
    const cleanup = (window as any).safeResponsiveNavCleanup;
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
    }

    // Remove added classes
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('responsive-nav-toggle');

    if (navMenu) {
      navMenu.classList.remove('existing-nav-preserved', 'responsive-active');
    }

    if (navToggle) {
      navToggle.classList.remove('active');
    }

    document.body.classList.remove('responsive-nav-open');

    console.log('🔄 Emergency rollback completed');
  };

  // Global access for debugging/control
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ResponsiveNav = {
        init: () => setIsInitialized(false), // Trigger re-initialization
        getHealthStatus: () => healthChecks.current,
        executeRollback: executeEmergencyRollback
      };
    }
  }, []);

  return (
    <div className={`safe-responsive-navigation ${className}`}>
      {children}
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: '#333', color: 'white', padding: '5px', fontSize: '12px', zIndex: 10000 }}>
          Safe Nav: {isInitialized ? '✅' : '⏳'} | Open: {isOpen ? '🔓' : '🔒'}
        </div>
      )}
    </div>
  );
}

// Feature Detection Utility
export const detectResponsiveFeatures = () => {
  if (typeof window === 'undefined') return {};

  return {
    // CSS Feature Detection
    grid: CSS.supports('display', 'grid'),
    flexbox: CSS.supports('display', 'flex'),
    clamp: CSS.supports('width', 'clamp(1rem, 5vw, 3rem)'),
    customProperties: CSS.supports('color', 'var(--test)'),
    containerQueries: CSS.supports('container-type', 'inline-size'),

    // Device Capabilities
    touch: 'ontouchstart' in window,
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,

    // Performance APIs
    performanceObserver: 'PerformanceObserver' in window,
    memory: !!(performance as any).memory,
  };
};

// Progressive Enhancement Helper
export const applyProgressiveEnhancement = () => {
  if (typeof window === 'undefined') return;

  const features = detectResponsiveFeatures();

  // Add feature classes to document
  Object.keys(features).forEach(feature => {
    const supported = features[feature as keyof typeof features];
    if (supported) {
      document.documentElement.classList.add(`supports-${feature}`);
    } else {
      document.documentElement.classList.add(`no-${feature}`);
    }
  });

  console.log('🔧 Progressive enhancement features detected:', features);
};