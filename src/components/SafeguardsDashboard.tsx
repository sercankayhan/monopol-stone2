"use client";

// Safeguards Dashboard Component
// Based on CLAUDE-PART2.md - UI for compatibility safeguards system

import React, { useState, useEffect } from 'react';
import { useCompatibilitySafeguards } from './CompatibilitySafeguards';

interface SafeguardsDashboardProps {
  className?: string;
  autoInitialize?: boolean;
  showAdvanced?: boolean;
}

const SafeguardsDashboard: React.FC<SafeguardsDashboardProps> = ({
  className = '',
  autoInitialize = true,
  showAdvanced = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'fixes' | 'rules'>('overview');
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);

  const {
    isActive,
    browserCapabilities,
    detectedIssues,
    appliedFixes,
    safeguardRules,
    monitoring,
    initialize,
    cleanup,
    analyzeCompatibility,
    applySafeguards,
    autoFixIssues,
    getCompatibilityReport
  } = useCompatibilitySafeguards();

  useEffect(() => {
    if (autoInitialize && !isActive) {
      initialize();
    }
    
    return () => {
      if (isActive) {
        cleanup();
      }
    };
  }, [autoInitialize, isActive, initialize, cleanup]);

  const handleAnalyze = () => {
    analyzeCompatibility();
    if (autoFixEnabled) {
      setTimeout(() => {
        autoFixIssues();
      }, 500);
    }
  };

  const handleApplySafeguards = () => {
    applySafeguards();
  };

  const getCapabilityIcon = (supported: boolean) => {
    return supported ? '✅' : '❌';
  };

  const getCapabilityColor = (supported: boolean) => {
    return supported ? 'text-green-600' : 'text-red-600';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '❓';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getCriticalIssuesCount = () => {
    return detectedIssues.filter(issue => issue.severity === 'critical').length;
  };

  const getHighIssuesCount = () => {
    return detectedIssues.filter(issue => issue.severity === 'high').length;
  };

  const getOverallHealthScore = () => {
    const totalCapabilities = Object.keys(browserCapabilities).length;
    const supportedCapabilities = Object.values(browserCapabilities).filter(Boolean).length;
    const capabilityScore = (supportedCapabilities / totalCapabilities) * 100;
    
    const issuesPenalty = detectedIssues.reduce((penalty, issue) => {
      switch (issue.severity) {
        case 'critical': return penalty + 20;
        case 'high': return penalty + 10;
        case 'medium': return penalty + 5;
        case 'low': return penalty + 2;
        default: return penalty;
      }
    }, 0);
    
    return Math.max(0, Math.min(100, capabilityScore - issuesPenalty));
  };

  const getHealthStatus = () => {
    const score = getOverallHealthScore();
    if (score >= 90) return { level: 'excellent', color: 'text-green-600', icon: '💚' };
    if (score >= 75) return { level: 'good', color: 'text-green-500', icon: '💛' };
    if (score >= 50) return { level: 'fair', color: 'text-yellow-600', icon: '🧡' };
    return { level: 'poor', color: 'text-red-600', icon: '❤️' };
  };

  if (!isActive) {
    return (
      <div className={`safeguards-dashboard-inactive ${className}`}>
        <div className="inactive-state">
          <div className="inactive-icon">🛡️</div>
          <h3>Compatibility Safeguards Inactive</h3>
          <p>Initialize the safeguards system to check browser compatibility</p>
          <button onClick={initialize} className="inactive-action-button">
            Initialize Safeguards
          </button>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatus();

  return (
    <div className={`safeguards-dashboard ${className}`}>
      {/* Dashboard Header */}
      <div className="safeguards-header">
        <div className="safeguards-title">
          <span>🛡️ Compatibility Safeguards</span>
          <span className={`system-health ${healthStatus.color}`}>
            {healthStatus.icon} {healthStatus.level.toUpperCase()} ({Math.round(getOverallHealthScore())}%)
          </span>
        </div>
        
        <div className="safeguards-controls">
          <button
            onClick={handleAnalyze}
            className="safeguards-button analyze"
          >
            Analyze
          </button>
          
          <button
            onClick={handleApplySafeguards}
            className="safeguards-button apply"
          >
            Apply Safeguards
          </button>
          
          <button
            onClick={autoFixIssues}
            className="safeguards-button fix"
            disabled={detectedIssues.filter(i => i.autoFixAvailable).length === 0}
          >
            Auto-Fix
          </button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="status-cards">
        <div className="status-card capabilities">
          <div className="card-icon">🔧</div>
          <div className="card-content">
            <div className="card-title">Browser Support</div>
            <div className="card-value">
              {Object.values(browserCapabilities).filter(Boolean).length} / {Object.keys(browserCapabilities).length}
            </div>
            <div className="card-subtitle">features supported</div>
          </div>
        </div>

        <div className="status-card issues">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <div className="card-title">Issues Detected</div>
            <div className="card-value">{detectedIssues.length}</div>
            <div className="card-subtitle">
              {getCriticalIssuesCount()} critical, {getHighIssuesCount()} high
            </div>
          </div>
        </div>

        <div className="status-card fixes">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-title">Applied Fixes</div>
            <div className="card-value">{appliedFixes.length}</div>
            <div className="card-subtitle">safeguards active</div>
          </div>
        </div>

        <div className="status-card monitoring">
          <div className="card-icon">👁️</div>
          <div className="card-content">
            <div className="card-title">Monitoring</div>
            <div className="card-value">{monitoring ? 'Active' : 'Inactive'}</div>
            <div className="card-subtitle">{monitoring ? 'watching changes' : 'not monitoring'}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="safeguards-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          Issues ({detectedIssues.length})
        </button>
        <button
          className={`tab ${activeTab === 'fixes' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixes')}
        >
          Applied Fixes ({appliedFixes.length})
        </button>
        <button
          className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Rules ({safeguardRules.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="safeguards-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-panel">
            <div className="browser-capabilities">
              <h3>Browser Capabilities</h3>
              <div className="capabilities-grid">
                {Object.entries(browserCapabilities).map(([feature, supported]) => (
                  <div key={feature} className={`capability-item ${supported ? 'supported' : 'unsupported'}`}>
                    <div className="capability-icon">
                      {getCapabilityIcon(supported)}
                    </div>
                    <div className="capability-info">
                      <div className="capability-name">
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className={`capability-status ${getCapabilityColor(supported)}`}>
                        {supported ? 'Supported' : 'Not Supported'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="system-overview">
              <h3>System Overview</h3>
              <div className="overview-stats">
                <div className="stat-item">
                  <div className="stat-label">Overall Health</div>
                  <div className={`stat-value ${healthStatus.color}`}>
                    {healthStatus.level} ({Math.round(getOverallHealthScore())}%)
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Critical Issues</div>
                  <div className="stat-value text-red-600">
                    {getCriticalIssuesCount()}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Auto-Fix Available</div>
                  <div className="stat-value text-blue-600">
                    {detectedIssues.filter(i => i.autoFixAvailable).length}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Monitoring Status</div>
                  <div className={`stat-value ${monitoring ? 'text-green-600' : 'text-gray-600'}`}>
                    {monitoring ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="issues-panel">
            {detectedIssues.length === 0 ? (
              <div className="no-issues">
                <div className="no-issues-icon">✅</div>
                <h3>No Compatibility Issues</h3>
                <p>All browser features are supported or have fallbacks in place</p>
              </div>
            ) : (
              <div className="issues-list">
                {detectedIssues.map((issue, index) => (
                  <div key={issue.id || index} className={`issue-item severity-${issue.severity}`}>
                    <div className="issue-header">
                      <div className="issue-info">
                        <span className="issue-icon">{getSeverityIcon(issue.severity)}</span>
                        <span className="issue-feature">{issue.feature}</span>
                        <span className={`issue-severity ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      {issue.autoFixAvailable && (
                        <button
                          className="issue-fix-button"
                          onClick={() => autoFixIssues()}
                        >
                          Auto-Fix
                        </button>
                      )}
                    </div>

                    <div className="issue-details">
                      <div className="issue-description">
                        {issue.description}
                      </div>
                      
                      <div className="issue-impact">
                        <strong>Impact:</strong> {issue.impact}
                      </div>

                      {issue.fallback && (
                        <div className="issue-fallback">
                          <strong>Fallback:</strong> {issue.fallback}
                        </div>
                      )}

                      {issue.affectedElements.length > 0 && (
                        <div className="issue-elements">
                          <strong>Affected Elements:</strong>
                          <div className="elements-list">
                            {issue.affectedElements.slice(0, 5).map((element, i) => (
                              <span key={i} className="element-tag">{element}</span>
                            ))}
                            {issue.affectedElements.length > 5 && (
                              <span className="element-more">+{issue.affectedElements.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applied Fixes Tab */}
        {activeTab === 'fixes' && (
          <div className="fixes-panel">
            {appliedFixes.length === 0 ? (
              <div className="no-fixes">
                <div className="no-fixes-icon">🔧</div>
                <h3>No Fixes Applied</h3>
                <p>No compatibility fixes have been applied yet</p>
              </div>
            ) : (
              <div className="fixes-list">
                {appliedFixes.map((fixId, index) => {
                  const rule = safeguardRules.find(r => r.id === fixId);
                  return (
                    <div key={fixId || index} className="fix-item">
                      <div className="fix-header">
                        <div className="fix-info">
                          <span className="fix-icon">✅</span>
                          <span className="fix-name">{rule?.name || fixId}</span>
                          <span className="fix-status">Applied</span>
                        </div>
                      </div>
                      
                      <div className="fix-details">
                        <div className="fix-description">
                          {rule?.description || 'Compatibility fix applied'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="rules-panel">
            <div className="rules-header">
              <h3>Safeguard Rules</h3>
              <div className="rules-controls">
                <label className="auto-fix-toggle">
                  <input
                    type="checkbox"
                    checked={autoFixEnabled}
                    onChange={(e) => setAutoFixEnabled(e.target.checked)}
                  />
                  Enable Auto-Fix
                </label>
              </div>
            </div>

            <div className="rules-list">
              {safeguardRules.map((rule, index) => (
                <div key={rule.id || index} className={`rule-item ${rule.enabled ? 'enabled' : 'disabled'}`}>
                  <div className="rule-header">
                    <div className="rule-info">
                      <span className="rule-name">{rule.name}</span>
                      <span className={`rule-status ${rule.enabled ? 'text-green-600' : 'text-gray-600'}`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    
                    <div className="rule-applicable">
                      {rule.check() ? (
                        <span className="applicable-yes">Applicable</span>
                      ) : (
                        <span className="applicable-no">Not Needed</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="rule-details">
                    <div className="rule-description">
                      {rule.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="safeguards-advanced">
          <details>
            <summary>🔧 Advanced Options</summary>
            <div className="advanced-content">
              <div className="advanced-section">
                <h4>Detection Options</h4>
                <label>
                  <input type="checkbox" defaultChecked /> Monitor DOM changes
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Watch viewport changes
                </label>
                <label>
                  <input type="checkbox" /> Aggressive compatibility checking
                </label>
              </div>
              
              <div className="advanced-section">
                <h4>Fix Options</h4>
                <label>
                  <input type="checkbox" checked={autoFixEnabled} onChange={(e) => setAutoFixEnabled(e.target.checked)} />
                  Auto-apply fixes
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Create fallbacks
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Polyfill missing features
                </label>
              </div>

              <div className="advanced-section">
                <h4>Performance</h4>
                <label>
                  <input type="checkbox" /> Lazy load compatibility fixes
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Cache capability detection
                </label>
                <label>
                  <input type="checkbox" /> Minimal impact mode
                </label>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Status Footer */}
      <div className="safeguards-status-bar">
        <div className="status-info">
          <span>Safeguards Active</span>
          <span>•</span>
          <span>Issues: {detectedIssues.length}</span>
          <span>•</span>
          <span>Fixes: {appliedFixes.length}</span>
          <span>•</span>
          <span>Health: {Math.round(getOverallHealthScore())}%</span>
        </div>
        
        <div className="status-actions">
          <button
            onClick={() => console.log('Compatibility Report:', getCompatibilityReport())}
            className="status-button"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafeguardsDashboard;