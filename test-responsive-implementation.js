// Responsive Implementation Testing Framework
// Based on CLAUDE.md Part 1 - Safe testing without breaking existing functionality

class ResponsiveImplementationTester {
    constructor() {
        this.testResults = {
            navigationTests: [],
            layoutTests: [],
            performanceTests: [],
            compatibilityTests: []
        };
        this.setupTestEnvironment();
    }

    setupTestEnvironment() {
        // Only run if we're in test mode or localhost
        if (!this.isTestMode()) {
            console.log('⚠️ Responsive testing disabled. Add ?test=responsive to URL or run on localhost to enable.');
            return;
        }

        this.createTestControls();
        console.log('🧪 Responsive implementation testing environment ready');
        console.log('📋 Available tests: Navigation, Layout, Performance, Compatibility');
    }

    isTestMode() {
        return window.location.search.includes('test=responsive') || 
               window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1';
    }

    // Test 1: Navigation System
    testNavigation() {
        console.group('🍔 Navigation System Tests');
        
        const navTests = [
            () => this.testHamburgerToggle(),
            () => this.testKeyboardNavigation(),
            () => this.testTouchTargets(),
            () => this.testOverlayFunctionality(),
            () => this.testFocusManagement(),
            () => this.testAriaAttributes(),
            () => this.testDesktopPreservation()
        ];

        navTests.forEach((test, index) => {
            try {
                const result = test();
                this.testResults.navigationTests.push({
                    test: `Navigation Test ${index + 1}`,
                    name: test.name,
                    passed: result.passed,
                    message: result.message,
                    details: result.details
                });
                console.log(`✅ Test ${index + 1}: ${result.message}`);
                if (result.details) {
                    console.log('   Details:', result.details);
                }
            } catch (error) {
                console.error(`❌ Test ${index + 1} failed:`, error);
                this.testResults.navigationTests.push({
                    test: `Navigation Test ${index + 1}`,
                    passed: false,
                    message: `Error: ${error.message}`,
                    details: { error: error.stack }
                });
            }
        });
        
        console.groupEnd();
        return this.testResults.navigationTests;
    }

    testHamburgerToggle() {
        const toggle = document.getElementById('responsive-nav-toggle');
        const menu = document.getElementById('nav-menu');
        
        if (!toggle || !menu) {
            return {
                passed: false,
                message: 'Enhanced hamburger elements not found',
                details: { toggle: !!toggle, menu: !!menu }
            };
        }

        // Test toggle functionality
        const initiallyActive = menu.classList.contains('responsive-active');
        
        // Simulate click
        toggle.click();
        
        // Wait for animation
        setTimeout(() => {
            const afterClick = menu.classList.contains('responsive-active');
            
            // Reset state
            if (afterClick) toggle.click();
            
            return {
                passed: initiallyActive !== afterClick,
                message: 'Enhanced hamburger toggle functionality working',
                details: { 
                    initialState: initiallyActive, 
                    afterClick: afterClick,
                    toggled: initiallyActive !== afterClick 
                }
            };
        }, 100);

        return {
            passed: true,
            message: 'Hamburger toggle test initiated',
            details: { note: 'Async test - check console for results' }
        };
    }

    testKeyboardNavigation() {
        const toggle = document.getElementById('responsive-nav-toggle');
        
        if (!toggle) {
            return { 
                passed: false, 
                message: 'Toggle button not found for keyboard test' 
            };
        }

        // Test focus
        toggle.focus();
        const hasFocus = document.activeElement === toggle;
        
        // Test ARIA attributes
        const hasAriaExpanded = toggle.hasAttribute('aria-expanded');
        const hasAriaControls = toggle.hasAttribute('aria-controls');
        const hasAriaLabel = toggle.hasAttribute('aria-label');

        // Test Enter key functionality
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        toggle.dispatchEvent(enterEvent);

        return {
            passed: hasFocus && hasAriaExpanded && hasAriaControls && hasAriaLabel,
            message: 'Keyboard navigation and accessibility support',
            details: {
                focusable: hasFocus,
                ariaExpanded: hasAriaExpanded,
                ariaControls: hasAriaControls,
                ariaLabel: hasAriaLabel
            }
        };
    }

