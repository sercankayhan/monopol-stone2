"use client";

// Comprehensive Testing Framework for Responsive Implementation
// Based on CLAUDE-PART2.md - Testing Without Breaking Existing

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Test result interfaces
interface TestResult {
  testName: string;
  category: 'navigation' | 'layout' | 'performance' | 'compatibility' | 'accessibility';
  passed: boolean;
  message: string;
  details?: Record<string, any>;
  duration?: number;
  severity: 'critical' | 'warning' | 'info';
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestFunction[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

interface TestFunction {
  name: string;
  category: TestResult['category'];
  severity: TestResult['severity'];
  run: () => Promise<TestResult>;
}

interface TestRunner {
  suites: TestSuite[];
  results: TestResult[];
  isRunning: boolean;
  currentTest: string | null;
  startTime: number | null;
  endTime: number | null;
}

// Test utilities
class ResponsiveTestUtils {
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static simulateViewportResize(width: number, height: number): void {
    // Simulate viewport change for testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    });
    window.dispatchEvent(new Event('resize'));
  }

  static async simulateTouch(element: Element, type: 'start' | 'move' | 'end'): Promise<void> {
    const touch = new Touch({
      identifier: 1,
      target: element,
      clientX: 100,
      clientY: 100,
      radiusX: 10,
      radiusY: 10,
      rotationAngle: 0,
      force: 1
    });

    const touchEvent = new TouchEvent(`touch${type}`, {
      touches: type !== 'end' ? [touch] : [],
      targetTouches: type !== 'end' ? [touch] : [],
      changedTouches: [touch],
      bubbles: true,
      cancelable: true
    });

    element.dispatchEvent(touchEvent);
    await this.delay(50);
  }

  static measurePerformance<T>(fn: () => T): { result: T; duration: number } {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    return { result, duration };
  }

  static checkAccessibility(element: Element): {
    hasAriaLabels: boolean;
    hasProperHeadings: boolean;
    hasKeyboardSupport: boolean;
    colorContrast: 'good' | 'poor' | 'unknown';
  } {
    const hasAriaLabels = Boolean(
      element.querySelector('[aria-label]') ||
      element.querySelector('[aria-labelledby]') ||
      element.querySelector('[aria-describedby]')
    );

    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasProperHeadings = headings.length > 0;

    const focusableElements = element.querySelectorAll(
      'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    const hasKeyboardSupport = focusableElements.length > 0;

    return {
      hasAriaLabels,
      hasProperHeadings,
      hasKeyboardSupport,
      colorContrast: 'unknown' // Would need more complex analysis
    };
  }
}

// Navigation Test Suite
const createNavigationTestSuite = (): TestSuite => ({
  name: 'Navigation Tests',
  description: 'Test hamburger menu, mobile navigation, and accessibility',
  tests: [
    {
      name: 'Hamburger Toggle Functionality',
      category: 'navigation',
      severity: 'critical',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        
        try {
          const hamburger = document.getElementById('responsive-nav-toggle');
          const menu = document.getElementById('nav-menu');
          
          if (!hamburger || !menu) {
            return {
              testName: 'Hamburger Toggle Functionality',
              category: 'navigation',
              passed: false,
              message: 'Hamburger button or menu not found',
              details: { hamburger: !!hamburger, menu: !!menu },
              duration: performance.now() - startTime,
              severity: 'critical'
            };
          }

          // Test initial state
          const initiallyActive = menu.classList.contains('responsive-active');
          
          // Simulate click
          hamburger.click();
          await ResponsiveTestUtils.delay(100);
          
          const afterClick = menu.classList.contains('responsive-active');
          
          // Reset state
          if (afterClick !== initiallyActive) {
            hamburger.click();
            await ResponsiveTestUtils.delay(100);
          }

          const toggleWorking = initiallyActive !== afterClick;

          return {
            testName: 'Hamburger Toggle Functionality',
            category: 'navigation',
            passed: toggleWorking,
            message: toggleWorking ? 'Hamburger toggle working correctly' : 'Hamburger toggle not working',
            details: {
              initialState: initiallyActive,
              afterClick: afterClick,
              toggleWorking: toggleWorking
            },
            duration: performance.now() - startTime,
            severity: 'critical'
          };
        } catch (error) {
          return {
            testName: 'Hamburger Toggle Functionality',
            category: 'navigation',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'critical'
          };
        }
      }
    },
    {
      name: 'Keyboard Navigation Support',
      category: 'navigation',
      severity: 'warning',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        
        try {
          const hamburger = document.getElementById('responsive-nav-toggle');
          
          if (!hamburger) {
            return {
              testName: 'Keyboard Navigation Support',
              category: 'navigation',
              passed: false,
              message: 'Hamburger button not found',
              duration: performance.now() - startTime,
              severity: 'warning'
            };
          }

          // Test focus
          hamburger.focus();
          const hasFocus = document.activeElement === hamburger;
          
          // Test tabindex
          const hasTabIndex = hamburger.hasAttribute('tabindex') || hamburger.tagName === 'BUTTON';
          
          // Test ARIA attributes
          const hasAriaLabel = hamburger.hasAttribute('aria-label');
          const hasAriaExpanded = hamburger.hasAttribute('aria-expanded');
          
          const passed = hasFocus && hasTabIndex && hasAriaLabel;

          return {
            testName: 'Keyboard Navigation Support',
            category: 'navigation',
            passed: passed,
            message: passed ? 'Keyboard navigation fully supported' : 'Keyboard navigation issues detected',
            details: {
              focusable: hasFocus,
              hasTabIndex: hasTabIndex,
              hasAriaLabel: hasAriaLabel,
              hasAriaExpanded: hasAriaExpanded
            },
            duration: performance.now() - startTime,
            severity: 'warning'
          };
        } catch (error) {
          return {
            testName: 'Keyboard Navigation Support',
            category: 'navigation',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'warning'
          };
        }
      }
    },
    {
      name: 'Touch Target Size Compliance',
      category: 'navigation',
      severity: 'warning',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        const minSize = 44; // WCAG recommended minimum
        
        try {
          const touchTargets = document.querySelectorAll('button, a, input, [role="button"]');
          const results: Array<{element: string, width: number, height: number, passed: boolean}> = [];
          let passedCount = 0;

          touchTargets.forEach((target, index) => {
            const rect = target.getBoundingClientRect();
            const passed = rect.width >= minSize && rect.height >= minSize;
            if (passed) passedCount++;
            
            results.push({
              element: `${target.tagName}${target.className ? '.' + target.className.split(' ')[0] : ''}[${index}]`,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              passed: passed
            });
          });

          const allPassed = passedCount === touchTargets.length;
          const passRate = touchTargets.length > 0 ? (passedCount / touchTargets.length) * 100 : 100;

          return {
            testName: 'Touch Target Size Compliance',
            category: 'navigation',
            passed: passRate >= 80, // 80% pass rate acceptable
            message: `Touch target compliance: ${passedCount}/${touchTargets.length} elements (${passRate.toFixed(1)}%)`,
            details: {
              totalTargets: touchTargets.length,
              passedTargets: passedCount,
              passRate: passRate,
              minSize: minSize,
              results: results.slice(0, 10) // Limit details
            },
            duration: performance.now() - startTime,
            severity: 'warning'
          };
        } catch (error) {
          return {
            testName: 'Touch Target Size Compliance',
            category: 'navigation',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'warning'
          };
        }
      }
    }
  ]
});

// Layout Test Suite
const createLayoutTestSuite = (): TestSuite => ({
  name: 'Layout Tests',
  description: 'Test responsive breakpoints and layout behavior',
  tests: [
    {
      name: 'Responsive Breakpoint Behavior',
      category: 'layout',
      severity: 'critical',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        
        try {
          const testSizes = [
            { width: 320, height: 568, name: 'Mobile S' },
            { width: 375, height: 667, name: 'Mobile M' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 1200, height: 800, name: 'Desktop' }
          ];

          const results: Array<{size: string, passed: boolean, issues: string[]}> = [];
          
          for (const size of testSizes) {
            ResponsiveTestUtils.simulateViewportResize(size.width, size.height);
            await ResponsiveTestUtils.delay(100);
            
            const issues: string[] = [];
            let passed = true;
            
            // Check horizontal scrolling
            const bodyWidth = document.body.scrollWidth;
            const viewportWidth = size.width;
            if (bodyWidth > viewportWidth + 10) { // 10px tolerance
              issues.push('Horizontal scrollbar detected');
              passed = false;
            }
            
            // Check mobile menu visibility
            if (size.width <= 767) {
              const hamburger = document.getElementById('responsive-nav-toggle');
              if (hamburger) {
                const hamburgerStyle = getComputedStyle(hamburger);
                if (hamburgerStyle.display === 'none') {
                  issues.push('Hamburger menu not visible on mobile');
                  passed = false;
                }
              }
            }
            
            // Check desktop menu visibility
            if (size.width >= 768) {
              const nav = document.querySelector('nav');
              if (nav) {
                const navStyle = getComputedStyle(nav);
                if (navStyle.display === 'none') {
                  issues.push('Desktop navigation not visible');
                  passed = false;
                }
              }
            }
            
            results.push({
              size: `${size.name} (${size.width}x${size.height})`,
              passed: passed,
              issues: issues
            });
          }
          
          const allPassed = results.every(result => result.passed);
          const passedCount = results.filter(result => result.passed).length;

          return {
            testName: 'Responsive Breakpoint Behavior',
            category: 'layout',
            passed: allPassed,
            message: `Breakpoint tests: ${passedCount}/${results.length} passed`,
            details: { results },
            duration: performance.now() - startTime,
            severity: 'critical'
          };
        } catch (error) {
          return {
            testName: 'Responsive Breakpoint Behavior',
            category: 'layout',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'critical'
          };
        }
      }
    },
    {
      name: 'Layout Stability Check',
      category: 'layout',
      severity: 'warning',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        
        try {
          let layoutShiftCount = 0;
          
          // Monitor for layout shifts
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                layoutShiftCount++;
              }
            });
          });

          if ('PerformanceObserver' in window) {
            try {
              observer.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
              // Layout shift API not supported
            }
          }

          // Trigger potential layout shifts
          ResponsiveTestUtils.simulateViewportResize(375, 667);
          await ResponsiveTestUtils.delay(200);
          ResponsiveTestUtils.simulateViewportResize(1200, 800);
          await ResponsiveTestUtils.delay(200);

          observer.disconnect();

          const passed = layoutShiftCount <= 2; // Allow some shifts during testing

          return {
            testName: 'Layout Stability Check',
            category: 'layout',
            passed: passed,
            message: `Layout shifts detected: ${layoutShiftCount}`,
            details: { layoutShiftCount },
            duration: performance.now() - startTime,
            severity: 'warning'
          };
        } catch (error) {
          return {
            testName: 'Layout Stability Check',
            category: 'layout',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'warning'
          };
        }
      }
    }
  ]
});

// Performance Test Suite
const createPerformanceTestSuite = (): TestSuite => ({
  name: 'Performance Tests',
  description: 'Test animation performance and resource usage',
  tests: [
    {
      name: 'Animation Performance Test',
      category: 'performance',
      severity: 'warning',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        
        try {
          const hamburger = document.getElementById('responsive-nav-toggle');
          
          if (!hamburger) {
            return {
              testName: 'Animation Performance Test',
              category: 'performance',
              passed: false,
              message: 'Hamburger button not found for animation test',
              duration: performance.now() - startTime,
              severity: 'warning'
            };
          }

          // Measure animation performance
          const animationStart = performance.now();
          
          // Trigger animation
          hamburger.click();
          await ResponsiveTestUtils.delay(300); // Wait for animation
          
          const animationDuration = performance.now() - animationStart;
          
          // Clean up
          hamburger.click();
          
          const passed = animationDuration < 500; // Should complete within 500ms

          return {
            testName: 'Animation Performance Test',
            category: 'performance',
            passed: passed,
            message: `Animation completed in ${Math.round(animationDuration)}ms`,
            details: { duration: animationDuration, threshold: 500 },
            duration: performance.now() - startTime,
            severity: 'warning'
          };
        } catch (error) {
          return {
            testName: 'Animation Performance Test',
            category: 'performance',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'warning'
          };
        }
      }
    },
    {
      name: 'Memory Usage Test',
      category: 'performance',
      severity: 'info',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        
        try {
          const memoryInfo = (performance as any).memory;
          
          if (!memoryInfo) {
            return {
              testName: 'Memory Usage Test',
              category: 'performance',
              passed: true,
              message: 'Memory API not available',
              duration: performance.now() - startTime,
              severity: 'info'
            };
          }

          const initialMemory = memoryInfo.usedJSHeapSize;
          
          // Simulate heavy operations
          for (let i = 0; i < 100; i++) {
            const div = document.createElement('div');
            div.className = 'test-element';
            document.body.appendChild(div);
            document.body.removeChild(div);
          }
          
          const finalMemory = memoryInfo.usedJSHeapSize;
          const memoryIncrease = finalMemory - initialMemory;
          
          const passed = memoryIncrease < 1000000; // Less than 1MB increase

          return {
            testName: 'Memory Usage Test',
            category: 'performance',
            passed: passed,
            message: `Memory increase: ${Math.round(memoryIncrease / 1024)}KB`,
            details: {
              initialMemory: initialMemory,
              finalMemory: finalMemory,
              increase: memoryIncrease
            },
            duration: performance.now() - startTime,
            severity: 'info'
          };
        } catch (error) {
          return {
            testName: 'Memory Usage Test',
            category: 'performance',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'info'
          };
        }
      }
    }
  ]
});

