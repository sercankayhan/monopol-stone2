"use client";

// Test Dashboard UI Component
// Based on CLAUDE-PART2.md - Visual testing interface

import React, { useState } from 'react';
import { useResponsiveTestFramework } from './ResponsiveTestFramework';

interface TestDashboardProps {
  className?: string;
  autoRun?: boolean;
  showDetailedResults?: boolean;
}

const TestDashboard: React.FC<TestDashboardProps> = ({
  className = '',
  autoRun = false,
  showDetailedResults = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const {
    testRunner,
    runAllTests,
    runSingleSuite,
    clearResults,
    getTestSummary,
    isRunning,
    currentTest,
    results,
    suites
  } = useResponsiveTestFramework();

  const summary = getTestSummary();

  const filteredResults = selectedCategory === 'all' 
    ? results 
    : results.filter(result => result.category === selectedCategory);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return 'ℹ️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPassColor = (passed: boolean) => {
    return passed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const formatDuration = (ms: number | undefined) => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-16 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-all"
        title="Open Test Dashboard"
      >
        🧪
      </button>
    );
  }

  return (
    <div className={`test-dashboard ${className}`}>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span>🧪 Responsive Test Dashboard</span>
          {summary.total > 0 && (
            <span className={`test-score ${summary.passRate >= 90 ? 'text-green-600' : summary.passRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
              {summary.passed}/{summary.total} ({summary.passRate.toFixed(1)}%)
            </span>
          )}
        </div>
        
        <div className="dashboard-controls">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`dashboard-button ${isRunning ? 'running' : 'ready'}`}
          >
            {isRunning ? 'Running...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="dashboard-button clear"
          >
            Clear
          </button>
          
          {process.env.NODE_ENV !== 'production' && (
            <button onClick={() => setIsVisible(false)} className="dashboard-button close">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Test Progress */}
      {isRunning && currentTest && (
        <div className="test-progress">
          <div className="progress-info">
            <span>Running: {currentTest}</span>
            <div className="progress-spinner"></div>
          </div>
        </div>
      )}

      {/* Test Summary */}
      {summary.total > 0 && (
        <div className="test-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value text-green-600">{summary.passed}</div>
              <div className="stat-label">Passed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value text-red-600">{summary.failed}</div>
              <div className="stat-label">Failed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value text-red-800">{summary.critical}</div>
              <div className="stat-label">Critical</div>
            </div>
            <div className="stat-item">
              <div className="stat-value text-yellow-600">{summary.warnings}</div>
              <div className="stat-label">Warnings</div>
            </div>
            {summary.duration && (
              <div className="stat-item">
                <div className="stat-value text-blue-600">{formatDuration(summary.duration)}</div>
                <div className="stat-label">Duration</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Suites */}
      <div className="test-suites">
        <div className="suites-header">
          <span>Test Suites</span>
        </div>
        <div className="suites-grid">
          {suites.map((suite) => {
            const suiteResults = results.filter(r => 
              suite.tests.some(t => t.name === r.testName)
            );
            const suitePassed = suiteResults.filter(r => r.passed).length;
            const suiteTotal = suite.tests.length;
            const suitePassRate = suiteTotal > 0 ? (suitePassed / suiteTotal) * 100 : 0;

            return (
              <div key={suite.name} className="suite-card">
                <div className="suite-header">
                  <h4>{suite.name}</h4>
                  {suiteResults.length > 0 && (
                    <span className={`suite-score ${suitePassRate >= 90 ? 'text-green-600' : suitePassRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {suitePassed}/{suiteTotal}
                    </span>
                  )}
                </div>
                <p className="suite-description">{suite.description}</p>
                <button
                  onClick={() => runSingleSuite(suite.name)}
                  disabled={isRunning}
                  className="suite-run-button"
                >
                  Run Suite
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Filter */}
      {results.length > 0 && (
        <div className="results-filter">
          <div className="filter-tabs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`filter-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              All ({results.length})
            </button>
            {['navigation', 'layout', 'performance', 'compatibility', 'accessibility'].map(category => {
              const count = results.filter(r => r.category === category).length;
              if (count === 0) return null;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`filter-tab ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Test Results */}
      {filteredResults.length > 0 && (
        <div className="test-results">
          <div className="results-header">
            <span>Test Results ({filteredResults.length})</span>
          </div>
          
          <div className="results-list">
            {filteredResults.map((result, index) => (
              <div key={`${result.testName}-${index}`} className={`result-item ${getPassColor(result.passed)}`}>
                <div className="result-header">
                  <div className="result-status">
                    <span className="result-icon">
                      {result.passed ? '✅' : '❌'}
                    </span>
                    <span className="result-name">{result.testName}</span>
                    <span className={`result-severity ${getSeverityColor(result.severity)}`}>
                      {getSeverityIcon(result.severity)} {result.severity}
                    </span>
                  </div>
                  <div className="result-meta">
                    <span className="result-category">{result.category}</span>
                    {result.duration && (
                      <span className="result-duration">{formatDuration(result.duration)}</span>
                    )}
                  </div>
                </div>
                
                <div className="result-message">
                  {result.message}
                </div>
                
                {showDetailedResults && result.details && (
                  <div className="result-details">
                    <details>
                      <summary>View Details</summary>
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isRunning && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧪</div>
          <h3>No Test Results</h3>
          <p>Run tests to see responsive implementation health</p>
          <button onClick={runAllTests} className="empty-action-button">
            Run All Tests
          </button>
        </div>
      )}
    </div>
  );
};

export default TestDashboard;