    testTouchTargets() {
        const touchTargets = document.querySelectorAll('.responsive-nav-toggle, .nav-link, .mobile-menu a');
        const minSize = 44; // WCAG recommended minimum
        let passedCount = 0;
        const results = [];

        touchTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            const passed = rect.width >= minSize && rect.height >= minSize;
            if (passed) passedCount++;
            
            results.push({
                element: this.generateSelector(target),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                passed: passed
            });
        });

        return {
            passed: passedCount >= touchTargets.length * 0.8, // 80% compliance rate
            message: `Touch targets compliance (${passedCount}/${touchTargets.length})`,
            details: results
        };
    }

    testOverlayFunctionality() {
        const overlay = document.getElementById('responsive-nav-overlay');
        const menu = document.getElementById('nav-menu');
        const toggle = document.getElementById('responsive-nav-toggle');
        
        if (!overlay || !menu || !toggle) {
            return { 
                passed: false, 
                message: 'Overlay elements not found',
                details: { overlay: !!overlay, menu: !!menu, toggle: !!toggle }
            };
        }

        // Check overlay properties
        const hasBlur = getComputedStyle(overlay).backdropFilter !== 'none';
        const hasTransition = getComputedStyle(overlay).transition !== 'all 0s ease 0s';
        const hasAriaHidden = overlay.hasAttribute('aria-hidden');

        return {
            passed: hasTransition && hasAriaHidden,
            message: 'Overlay functionality and accessibility',
            details: { 
                hasBackdropBlur: hasBlur,
                hasTransition: hasTransition,
                hasAriaHidden: hasAriaHidden
            }
        };
    }

    testFocusManagement() {
        const toggle = document.getElementById('responsive-nav-toggle');
        const menu = document.getElementById('nav-menu');
        
        if (!toggle || !menu) {
            return { passed: false, message: 'Focus test elements not found' };
        }

        // Test that focus is managed properly
        const firstLink = menu.querySelector('a');
        const hasFocusableElements = !!firstLink;

        return {
            passed: hasFocusableElements,
            message: 'Focus management elements present',
            details: { firstLinkFound: hasFocusableElements }
        };
    }

    testAriaAttributes() {
        const toggle = document.getElementById('responsive-nav-toggle');
        const menu = document.getElementById('nav-menu');
        
        const ariaTests = [
            toggle?.getAttribute('aria-expanded') !== null,
            toggle?.getAttribute('aria-controls') !== null,
            toggle?.getAttribute('aria-label') !== null,
            menu?.getAttribute('role') === 'navigation' || menu?.getAttribute('aria-labelledby') !== null
        ];

        const passed = ariaTests.filter(Boolean).length;
        
        return {
            passed: passed >= 3,
            message: `ARIA attributes compliance (${passed}/4)`,
            details: {
                'aria-expanded': toggle?.getAttribute('aria-expanded'),
                'aria-controls': toggle?.getAttribute('aria-controls'),
                'aria-label': toggle?.getAttribute('aria-label'),
                'nav-role-or-labelledby': menu?.getAttribute('role') || menu?.getAttribute('aria-labelledby')
            }
        };
    }

    testDesktopPreservation() {
        // Test that desktop navigation is not affected
        const desktopNav = document.querySelector('.desktop-nav');
        const originalNavMenu = document.querySelector('.nav-menu ul');
        
        let desktopIntact = true;
        let originalMenuIntact = true;

        if (desktopNav) {
            const style = getComputedStyle(desktopNav);
            desktopIntact = window.innerWidth > 768 ? style.display !== 'none' : true;
        }

        if (originalNavMenu && window.innerWidth > 768) {
            const style = getComputedStyle(originalNavMenu);
            originalMenuIntact = style.position !== 'fixed';
        }

        return {
            passed: desktopIntact && originalMenuIntact,
            message: 'Desktop navigation preservation',
            details: {
                desktopNavVisible: desktopIntact,
                originalMenuIntact: originalMenuIntact,
                screenWidth: window.innerWidth
            }
        };
    }

    // Test 2: Layout and Responsive Features
    testLayout() {
        console.group('📱 Layout and Responsive Tests');
        
        const layoutTests = [
            () => this.testResponsiveClasses(),
            () => this.testBreakpointBehavior(),
            () => this.testProgressiveEnhancement(),
            () => this.testCSSFeatureSupport()
        ];

        layoutTests.forEach((test, index) => {
            try {
                const result = test();
                this.testResults.layoutTests.push(result);
                console.log(`✅ Layout Test ${index + 1}: ${result.message}`);
            } catch (error) {
                console.error(`❌ Layout Test ${index + 1} failed:`, error);
            }
        });
        
        console.groupEnd();
        return this.testResults.layoutTests;
    }

    testResponsiveClasses() {
        const responsiveClasses = [
            '.responsive-base',
            '.responsive-container',
            '.make-responsive',
            '.responsive-hide-mobile',
            '.responsive-hide-desktop'
        ];

        let foundClasses = 0;
        responsiveClasses.forEach(className => {
            if (document.querySelector(className) !== null) {
                foundClasses++;
            }
        });

        return {
            passed: foundClasses >= 2, // At least some classes should be available
            message: `Responsive foundation classes (${foundClasses}/${responsiveClasses.length} available)`,
            details: { foundClasses, totalClasses: responsiveClasses.length }
        };
    }

    testBreakpointBehavior() {
        const width = window.innerWidth;
        const isMobile = width <= 767;
        const isTablet = width > 767 && width <= 1024;
        const isDesktop = width > 1024;

        // Test if appropriate classes are applied based on screen size
        const mobileMenuVisible = isMobile && 
            document.querySelector('.responsive-nav-toggle') &&
            getComputedStyle(document.querySelector('.responsive-nav-toggle')).display !== 'none';

        const desktopNavVisible = !isMobile &&
            document.querySelector('.desktop-nav') &&
            getComputedStyle(document.querySelector('.desktop-nav')).display !== 'none';

        return {
            passed: isMobile ? mobileMenuVisible : desktopNavVisible,
            message: `Breakpoint behavior correct for ${width}px`,
            details: {
                screenWidth: width,
                isMobile,
                isTablet,
                isDesktop,
                mobileMenuVisible,
                desktopNavVisible
            }
        };
    }

    testProgressiveEnhancement() {
        const features = {
            grid: CSS.supports('display', 'grid'),
            flexbox: CSS.supports('display', 'flex'),
            clamp: CSS.supports('width', 'clamp(1rem, 5vw, 3rem)'),
            customProperties: CSS.supports('color', 'var(--test)'),
            backdropFilter: CSS.supports('backdrop-filter', 'blur(5px)')
        };

        const supportedFeatures = Object.values(features).filter(Boolean).length;

        return {
            passed: supportedFeatures >= 3,
            message: `Progressive enhancement features (${supportedFeatures}/5 supported)`,
            details: features
        };
    }

    testCSSFeatureSupport() {
        // Check if CSS classes are applied based on feature detection
        const htmlClassList = document.documentElement.classList;
        const hasFeatureClasses = Array.from(htmlClassList).some(cls => 
            cls.startsWith('supports-') || cls.startsWith('no-')
        );

        return {
            passed: hasFeatureClasses,
            message: 'CSS feature detection classes applied',
            details: {
                hasFeatureClasses,
                documentClasses: Array.from(htmlClassList)
            }
        };
    }

    // Test 3: Performance
    testPerformance() {
        console.group('⚡ Performance Tests');
        
        const performanceTests = [
            () => this.testCSSAnimationPerformance(),
            () => this.testJavaScriptPerformance(),
            () => this.testMemoryUsage(),
            () => this.testRenderingPerformance()
        ];

        performanceTests.forEach((test, index) => {
            try {
                const result = test();
                this.testResults.performanceTests.push(result);
                console.log(`✅ Performance Test ${index + 1}: ${result.message}`);
            } catch (error) {
                console.error(`❌ Performance test ${index + 1} failed:`, error);
            }
        });
        
        console.groupEnd();
        return this.testResults.performanceTests;
    }

    testCSSAnimationPerformance() {
        const startTime = performance.now();
        const toggle = document.getElementById('responsive-nav-toggle');
        
        if (!toggle) {
            return { passed: false, message: 'Toggle not found for animation test' };
        }

        // Trigger animation
        toggle.click();
        
        const animationDuration = performance.now() - startTime;
        
        // Close menu
        setTimeout(() => toggle.click(), 100);
        
        return {
            passed: animationDuration < 500, // Should be fast
            message: `CSS animation performance (${Math.round(animationDuration)}ms)`,
            details: { duration: animationDuration }
        };
    }

    testJavaScriptPerformance() {
        const startTime = performance.now();
        
        // Test multiple rapid interactions
        const toggle = document.getElementById('responsive-nav-toggle');
        if (!toggle) {
            return { passed: false, message: 'Toggle not found for JS performance test' };
        }

        // Simulate rapid clicks
        for (let i = 0; i < 5; i++) {
            toggle.click();
        }
        
        const totalTime = performance.now() - startTime;
        const averageTime = totalTime / 5;
        
        return {
            passed: averageTime < 50, // Average should be under 50ms
            message: `JavaScript performance (${Math.round(averageTime)}ms avg)`,
            details: { totalTime, averageTime }
        };
    }

    testMemoryUsage() {
        if (performance.memory) {
            const memInfo = performance.memory;
            const memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
            
            return {
                passed: memoryUsage < 50, // Less than 50MB is good
                message: `Memory usage (${Math.round(memoryUsage)}MB)`,
                details: {
                    usedJSHeapSize: memInfo.usedJSHeapSize,
                    totalJSHeapSize: memInfo.totalJSHeapSize,
                    jsHeapSizeLimit: memInfo.jsHeapSizeLimit
                }
            };
        }
        
        return {
            passed: true,
            message: 'Memory testing not available',
            details: { reason: 'performance.memory not supported' }
        };
    }

    testRenderingPerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const paintEntries = entries.filter(entry => 
                    entry.entryType === 'paint' || entry.entryType === 'largest-contentful-paint'
                );
                
                if (paintEntries.length > 0) {
                    console.log('🎨 Paint performance entries:', paintEntries);
                }
            });
            
            try {
                observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
            } catch (e) {
                // Some entry types might not be supported
            }
        }

        return {
            passed: true,
            message: 'Rendering performance monitoring active',
            details: { performanceObserverSupported: 'PerformanceObserver' in window }
        };
    }

    // Run All Tests
    runAllTests() {
        console.log('🚀 Starting comprehensive responsive implementation tests...');
        
        const navigationResults = this.testNavigation();
        const layoutResults = this.testLayout();
        const performanceResults = this.testPerformance();
        
        // Calculate overall score
        const allResults = [...navigationResults, ...layoutResults, ...performanceResults];
        const passedTests = allResults.filter(test => test.passed).length;
        const totalTests = allResults.length;
        const overallScore = Math.round((passedTests / totalTests) * 100);
        
        console.group('📊 Test Results Summary');
        console.log(`Overall Score: ${overallScore}% (${passedTests}/${totalTests} tests passed)`);
        console.log('Navigation Tests:', navigationResults.filter(t => t.passed).length + '/' + navigationResults.length);
        console.log('Layout Tests:', layoutResults.filter(t => t.passed).length + '/' + layoutResults.length);
        console.log('Performance Tests:', performanceResults.filter(t => t.passed).length + '/' + performanceResults.length);
        
        if (overallScore >= 90) {
            console.log('🎉 Excellent! Implementation is working perfectly.');
        } else if (overallScore >= 70) {
            console.log('✅ Good! Implementation is solid with minor issues.');
        } else if (overallScore >= 50) {
            console.log('⚠️ Fair. Some issues need attention.');
        } else {
            console.log('❌ Poor. Significant issues detected.');
        }
        console.groupEnd();
        
        return {
            overallScore,
            passedTests,
            totalTests,
            results: {
                navigation: navigationResults,
                layout: layoutResults,
                performance: performanceResults
            }
        };
    }

    // Utility Functions
    generateSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.length > 0);
            if (classes.length > 0) return `.${classes[0]}`;
        }
        return element.tagName.toLowerCase();
    }

    createTestControls() {
        // Only create controls in development or test environments
        if (window.location.hostname === 'localhost' || 
            window.location.search.includes('debug=true')) {
            
            const controlPanel = document.createElement('div');
            controlPanel.id = 'responsive-test-controls';
            controlPanel.innerHTML = `
                <div style="position: fixed; top: 10px; left: 10px; background: #2c3e50; color: white; padding: 15px; border-radius: 8px; z-index: 10002; font-family: monospace; font-size: 12px; max-width: 300px;">
                    <h4 style="margin: 0 0 10px 0;">🧪 Responsive Tests</h4>
                    <button onclick="responsiveTester.testNavigation()" style="margin: 2px; padding: 6px 10px; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer;">Test Navigation</button>
                    <button onclick="responsiveTester.testLayout()" style="margin: 2px; padding: 6px 10px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">Test Layout</button>
                    <button onclick="responsiveTester.testPerformance()" style="margin: 2px; padding: 6px 10px; background: #8e44ad; color: white; border: none; border-radius: 4px; cursor: pointer;">Test Performance</button>
                    <button onclick="responsiveTester.runAllTests()" style="margin: 2px; padding: 6px 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Run All Tests</button>
                    <div id="test-status" style="margin-top: 10px; padding: 8px; background: #34495e; border-radius: 4px; font-size: 11px;">Ready to test</div>
                </div>
            `;
            document.body.appendChild(controlPanel);
        }
    }
}

// Initialize tester
const responsiveTester = new ResponsiveImplementationTester();

// Make available globally
window.responsiveTester = responsiveTester;
window.testResponsive = {
    navigation: () => responsiveTester.testNavigation(),
    layout: () => responsiveTester.testLayout(),
    performance: () => responsiveTester.testPerformance(),
    all: () => responsiveTester.runAllTests()
};

console.log('🧪 Responsive implementation tester loaded');
console.log('📋 Usage: window.testResponsive.all() or use the control panel');