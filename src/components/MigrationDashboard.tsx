"use client";

// Migration Dashboard Component
// Based on CLAUDE-PART2.md - UI for migration helper tools

import React, { useState, useEffect } from 'react';
import { useMigrationHelper } from './MigrationHelper';

interface MigrationDashboardProps {
  className?: string;
  autoAnalyze?: boolean;
  showAdvanced?: boolean;
}

const MigrationDashboard: React.FC<MigrationDashboardProps> = ({
  className = '',
  autoAnalyze = false,
  showAdvanced = false
}) => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'plan' | 'migrate' | 'conflicts'>('analyze');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  
  const {
    isActive,
    currentPlan,
    analysisResults,
    conflicts,
    migrationHistory,
    initialize,
    cleanup,
    analyzeExistingElements,
    createMigrationPlan,
    executeMigrationStep,
    validateMigration,
    rollbackMigration,
    getAnalysisReport
  } = useMigrationHelper();

  useEffect(() => {
    if (autoAnalyze && !isActive) {
      initialize();
    }
    
    return () => {
      if (isActive) {
        cleanup();
      }
    };
  }, [autoAnalyze, isActive, initialize, cleanup]);

  const handleAnalyze = async () => {
    setMigrationInProgress(true);
    try {
      await analyzeExistingElements();
    } finally {
      setMigrationInProgress(false);
    }
  };

  const handleCreatePlan = async () => {
    if (selectedElements.length === 0) {
      alert('Please select elements to migrate');
      return;
    }
    
    setMigrationInProgress(true);
    try {
      await createMigrationPlan(selectedElements, {
        priority: 'low-risk',
        backupBeforeMigration: true,
        testAfterMigration: true
      });
      setActiveTab('plan');
    } finally {
      setMigrationInProgress(false);
    }
  };

  const handleExecuteStep = async (stepId: string) => {
    if (!currentPlan) return;
    
    setMigrationInProgress(true);
    try {
      await executeMigrationStep(stepId);
    } finally {
      setMigrationInProgress(false);
    }
  };

  const handleRollback = async (migrationId: string) => {
    if (!confirm('Are you sure you want to rollback this migration?')) return;
    
    setMigrationInProgress(true);
    try {
      await rollbackMigration(migrationId);
    } finally {
      setMigrationInProgress(false);
    }
  };

  const getElementRiskLevel = (element: any) => {
    if (!element.riskAssessment) return 'unknown';
    const { score } = element.riskAssessment;
    if (score < 30) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isActive) {
    return (
      <div className={`migration-dashboard-inactive ${className}`}>
        <div className="inactive-state">
          <div className="inactive-icon">🔄</div>
          <h3>Migration Helper Inactive</h3>
          <p>Initialize the migration helper to analyze and migrate elements</p>
          <button onClick={initialize} className="inactive-action-button">
            Initialize Migration Helper
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`migration-dashboard ${className}`}>
      {/* Dashboard Header */}
      <div className="migration-header">
        <div className="migration-title">
          <span>🔄 Migration Helper</span>
          <span className="migration-status">
            {migrationInProgress ? (
              <span className="status-working">
                <span className="spinner"></span> Working...
              </span>
            ) : (
              <span className="status-ready">Ready</span>
            )}
          </span>
        </div>
        
        <div className="migration-controls">
          <button
            onClick={handleAnalyze}
            className="migration-button analyze"
            disabled={migrationInProgress}
          >
            Analyze Elements
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="migration-button refresh"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="migration-tabs">
        <button
          className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          Analysis ({analysisResults.length})
        </button>
        <button
          className={`tab ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          Migration Plan
        </button>
        <button
          className={`tab ${activeTab === 'migrate' ? 'active' : ''}`}
          onClick={() => setActiveTab('migrate')}
        >
          Execute ({migrationHistory.length})
        </button>
        <button
          className={`tab ${activeTab === 'conflicts' ? 'active' : ''}`}
          onClick={() => setActiveTab('conflicts')}
        >
          Conflicts ({conflicts.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="migration-content">
        {/* Analysis Tab */}
        {activeTab === 'analyze' && (
          <div className="analysis-panel">
            <div className="analysis-header">
              <h3>Element Analysis</h3>
              <div className="analysis-summary">
                <span>Found {analysisResults.length} elements</span>
                <span>•</span>
                <span>{selectedElements.length} selected</span>
              </div>
            </div>

            {analysisResults.length === 0 ? (
              <div className="empty-analysis">
                <div className="empty-icon">🔍</div>
                <p>No elements analyzed yet</p>
                <button onClick={handleAnalyze} className="analyze-button">
                  Start Analysis
                </button>
              </div>
            ) : (
              <div className="analysis-results">
                <div className="analysis-controls">
                  <button
                    onClick={() => setSelectedElements(
                      analysisResults
                        .filter(el => getElementRiskLevel(el) === 'low')
                        .map(el => el.selector)
                    )}
                    className="select-button low-risk"
                  >
                    Select Low Risk
                  </button>
                  <button
                    onClick={() => setSelectedElements([])}
                    className="select-button clear"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    className="select-button create-plan"
                    disabled={selectedElements.length === 0}
                  >
                    Create Migration Plan
                  </button>
                </div>

                <div className="analysis-list">
                  {analysisResults.map((element, index) => {
                    const risk = getElementRiskLevel(element);
                    const isSelected = selectedElements.includes(element.selector);
                    
                    return (
                      <div
                        key={index}
                        className={`analysis-item ${risk} ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedElements(prev => prev.filter(s => s !== element.selector));
                          } else {
                            setSelectedElements(prev => [...prev, element.selector]);
                          }
                        }}
                      >
                        <div className="item-header">
                          <div className="item-info">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="item-checkbox"
                            />
                            <span className="item-selector">{element.selector}</span>
                            <span className={`item-risk ${getRiskColor(risk)}`}>
                              {risk.toUpperCase()}
                            </span>
                          </div>
                          <div className="item-score">
                            {element.riskAssessment?.score || 0}/100
                          </div>
                        </div>

                        <div className="item-details">
                          <div className="item-properties">
                            <span>Type: {element.elementType}</span>
                            <span>Width: {element.currentStyles.width}</span>
                            <span>Position: {element.currentStyles.position}</span>
                          </div>
                          
                          {element.issues.length > 0 && (
                            <div className="item-issues">
                              <strong>Issues:</strong>
                              <ul>
                                {element.issues.slice(0, 3).map((issue, i) => (
                                  <li key={i} className={`issue-${issue.severity}`}>
                                    {issue.description}
                                  </li>
                                ))}
                                {element.issues.length > 3 && (
                                  <li className="issue-more">
                                    +{element.issues.length - 3} more issues
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {element.recommendations.length > 0 && (
                            <div className="item-recommendations">
                              <strong>Recommendations:</strong>
                              <ul>
                                {element.recommendations.slice(0, 2).map((rec, i) => (
                                  <li key={i}>
                                    {rec.action}: {rec.description}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Migration Plan Tab */}
        {activeTab === 'plan' && (
          <div className="plan-panel">
            {!currentPlan ? (
              <div className="no-plan">
                <div className="no-plan-icon">📋</div>
                <p>No migration plan created</p>
                <p>Go to Analysis tab and select elements to migrate</p>
              </div>
            ) : (
              <div className="plan-content">
                <div className="plan-header">
                  <h3>Migration Plan</h3>
                  <div className="plan-info">
                    <span>Created: {new Date(currentPlan.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>Steps: {currentPlan.steps.length}</span>
                    <span>•</span>
                    <span>Priority: {currentPlan.priority}</span>
                  </div>
                </div>

                <div className="plan-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(currentPlan.steps.filter(s => s.status === 'completed').length / currentPlan.steps.length) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {currentPlan.steps.filter(s => s.status === 'completed').length} / {currentPlan.steps.length} steps completed
                  </div>
                </div>

                <div className="plan-steps">
                  {currentPlan.steps.map((step, index) => (
                    <div key={step.id} className={`plan-step ${step.status}`}>
                      <div className="step-header">
                        <div className="step-info">
                          <span className="step-number">{index + 1}</span>
                          <span className="step-title">{step.action}</span>
                          <span className={`step-status status-${step.status}`}>
                            {step.status}
                          </span>
                        </div>
                        
                        {step.status === 'pending' && (
                          <button
                            onClick={() => handleExecuteStep(step.id)}
                            className="step-execute-button"
                            disabled={migrationInProgress}
                          >
                            Execute
                          </button>
                        )}
                      </div>

                      <div className="step-details">
                        <div className="step-description">{step.description}</div>
                        
                        {step.validation && (
                          <div className="step-validation">
                            <strong>Validation:</strong> {step.validation}
                          </div>
                        )}

                        {step.rollback && (
                          <div className="step-rollback">
                            <strong>Rollback:</strong> {step.rollback}
                          </div>
                        )}
                        
                        {step.estimatedTime && (
                          <div className="step-time">
                            <strong>Estimated time:</strong> {step.estimatedTime}ms
                          </div>
                        )}

                        {step.error && (
                          <div className="step-error">
                            <strong>Error:</strong> {step.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Migration Execution Tab */}
        {activeTab === 'migrate' && (
          <div className="migrate-panel">
            <div className="migrate-header">
              <h3>Migration History</h3>
              <div className="migrate-summary">
                <span>{migrationHistory.length} migrations executed</span>
              </div>
            </div>

            {migrationHistory.length === 0 ? (
              <div className="no-history">
                <div className="no-history-icon">📜</div>
                <p>No migrations executed yet</p>
              </div>
            ) : (
              <div className="migration-history">
                {migrationHistory.map((migration, index) => (
                  <div key={migration.id} className={`history-item ${migration.status}`}>
                    <div className="history-header">
                      <div className="history-info">
                        <span className="history-title">{migration.planId}</span>
                        <span className={`history-status status-${migration.status}`}>
                          {migration.status}
                        </span>
                        <span className="history-time">
                          {new Date(migration.executedAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {migration.status === 'completed' && migration.canRollback && (
                        <button
                          onClick={() => handleRollback(migration.id)}
                          className="history-rollback-button"
                          disabled={migrationInProgress}
                        >
                          Rollback
                        </button>
                      )}
                    </div>

                    <div className="history-details">
                      <div className="history-elements">
                        <strong>Elements migrated:</strong>
                        <div className="elements-list">
                          {migration.elementsModified.map((element, i) => (
                            <span key={i} className="element-tag">{element}</span>
                          ))}
                        </div>
                      </div>
                      
                      {migration.performance && (
                        <div className="history-performance">
                          <strong>Performance:</strong>
                          <span>Duration: {migration.performance.duration}ms</span>
                          <span>Memory: {(migration.performance.memoryUsage / 1024).toFixed(1)}KB</span>
                        </div>
                      )}

                      {migration.error && (
                        <div className="history-error">
                          <strong>Error:</strong> {migration.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conflicts Tab */}
        {activeTab === 'conflicts' && (
          <div className="conflicts-panel">
            <div className="conflicts-header">
              <h3>Conflict Detection</h3>
              <div className="conflicts-summary">
                <span>{conflicts.length} conflicts detected</span>
              </div>
            </div>

            {conflicts.length === 0 ? (
              <div className="no-conflicts">
                <div className="no-conflicts-icon">✅</div>
                <p>No conflicts detected</p>
                <p>All migrations should be safe to execute</p>
              </div>
            ) : (
              <div className="conflicts-list">
                {conflicts.map((conflict, index) => (
                  <div key={index} className={`conflict-item severity-${conflict.severity}`}>
                    <div className="conflict-header">
                      <div className="conflict-info">
                        <span className="conflict-type">{conflict.type}</span>
                        <span className={`conflict-severity severity-${conflict.severity}`}>
                          {conflict.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="conflict-element">
                        {conflict.element}
                      </div>
                    </div>

                    <div className="conflict-details">
                      <div className="conflict-description">
                        {conflict.description}
                      </div>
                      
                      <div className="conflict-impact">
                        <strong>Impact:</strong> {conflict.impact}
                      </div>

                      {conflict.suggestions.length > 0 && (
                        <div className="conflict-suggestions">
                          <strong>Suggestions:</strong>
                          <ul>
                            {conflict.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {conflict.canAutoResolve && (
                        <div className="conflict-actions">
                          <button
                            className="auto-resolve-button"
                            onClick={() => {
                              // TODO: Implement auto-resolve
                              console.log('Auto-resolving conflict:', conflict);
                            }}
                          >
                            Auto-Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="migration-advanced">
          <details>
            <summary>🔧 Advanced Options</summary>
            <div className="advanced-content">
              <div className="advanced-section">
                <h4>Analysis Options</h4>
                <label>
                  <input type="checkbox" /> Include hidden elements
                </label>
                <label>
                  <input type="checkbox" /> Deep CSS analysis
                </label>
                <label>
                  <input type="checkbox" /> Performance impact assessment
                </label>
              </div>
              
              <div className="advanced-section">
                <h4>Migration Options</h4>
                <label>
                  <input type="checkbox" defaultChecked /> Create backup before migration
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Validate after each step
                </label>
                <label>
                  <input type="checkbox" /> Auto-rollback on errors
                </label>
              </div>

              <div className="advanced-section">
                <h4>Debug Options</h4>
                <label>
                  <input type="checkbox" /> Verbose logging
                </label>
                <label>
                  <input type="checkbox" /> Performance monitoring
                </label>
                <label>
                  <input type="checkbox" /> Memory usage tracking
                </label>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Status Bar */}
      <div className="migration-status-bar">
        <div className="status-info">
          <span>Migration Helper Active</span>
          <span>•</span>
          <span>Elements: {analysisResults.length}</span>
          <span>•</span>
          <span>Conflicts: {conflicts.length}</span>
          <span>•</span>
          <span>History: {migrationHistory.length}</span>
        </div>
        
        {migrationInProgress && (
          <div className="status-progress">
            <span className="progress-spinner"></span>
            Processing...
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationDashboard;