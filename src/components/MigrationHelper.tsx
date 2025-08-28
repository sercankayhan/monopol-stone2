"use client";

// Migration Helper Tools
// Based on CLAUDE-PART2.md - Gradual migration system

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Migration interfaces
interface ElementAnalysis {
  selector: string;
  element: Element;
  currentClasses: string[];
  suggestedChanges: ResponsiveChange[];
  riskLevel: 'low' | 'medium' | 'high';
  priority: number;
  estimatedImpact: 'minimal' | 'moderate' | 'significant';
}

interface ResponsiveChange {
  type: 'add-class' | 'remove-class' | 'modify-style' | 'add-attribute' | 'restructure';
  target: string;
  oldValue?: string;
  newValue: string;
  description: string;
  reversible: boolean;
}

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  changes: ResponsiveChange[];
  dependencies: string[];
  estimatedDuration: number;
  completed: boolean;
  backed_up: boolean;
  tested: boolean;
}

interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  steps: MigrationStep[];
  createdAt: number;
  updatedAt: number;
  totalElements: number;
  progress: number;
}

interface ConflictDetection {
  type: 'css-conflict' | 'js-conflict' | 'layout-conflict' | 'accessibility-conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element: string;
  description: string;
  suggestedFix: string;
  autoFixable: boolean;
}

