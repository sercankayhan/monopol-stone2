// Responsive Audit Script - Based on CLAUDE.md Part 1
// Run this in browser console to analyze current responsive setup

class ResponsiveAudit {
    constructor() {
        this.auditResults = {
            existingCSS: [],
            existingJS: [],
            breakingRisks: [],
            safeToModify: [],
            mobileMenuStatus: {},
            viewportStatus: {},
            touchTargetCompliance: {},
            performanceMetrics: {}
        };
        this.runAudit();
    }

    runAudit() {
        console.group('🔍 Responsive Conversion Audit Report');
        this.findExistingResponsiveCode();
        this.identifyFixedDimensions();
        this.checkJSBreakpoints();
        this.analyzeMobileMenu();
        this.checkViewportConfiguration();
        this.validateTouchTargets();
        this.analyzePerformance();
        this.generateReport();
        console.groupEnd();
    }

    findExistingResponsiveCode() {
        const styleSheets = Array.from(document.styleSheets);
        const mediaQueries = [];
        
        styleSheets.forEach(sheet => {
            try {
                const rules = Array.from(sheet.cssRules || []);
                rules.forEach(rule => {
                    if (rule.type === CSSRule.MEDIA_RULE) {
                        mediaQueries.push({
                            media: rule.conditionText,
                            rules: Array.from(rule.cssRules).map(r => r.cssText)
                        });
                    }
                });
            } catch (e) {
                console.warn('Cannot access stylesheet:', sheet.href);
            }
        });
        
        this.auditResults.existingCSS = mediaQueries;
        console.log('✅ Found', mediaQueries.length, 'existing media queries');
    }

    identifyFixedDimensions() {
        const allElements = document.querySelectorAll('*');
        const fixedElements = [];
        
        Array.from(allElements).slice(0, 100).forEach(el => { // Sample first 100 elements
            const computed = getComputedStyle(el);
            const width = computed.width;
            const height = computed.height;
            
            if (width.includes('px') && parseInt(width) > 200) {
                fixedElements.push({
                    element: el,
                    property: 'width',
                    value: width,
                    selector: this.generateSelector(el)
                });
            }
        });
        
        this.auditResults.fixedDimensions = fixedElements;
        console.log('⚠️ Found', fixedElements.length, 'elements with potentially problematic fixed dimensions');
    }

    checkJSBreakpoints() {
        const breakpointPatterns = [
            /window\.innerWidth/g,
            /screen\.width/g,
            /matchMedia\(/g,
            /768|1024|1200|480|320/g
        ];
        
        // Check for common breakpoint indicators in global scope
        const hasWindowResize = window.addEventListener.toString().includes('resize');
        const hasMatchMedia = 'matchMedia' in window;
        
        this.auditResults.existingJS = {
            hasWindowResize,
            hasMatchMedia,
            patterns: breakpointPatterns.map(p => p.source)
        };
        
        console.log('📱 JavaScript responsive features detected:', {
            hasWindowResize,
            hasMatchMedia
        });
    }

    analyzeMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const hamburgerLines = document.querySelectorAll('.hamburger-line');
        const mobileOverlay = document.querySelector('.mobile-menu-overlay');
        
        this.auditResults.mobileMenuStatus = {
            hasToggleButton: !!mobileMenuBtn,
            hasMobileMenu: !!mobileMenu,
            hasHamburgerAnimation: hamburgerLines.length >= 3,
            hasOverlay: !!mobileOverlay,
            isAccessible: mobileMenuBtn?.getAttribute('aria-label') ? true : false
        };
        
        console.log('🍔 Mobile Menu Analysis:', this.auditResults.mobileMenuStatus);
    }

    checkViewportConfiguration() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const viewportContent = viewportMeta?.getAttribute('content') || '';
        
        this.auditResults.viewportStatus = {
            hasViewportMeta: !!viewportMeta,
            content: viewportContent,
            hasDeviceWidth: viewportContent.includes('width=device-width'),
            hasInitialScale: viewportContent.includes('initial-scale=1'),
            isOptimal: viewportContent.includes('width=device-width') && 
                      viewportContent.includes('initial-scale=1')
        };
        