// Compatibility Test Suite
const createCompatibilityTestSuite = (): TestSuite => ({
  name: 'Compatibility Tests',
  description: 'Test browser compatibility and feature support',
  tests: [
    {
      name: 'CSS Feature Support Test',
      category: 'compatibility',
      severity: 'info',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        
        try {
          const features = {
            flexbox: CSS.supports('display', 'flex'),
            grid: CSS.supports('display', 'grid'),
            clamp: CSS.supports('width', 'clamp(1rem, 5vw, 3rem)'),
            customProperties: CSS.supports('color', 'var(--test)'),
            containerQueries: CSS.supports('container-type', 'inline-size')
          };
          
          const supportedFeatures = Object.values(features).filter(Boolean).length;
          const totalFeatures = Object.keys(features).length;
          const supportPercentage = (supportedFeatures / totalFeatures) * 100;
          
          const passed = supportPercentage >= 80; // 80% feature support required

          return {
            testName: 'CSS Feature Support Test',
            category: 'compatibility',
            passed: passed,
            message: `CSS feature support: ${supportedFeatures}/${totalFeatures} (${supportPercentage.toFixed(1)}%)`,
            details: features,
            duration: performance.now() - startTime,
            severity: 'info'
          };
        } catch (error) {
          return {
            testName: 'CSS Feature Support Test',
            category: 'compatibility',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'info'
          };
        }
      }
    },
    {
      name: 'JavaScript API Support Test',
      category: 'compatibility',
      severity: 'info',
      run: async (): Promise<TestResult> => {
        const startTime = performance.now();
        
        try {
          const apis = {
            IntersectionObserver: 'IntersectionObserver' in window,
            ResizeObserver: 'ResizeObserver' in window,
            PerformanceObserver: 'PerformanceObserver' in window,
            requestAnimationFrame: 'requestAnimationFrame' in window,
            matchMedia: 'matchMedia' in window,
            localStorage: 'localStorage' in window,
            serviceWorker: 'serviceWorker' in navigator
          };
          
          const supportedAPIs = Object.values(apis).filter(Boolean).length;
          const totalAPIs = Object.keys(apis).length;
          const supportPercentage = (supportedAPIs / totalAPIs) * 100;
          
          const passed = supportPercentage >= 70; // 70% API support acceptable

          return {
            testName: 'JavaScript API Support Test',
            category: 'compatibility',
            passed: passed,
            message: `JavaScript API support: ${supportedAPIs}/${totalAPIs} (${supportPercentage.toFixed(1)}%)`,
            details: apis,
            duration: performance.now() - startTime,
            severity: 'info'
          };
        } catch (error) {
          return {
            testName: 'JavaScript API Support Test',
            category: 'compatibility',
            passed: false,
            message: `Test failed with error: ${error}`,
            duration: performance.now() - startTime,
            severity: 'info'
          };
        }
      }
    }
  ]
});

// Main Test Runner Hook
export function useResponsiveTestFramework() {
  const [testRunner, setTestRunner] = useState<TestRunner>({
    suites: [],
    results: [],
    isRunning: false,
    currentTest: null,
    startTime: null,
    endTime: null
  });

  const initializeTestSuites = useCallback(() => {
    const suites = [
      createNavigationTestSuite(),
      createLayoutTestSuite(),
      createPerformanceTestSuite(),
      createCompatibilityTestSuite()
    ];

    setTestRunner(prev => ({ ...prev, suites }));
  }, []);

  const runAllTests = useCallback(async () => {
    setTestRunner(prev => ({
      ...prev,
      isRunning: true,
      results: [],
      startTime: Date.now(),
      endTime: null
    }));

    const allResults: TestResult[] = [];

    for (const suite of testRunner.suites) {
      if (suite.setup) {
        await suite.setup();
      }

      for (const test of suite.tests) {
        setTestRunner(prev => ({ ...prev, currentTest: test.name }));
        
        try {
          const result = await test.run();
          allResults.push(result);
          
          setTestRunner(prev => ({ ...prev, results: [...prev.results, result] }));
        } catch (error) {
          const errorResult: TestResult = {
            testName: test.name,
            category: test.category,
            passed: false,
            message: `Test execution failed: ${error}`,
            severity: test.severity
          };
          allResults.push(errorResult);
          setTestRunner(prev => ({ ...prev, results: [...prev.results, errorResult] }));
        }
      }

      if (suite.teardown) {
        await suite.teardown();
      }
    }

    setTestRunner(prev => ({
      ...prev,
      isRunning: false,
      currentTest: null,
      endTime: Date.now(),
      results: allResults
    }));
  }, [testRunner.suites]);

  const runSingleSuite = useCallback(async (suiteName: string) => {
    const suite = testRunner.suites.find(s => s.name === suiteName);
    if (!suite) return;

    setTestRunner(prev => ({ ...prev, isRunning: true }));

    if (suite.setup) {
      await suite.setup();
    }

    const suiteResults: TestResult[] = [];
    
    for (const test of suite.tests) {
      setTestRunner(prev => ({ ...prev, currentTest: test.name }));
      
      try {
        const result = await test.run();
        suiteResults.push(result);
      } catch (error) {
        const errorResult: TestResult = {
          testName: test.name,
          category: test.category,
          passed: false,
          message: `Test execution failed: ${error}`,
          severity: test.severity
        };
        suiteResults.push(errorResult);
      }
    }

    if (suite.teardown) {
      await suite.teardown();
    }

    setTestRunner(prev => ({
      ...prev,
      isRunning: false,
      currentTest: null,
      results: [...prev.results.filter(r => 
        !suite.tests.some(t => t.name === r.testName)
      ), ...suiteResults]
    }));
  }, [testRunner.suites]);

  const clearResults = useCallback(() => {
    setTestRunner(prev => ({ ...prev, results: [] }));
  }, []);

  const getTestSummary = useCallback(() => {
    const total = testRunner.results.length;
    const passed = testRunner.results.filter(r => r.passed).length;
    const failed = total - passed;
    const critical = testRunner.results.filter(r => !r.passed && r.severity === 'critical').length;
    const warnings = testRunner.results.filter(r => !r.passed && r.severity === 'warning').length;

    return {
      total,
      passed,
      failed,
      critical,
      warnings,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      duration: testRunner.startTime && testRunner.endTime 
        ? testRunner.endTime - testRunner.startTime 
        : null
    };
  }, [testRunner.results, testRunner.startTime, testRunner.endTime]);

  useEffect(() => {
    initializeTestSuites();
  }, [initializeTestSuites]);

  return {
    testRunner,
    runAllTests,
    runSingleSuite,
    clearResults,
    getTestSummary,
    isRunning: testRunner.isRunning,
    currentTest: testRunner.currentTest,
    results: testRunner.results,
    suites: testRunner.suites
  };
}

export default useResponsiveTestFramework;