// Migration Helper Hook
export function useMigrationHelper() {
  const [isActive, setIsActive] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<MigrationPlan | null>(null);
  const [analysisResults, setAnalysisResults] = useState<ElementAnalysis[]>([]);
  const [conflicts, setConflicts] = useState<ConflictDetection[]>([]);
  const [migrationLog, setMigrationLog] = useState<Array<{
    timestamp: number;
    action: string;
    element?: string;
    success: boolean;
    details?: any;
  }>>([]);

  const backupStateRef = useRef<Map<string, any>>(new Map());

  // Analyze existing elements for responsive opportunities
  const analyzeElements = useCallback((): ElementAnalysis[] => {
    const elements = document.querySelectorAll('*:not(script):not(style):not(meta):not(link)');
    const analyses: ElementAnalysis[] = [];

    elements.forEach((element, index) => {
      if (index > 500) return; // Limit analysis to prevent performance issues

      const computedStyle = getComputedStyle(element);
      const classList = Array.from(element.classList);
      
      // Skip if already responsive
      if (classList.some(cls => cls.includes('responsive'))) return;

      const analysis = analyzeElementForResponsive(element, computedStyle, classList);
      if (analysis.suggestedChanges.length > 0) {
        analyses.push(analysis);
      }
    });

    // Sort by priority (high to low)
    analyses.sort((a, b) => b.priority - a.priority);
    
    return analyses.slice(0, 50); // Limit to top 50 elements
  }, []);

  const analyzeElementForResponsive = useCallback((
    element: Element, 
    computedStyle: CSSStyleDeclaration, 
    classList: string[]
  ): ElementAnalysis => {
    const suggestedChanges: ResponsiveChange[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let priority = 0;
    let estimatedImpact: 'minimal' | 'moderate' | 'significant' = 'minimal';

    // Check for fixed widths
    if (computedStyle.width && computedStyle.width.includes('px')) {
      const width = parseInt(computedStyle.width);
      if (width > 200) {
        suggestedChanges.push({
          type: 'add-class',
          target: generateSelector(element),
          newValue: 'responsive-width',
          description: `Convert fixed width (${width}px) to responsive`,
          reversible: true
        });
        priority += 3;
        estimatedImpact = 'moderate';
      }
    }

    // Check for navigation elements
    if (element.tagName === 'NAV' || classList.some(cls => cls.includes('nav'))) {
      suggestedChanges.push({
        type: 'add-class',
        target: generateSelector(element),
        newValue: 'responsive-nav',
        description: 'Make navigation responsive',
        reversible: true
      });
      priority += 5;
      riskLevel = 'medium';
      estimatedImpact = 'significant';
    }

    // Check for form elements
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(element.tagName)) {
      suggestedChanges.push({
        type: 'add-class',
        target: generateSelector(element),
        newValue: 'responsive-form-input',
        description: 'Optimize form element for touch devices',
        reversible: true
      });
      priority += 2;
    }

    // Check for images without responsive classes
    if (element.tagName === 'IMG' && !classList.includes('responsive-image')) {
      suggestedChanges.push({
        type: 'add-class',
        target: generateSelector(element),
        newValue: 'responsive-image',
        description: 'Make image responsive',
        reversible: true
      });
      priority += 1;
    }

    // Check for layout containers
    if (computedStyle.display === 'flex' || computedStyle.display === 'grid') {
      suggestedChanges.push({
        type: 'add-class',
        target: generateSelector(element),
        newValue: 'responsive-container',
        description: 'Enhance layout container for mobile',
        reversible: true
      });
      priority += 2;
      riskLevel = 'medium';
    }

    // Check for text that might need responsive typography
    if (element.textContent && element.textContent.length > 50) {
      const fontSize = computedStyle.fontSize;
      if (fontSize && parseInt(fontSize) > 18) {
        suggestedChanges.push({
          type: 'add-class',
          target: generateSelector(element),
          newValue: 'responsive-text',
          description: 'Apply responsive typography',
          reversible: true
        });
        priority += 1;
      }
    }

    // Risk assessment
    if (element.tagName === 'BODY' || element.tagName === 'HTML') {
      riskLevel = 'high';
    } else if (element.closest('nav, header, footer, main')) {
      riskLevel = 'medium';
    }

    return {
      selector: generateSelector(element),
      element,
      currentClasses: classList,
      suggestedChanges,
      riskLevel,
      priority,
      estimatedImpact
    };
  }, []);

  const generateSelector = useCallback((element: Element): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(Boolean);
      if (classes.length > 0) return `.${classes[0]}`;
    }
    
    // Generate path-based selector as fallback
    const path: string[] = [];
    let current: Element | null = element;
    
    while (current && current.tagName !== 'BODY' && path.length < 5) {
      const tag = current.tagName.toLowerCase();
      const siblings = current.parentElement 
        ? Array.from(current.parentElement.children).filter(el => el.tagName === current!.tagName)
        : [];
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        path.unshift(`${tag}:nth-of-type(${index})`);
      } else {
        path.unshift(tag);
      }
      
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }, []);

  // Detect conflicts before applying changes
  const detectConflicts = useCallback((changes: ResponsiveChange[]): ConflictDetection[] => {
    const conflicts: ConflictDetection[] = [];

    changes.forEach(change => {
      const element = document.querySelector(change.target);
      if (!element) return;

      const computedStyle = getComputedStyle(element);
      
      // Check for CSS conflicts
      if (change.type === 'add-class' && change.newValue.includes('responsive')) {
        // Check if adding responsive class might conflict with existing styles
        const existingClasses = Array.from(element.classList);
        const potentialConflicts = existingClasses.filter(cls => 
          cls.includes('width') || cls.includes('mobile') || cls.includes('desktop')
        );
        
        if (potentialConflicts.length > 0) {
          conflicts.push({
            type: 'css-conflict',
            severity: 'medium',
            element: change.target,
            description: `Responsive class may conflict with existing classes: ${potentialConflicts.join(', ')}`,
            suggestedFix: `Review and possibly remove conflicting classes`,
            autoFixable: false
          });
        }
      }

      // Check for layout conflicts
      if (change.type === 'add-class' && computedStyle.position === 'absolute') {
        conflicts.push({
          type: 'layout-conflict',
          severity: 'high',
          element: change.target,
          description: 'Absolutely positioned element may not respond well to responsive changes',
          suggestedFix: 'Consider changing position or applying responsive positioning',
          autoFixable: false
        });
      }

      // Check for accessibility conflicts
      if (element.tagName === 'BUTTON' && !element.getAttribute('aria-label')) {
        conflicts.push({
          type: 'accessibility-conflict',
          severity: 'medium',
          element: change.target,
          description: 'Button lacks aria-label for screen readers',
          suggestedFix: 'Add appropriate aria-label attribute',
          autoFixable: true
        });
      }
    });

    return conflicts;
  }, []);

  // Create migration plan
  const createMigrationPlan = useCallback((analyses: ElementAnalysis[]): MigrationPlan => {
    const steps: MigrationStep[] = [];
    
    // Group changes by priority and risk level
    const highPriorityLowRisk = analyses.filter(a => a.priority >= 4 && a.riskLevel === 'low');
    const mediumPriorityMediumRisk = analyses.filter(a => a.priority >= 2 && a.priority < 4);
    const lowPriorityChanges = analyses.filter(a => a.priority < 2);

    // Step 1: High priority, low risk changes
    if (highPriorityLowRisk.length > 0) {
      steps.push({
        id: 'step-1-safe-wins',
        title: 'Safe Quick Wins',
        description: 'Apply low-risk responsive enhancements with high impact',
        changes: highPriorityLowRisk.flatMap(a => a.suggestedChanges),
        dependencies: [],
        estimatedDuration: 15,
        completed: false,
        backed_up: false,
        tested: false
      });
    }

    // Step 2: Form enhancements
    const formElements = analyses.filter(a => 
      a.suggestedChanges.some(c => c.newValue.includes('form'))
    );
    if (formElements.length > 0) {
      steps.push({
        id: 'step-2-forms',
        title: 'Form Optimization',
        description: 'Optimize forms for touch devices and mobile',
        changes: formElements.flatMap(a => a.suggestedChanges),
        dependencies: ['step-1-safe-wins'],
        estimatedDuration: 20,
        completed: false,
        backed_up: false,
        tested: false
      });
    }

    // Step 3: Navigation enhancements
    const navigationElements = analyses.filter(a => 
      a.element.tagName === 'NAV' || a.selector.includes('nav')
    );
    if (navigationElements.length > 0) {
      steps.push({
        id: 'step-3-navigation',
        title: 'Navigation Enhancement',
        description: 'Implement responsive navigation patterns',
        changes: navigationElements.flatMap(a => a.suggestedChanges),
        dependencies: ['step-1-safe-wins'],
        estimatedDuration: 30,
        completed: false,
        backed_up: false,
        tested: false
      });
    }

    // Step 4: Layout containers
    const layoutElements = analyses.filter(a => 
      a.suggestedChanges.some(c => c.newValue.includes('container'))
    );
    if (layoutElements.length > 0) {
      steps.push({
        id: 'step-4-layouts',
        title: 'Layout Containers',
        description: 'Enhance layout containers for responsive behavior',
        changes: layoutElements.flatMap(a => a.suggestedChanges),
        dependencies: ['step-2-forms', 'step-3-navigation'],
        estimatedDuration: 25,
        completed: false,
        backed_up: false,
        tested: false
      });
    }

    // Step 5: Remaining changes
    if (lowPriorityChanges.length > 0) {
      steps.push({
        id: 'step-5-remaining',
        title: 'Final Enhancements',
        description: 'Apply remaining responsive improvements',
        changes: lowPriorityChanges.flatMap(a => a.suggestedChanges),
        dependencies: ['step-4-layouts'],
        estimatedDuration: 20,
        completed: false,
        backed_up: false,
        tested: false
      });
    }

    const totalEstimatedTime = steps.reduce((acc, step) => acc + step.estimatedDuration, 0);

    return {
      id: `migration-${Date.now()}`,
      name: 'Responsive Migration Plan',
      description: `Gradual migration plan for ${analyses.length} elements across ${steps.length} steps`,
      steps,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalElements: analyses.length,
      progress: 0
    };
  }, []);

  // Execute single migration step
  const executeMigrationStep = useCallback(async (stepId: string): Promise<boolean> => {
    if (!currentPlan) return false;

    const step = currentPlan.steps.find(s => s.id === stepId);
    if (!step || step.completed) return false;

    // Check dependencies
    const dependenciesCompleted = step.dependencies.every(depId =>
      currentPlan.steps.find(s => s.id === depId)?.completed
    );

    if (!dependenciesCompleted) {
      console.warn('Dependencies not completed for step:', stepId);
      return false;
    }

    try {
      console.log(`🔄 Executing migration step: ${step.title}`);
      
      // Backup current state
      if (!step.backed_up) {
        backupStepState(step);
        step.backed_up = true;
      }

      // Detect conflicts
      const stepConflicts = detectConflicts(step.changes);
      setConflicts(prev => [...prev, ...stepConflicts]);

      if (stepConflicts.some(c => c.severity === 'critical')) {
        throw new Error('Critical conflicts detected - aborting step');
      }

      // Apply changes
      let successCount = 0;
      let errorCount = 0;

      for (const change of step.changes) {
        try {
          const success = await applyChange(change);
          if (success) {
            successCount++;
            logMigrationAction('apply-change', change.target, true, change);
          } else {
            errorCount++;
            logMigrationAction('apply-change', change.target, false, change);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error applying change to ${change.target}:`, error);
          logMigrationAction('apply-change', change.target, false, { change, error });
        }
      }

      // Mark step as completed if most changes succeeded
      if (successCount > errorCount) {
        step.completed = true;
        step.tested = true; // In a real scenario, run automated tests here
        
        // Update plan progress
        const completedSteps = currentPlan.steps.filter(s => s.completed).length;
        const newProgress = (completedSteps / currentPlan.steps.length) * 100;
        
        setCurrentPlan(prev => prev ? {
          ...prev,
          progress: newProgress,
          updatedAt: Date.now()
        } : null);

        console.log(`✅ Step completed: ${step.title} (${successCount}/${step.changes.length} changes applied)`);
        return true;
      } else {
        throw new Error(`Step failed: ${errorCount} errors, ${successCount} successes`);
      }

    } catch (error) {
      console.error(`❌ Migration step failed: ${step.title}`, error);
      logMigrationAction('execute-step', stepId, false, { step, error });
      
      // Rollback changes if backup exists
      if (step.backed_up) {
        rollbackStepState(step);
      }
      
      return false;
    }
  }, [currentPlan, detectConflicts]);

  // Backup state before applying step
  const backupStepState = useCallback((step: MigrationStep) => {
    const backup = new Map();
    
    step.changes.forEach(change => {
      const element = document.querySelector(change.target);
      if (element) {
        backup.set(change.target, {
          classList: Array.from(element.classList),
          attributes: Array.from(element.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          })),
          computedStyle: {
            width: getComputedStyle(element).width,
            display: getComputedStyle(element).display,
            position: getComputedStyle(element).position
          }
        });
      }
    });
    
    backupStateRef.current.set(step.id, backup);
    console.log(`💾 Backed up state for step: ${step.title}`);
  }, []);

  // Rollback step changes
  const rollbackStepState = useCallback((step: MigrationStep) => {
    const backup = backupStateRef.current.get(step.id);
    if (!backup) return;

    backup.forEach((elementBackup: any, selector: string) => {
      const element = document.querySelector(selector);
      if (element) {
        // Restore classes
        element.className = elementBackup.classList.join(' ');
        
        // Restore attributes
        elementBackup.attributes.forEach((attr: any) => {
          element.setAttribute(attr.name, attr.value);
        });
      }
    });

    step.completed = false;
    step.tested = false;
    console.log(`🔄 Rolled back step: ${step.title}`);
  }, []);

  // Apply individual change
  const applyChange = useCallback(async (change: ResponsiveChange): Promise<boolean> => {
    const element = document.querySelector(change.target);
    if (!element) return false;

    try {
      switch (change.type) {
        case 'add-class':
          element.classList.add(change.newValue);
          break;
          
        case 'remove-class':
          if (change.oldValue) {
            element.classList.remove(change.oldValue);
          }
          break;
          
        case 'add-attribute':
          const [attrName, attrValue] = change.newValue.split('=');
          element.setAttribute(attrName, attrValue || '');
          break;
          
        case 'modify-style':
          const [property, value] = change.newValue.split(':');
          (element as HTMLElement).style.setProperty(property.trim(), value.trim());
          break;
          
        default:
          console.warn('Unsupported change type:', change.type);
          return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error applying change:', error);
      return false;
    }
  }, []);

  // Log migration actions
  const logMigrationAction = useCallback((action: string, element?: string, success: boolean = true, details?: any) => {
    setMigrationLog(prev => [...prev, {
      timestamp: Date.now(),
      action,
      element,
      success,
      details
    }].slice(-100)); // Keep last 100 entries
  }, []);

  // Start migration analysis
  const startAnalysis = useCallback(async () => {
    setIsActive(true);
    console.log('🔍 Starting responsive migration analysis...');
    
    try {
      const analyses = analyzeElements();
      setAnalysisResults(analyses);
      
      const plan = createMigrationPlan(analyses);
      setCurrentPlan(plan);
      
      console.log(`📋 Migration plan created: ${analyses.length} elements, ${plan.steps.length} steps`);
      logMigrationAction('create-plan', undefined, true, { analyses: analyses.length, steps: plan.steps.length });
      
      return plan;
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      logMigrationAction('create-plan', undefined, false, error);
      throw error;
    }
  }, [analyzeElements, createMigrationPlan, logMigrationAction]);

  return {
    isActive,
    currentPlan,
    analysisResults,
    conflicts,
    migrationLog,
    startAnalysis,
    executeMigrationStep,
    rollbackStepState,
    setCurrentPlan
  };
}

export default useMigrationHelper;