        console.log('📱 Viewport Configuration:', this.auditResults.viewportStatus);
    }

    validateTouchTargets() {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
        const minSize = 44; // WCAG recommended minimum
        let compliantTargets = 0;
        let nonCompliantTargets = [];
        
        interactiveElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isCompliant = rect.width >= minSize && rect.height >= minSize;
            
            if (isCompliant) {
                compliantTargets++;
            } else if (rect.width > 0 && rect.height > 0) { // Only count visible elements
                nonCompliantTargets.push({
                    element: this.generateSelector(el),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                });
            }
        });
        
        this.auditResults.touchTargetCompliance = {
            totalInteractive: interactiveElements.length,
            compliant: compliantTargets,
            nonCompliant: nonCompliantTargets.length,
            complianceRate: Math.round((compliantTargets / interactiveElements.length) * 100),
            nonCompliantElements: nonCompliantTargets.slice(0, 10) // Show first 10 problematic elements
        };
        
        console.log('👆 Touch Target Analysis:', {
            complianceRate: this.auditResults.touchTargetCompliance.complianceRate + '%',
            compliant: compliantTargets,
            total: interactiveElements.length
        });
    }

    analyzePerformance() {
        const perfEntries = performance.getEntriesByType('navigation');
        const navigationEntry = perfEntries[0];
        
        if (navigationEntry) {
            const loadTime = navigationEntry.loadEventEnd - navigationEntry.navigationStart;
            const domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart;
            
            this.auditResults.performanceMetrics = {
                totalLoadTime: Math.round(loadTime),
                domContentLoadedTime: Math.round(domContentLoaded),
                firstContentfulPaint: this.getFirstContentfulPaint(),
                layoutShiftScore: this.getCumulativeLayoutShift()
            };
        }
        
        console.log('⚡ Performance Metrics:', this.auditResults.performanceMetrics);
    }

    getFirstContentfulPaint() {
        const fcpEntries = performance.getEntriesByName('first-contentful-paint');
        return fcpEntries.length > 0 ? Math.round(fcpEntries[0].startTime) : 'N/A';
    }

    getCumulativeLayoutShift() {
        // Simplified CLS calculation
        if ('LayoutShift' in window) {
            return 'CLS measurement available';
        }
        return 'CLS not supported';
    }

    generateSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.length > 0);
            if (classes.length > 0) return `.${classes[0]}`;
        }
        return element.tagName.toLowerCase();
    }

    generateReport() {
        console.group('📊 Audit Summary');
        
        // Overall Health Score
        let healthScore = 0;
        if (this.auditResults.viewportStatus.isOptimal) healthScore += 25;
        if (this.auditResults.mobileMenuStatus.hasToggleButton) healthScore += 25;
        if (this.auditResults.touchTargetCompliance.complianceRate > 80) healthScore += 25;
        if (this.auditResults.existingCSS.length > 5) healthScore += 25; // Has good responsive CSS coverage
        
        console.log('🎯 Overall Responsive Health Score:', healthScore + '/100');
        
        // Recommendations
        const recommendations = [];
        
        if (!this.auditResults.viewportStatus.isOptimal) {
            recommendations.push('⚠️ Optimize viewport meta tag');
        }
        
        if (this.auditResults.touchTargetCompliance.complianceRate < 90) {
            recommendations.push('👆 Improve touch target sizes (current: ' + 
                this.auditResults.touchTargetCompliance.complianceRate + '% compliant)');
        }
        
        if (this.auditResults.fixedDimensions.length > 20) {
            recommendations.push('📐 Review fixed-width elements');
        }
        
        if (!this.auditResults.mobileMenuStatus.isAccessible) {
            recommendations.push('♿ Add accessibility attributes to mobile menu');
        }
        
        if (recommendations.length === 0) {
            console.log('✅ Your site is already well-optimized for responsive design!');
            console.log('💡 Ready to implement our enhanced safe responsive features from CLAUDE.md');
        } else {
            console.log('🔧 Recommendations:');
            recommendations.forEach(rec => console.log('  ' + rec));
        }
        
        // Safe Implementation Strategy
        console.log('\n🛡️ Safe Implementation Strategy:');
        console.log('1. ✅ Your existing responsive setup is solid');
        console.log('2. 🎯 Focus on enhancing rather than replacing');
        console.log('3. 📋 Use our non-breaking enhancement classes');
        console.log('4. 🧪 Test incrementally with our testing framework');
        
        console.groupEnd();
        
        return {
            healthScore,
            recommendations,
            safeToEnhance: healthScore > 50,
            existingFeatures: this.auditResults
        };
    }
}

// Run audit immediately
const auditResults = new ResponsiveAudit();

// Make results available globally
window.responsiveAuditResults = auditResults;

console.log('\n💡 Next Steps:');
console.log('1. Review the audit results above');
console.log('2. Run: window.responsiveAuditResults.auditResults to see detailed data');
console.log('3. Proceed with safe responsive enhancements from CLAUDE.md Part 1');