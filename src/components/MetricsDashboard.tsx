"use client";

// Metrics Dashboard Component
// Based on CLAUDE-PART2.md - UI for success metrics system

import React, { useState, useEffect } from 'react';
import { useSuccessMetrics } from './SuccessMetrics';

interface MetricsDashboardProps {
  className?: string;
  autoInitialize?: boolean;
  showBehavior?: boolean;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  className = '',
  autoInitialize = true,
  showBehavior = true
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'behavior' | 'impact' | 'reports'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const {
    isActive,
    metrics,
    reports,
    currentScore,
    tracking,
    userBehavior,
    businessImpact,
    initialize,
    cleanup,
    collectMetrics,
    createReport
  } = useSuccessMetrics();

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

  const getMetricsByCategory = (category: string) => {
    if (category === 'all') return metrics;
    return metrics.filter(metric => metric.category === category);
  };

  const getCategoryScore = (category: string) => {
    const categoryMetrics = metrics.filter(m => m.category === category);
    if (categoryMetrics.length === 0) return 0;
    
    const totalScore = categoryMetrics.reduce((sum, metric) => {
      const achievementRate = metric.target > 0 ? 
        Math.min(1, metric.current / metric.target) : 
        (metric.current === 0 ? 1 : 0);
      return sum + (achievementRate * 100);
    }, 0);
    
    return totalScore / categoryMetrics.length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'needs-improvement': return '🟠';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'needs-improvement': return 'text-orange-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms') {
      if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
      return `${Math.round(value)}ms`;
    }
    if (unit === '%') return `${Math.round(value)}%`;
    if (unit === 'score') return value.toFixed(2);
    if (unit === 'errors') return Math.round(value).toString();
    return `${Math.round(value)}${unit}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getOverallHealthStatus = () => {
    if (currentScore >= 90) return { level: 'excellent', color: 'text-green-600', icon: '🟢' };
    if (currentScore >= 75) return { level: 'good', color: 'text-yellow-600', icon: '🟡' };
    if (currentScore >= 50) return { level: 'needs improvement', color: 'text-orange-600', icon: '🟠' };
    return { level: 'poor', color: 'text-red-600', icon: '🔴' };
  };

  if (!isActive) {
    return (
      <div className={`metrics-dashboard-inactive ${className}`}>
        <div className="inactive-state">
          <div className="inactive-icon">📊</div>
          <h3>Success Metrics Inactive</h3>
          <p>Initialize the metrics system to start tracking success indicators</p>
          <button onClick={initialize} className="inactive-action-button">
            Initialize Metrics
          </button>
        </div>
      </div>
    );
  }

  const healthStatus = getOverallHealthStatus();
  const categories = ['performance', 'usability', 'accessibility', 'compatibility', 'stability'];

  return (
    <div className={`metrics-dashboard ${className}`}>
      {/* Dashboard Header */}
      <div className="metrics-header">
        <div className="metrics-title">
          <span>📊 Success Metrics</span>
          <span className={`overall-score ${healthStatus.color}`}>
            {healthStatus.icon} {Math.round(currentScore)}% ({healthStatus.level})
          </span>
        </div>
        
        <div className="metrics-controls">
          <button
            onClick={collectMetrics}
            className="metrics-button collect"
            disabled={!tracking}
          >
            {tracking ? 'Update Metrics' : 'Start Tracking'}
          </button>
          
          <button
            onClick={createReport}
            className="metrics-button report"
          >
            Generate Report
          </button>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="time-range-select"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Score Overview */}
      <div className="score-overview">
        <div className="overall-score-card">
          <div className="score-circle">
            <div className="score-value">{Math.round(currentScore)}</div>
            <div className="score-label">Overall Score</div>
          </div>
          <div className={`score-status ${healthStatus.color}`}>
            {healthStatus.icon} {healthStatus.level}
          </div>
        </div>

        <div className="category-scores">
          {categories.map(category => (
            <div key={category} className="category-score-card">
              <div className="category-name">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </div>
              <div className="category-score">
                {Math.round(getCategoryScore(category))}%
              </div>
              <div className="category-metrics">
                {metrics.filter(m => m.category === category).length} metrics
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="metrics-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics ({metrics.length})
        </button>
        {showBehavior && (
          <button
            className={`tab ${activeTab === 'behavior' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavior')}
          >
            User Behavior
          </button>
        )}
        <button
          className={`tab ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          Business Impact ({businessImpact.length})
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="metrics-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-panel">
            <div className="key-metrics">
              <h3>Key Performance Indicators</h3>
              <div className="kpi-grid">
                {metrics.slice(0, 6).map((metric, index) => (
                  <div key={metric.id} className={`kpi-card ${metric.status}`}>
                    <div className="kpi-header">
                      <span className="kpi-icon">{getStatusIcon(metric.status)}</span>
                      <span className="kpi-name">{metric.name}</span>
                      <span className="kpi-trend">{getTrendIcon(metric.trend)}</span>
                    </div>
                    
                    <div className="kpi-value">
                      <span className="value">{formatValue(metric.current, metric.unit)}</span>
                      <span className="target">/ {formatValue(metric.target, metric.unit)}</span>
                    </div>
                    
                    <div className="kpi-progress">
                      <div
                        className={`progress-bar ${metric.status}`}
                        style={{
                          width: `${Math.min(100, (metric.current / metric.target) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-insights">
              <h3>Quick Insights</h3>
              <div className="insights-list">
                {metrics.filter(m => m.status === 'poor').length > 0 && (
                  <div className="insight-item critical">
                    <span className="insight-icon">🚨</span>
                    <div className="insight-content">
                      <div className="insight-title">Critical Issues</div>
                      <div className="insight-description">
                        {metrics.filter(m => m.status === 'poor').length} metrics need immediate attention
                      </div>
                    </div>
                  </div>
                )}
                
                {metrics.filter(m => m.status === 'excellent').length > 0 && (
                  <div className="insight-item success">
                    <span className="insight-icon">✅</span>
                    <div className="insight-content">
                      <div className="insight-title">Excellent Performance</div>
                      <div className="insight-description">
                        {metrics.filter(m => m.status === 'excellent').length} metrics exceeding targets
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="insight-item info">
                  <span className="insight-icon">📈</span>
                  <div className="insight-content">
                    <div className="insight-title">Tracking Status</div>
                    <div className="insight-description">
                      {tracking ? 'Active monitoring' : 'Monitoring paused'} • Last update: {formatTimeAgo(Math.max(...metrics.map(m => m.lastUpdated)))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="metrics-panel">
            <div className="metrics-controls-panel">
              <div className="category-filter">
                <label>Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="all">All Categories</option>
                  <option value="performance">Performance</option>
                  <option value="usability">Usability</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="compatibility">Compatibility</option>
                  <option value="stability">Stability</option>
                </select>
              </div>
            </div>

            <div className="metrics-list">
              {getMetricsByCategory(selectedCategory).map((metric, index) => (
                <div key={metric.id} className={`metric-item ${metric.status}`}>
                  <div className="metric-header">
                    <div className="metric-info">
                      <span className="metric-status-icon">{getStatusIcon(metric.status)}</span>
                      <div className="metric-names">
                        <div className="metric-name">{metric.name}</div>
                        <div className="metric-description">{metric.description}</div>
                      </div>
                      <div className="metric-category">{metric.category}</div>
                    </div>
                    
                    <div className="metric-trend-info">
                      <span className="trend-icon">{getTrendIcon(metric.trend)}</span>
                      <span className="trend-label">{metric.trend}</span>
                    </div>
                  </div>

                  <div className="metric-values">
                    <div className="current-value">
                      <span className="value-label">Current</span>
                      <span className={`value-number ${getStatusColor(metric.status)}`}>
                        {formatValue(metric.current, metric.unit)}
                      </span>
                    </div>
                    
                    <div className="target-value">
                      <span className="value-label">Target</span>
                      <span className="value-number">
                        {formatValue(metric.target, metric.unit)}
                      </span>
                    </div>
                    
                    <div className="achievement">
                      <span className="value-label">Achievement</span>
                      <span className={`value-number ${getStatusColor(metric.status)}`}>
                        {Math.round(Math.min(100, (metric.current / metric.target) * 100))}%
                      </span>
                    </div>
                  </div>

                  <div className="metric-progress">
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar ${metric.status}`}
                        style={{
                          width: `${Math.min(100, (metric.current / metric.target) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric-history">
                    <div className="history-label">
                      Last updated: {formatTimeAgo(metric.lastUpdated)}
                    </div>
                    
                    {metric.history.length > 0 && (
                      <div className="history-chart">
                        <div className="chart-container">
                          {metric.history.slice(-10).map((point, i) => (
                            <div
                              key={i}
                              className="chart-point"
                              style={{
                                height: `${Math.min(100, (point.value / metric.target) * 100)}%`,
                                left: `${(i / 9) * 100}%`
                              }}
                              title={`${formatValue(point.value, metric.unit)} at ${new Date(point.timestamp).toLocaleString()}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Behavior Tab */}
        {activeTab === 'behavior' && showBehavior && (
          <div className="behavior-panel">
            <div className="behavior-metrics">
              <h3>User Behavior Metrics</h3>
              <div className="behavior-grid">
                <div className="behavior-card">
                  <div className="behavior-icon">⏱️</div>
                  <div className="behavior-content">
                    <div className="behavior-name">Time on Page</div>
                    <div className="behavior-value">
                      {Math.round(userBehavior.timeOnPage / 1000)}s
                    </div>
                  </div>
                </div>

                <div className="behavior-card">
                  <div className="behavior-icon">🔄</div>
                  <div className="behavior-content">
                    <div className="behavior-name">Interaction Rate</div>
                    <div className="behavior-value">
                      {userBehavior.interactionRate.toFixed(1)}/min
                    </div>
                  </div>
                </div>

                <div className="behavior-card">
                  <div className="behavior-icon">📱</div>
                  <div className="behavior-content">
                    <div className="behavior-name">Mobile Usage</div>
                    <div className="behavior-value">
                      {Math.round(userBehavior.mobileUsage)}%
                    </div>
                  </div>
                </div>

                <div className="behavior-card">
                  <div className="behavior-icon">❌</div>
                  <div className="behavior-content">
                    <div className="behavior-name">Error Rate</div>
                    <div className="behavior-value">
                      {userBehavior.errorRate.toFixed(1)}/min
                    </div>
                  </div>
                </div>

                <div className="behavior-card">
                  <div className="behavior-icon">↩️</div>
                  <div className="behavior-content">
                    <div className="behavior-name">Bounce Rate</div>
                    <div className="behavior-value">
                      {Math.round(userBehavior.bounceRate)}%
                    </div>
                  </div>
                </div>

                <div className="behavior-card">
                  <div className="behavior-icon">🎯</div>
                  <div className="behavior-content">
                    <div className="behavior-name">Conversion Rate</div>
                    <div className="behavior-value">
                      {userBehavior.conversionRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Impact Tab */}
        {activeTab === 'impact' && (
          <div className="impact-panel">
            <div className="impact-summary">
              <h3>Business Impact Analysis</h3>
              <div className="impact-overview">
                <div className="impact-stat">
                  <div className="stat-value">{businessImpact.length}</div>
                  <div className="stat-label">Impact Areas</div>
                </div>
                <div className="impact-stat">
                  <div className="stat-value">
                    {businessImpact.filter(i => i.improvement > 0).length}
                  </div>
                  <div className="stat-label">Improvements</div>
                </div>
                <div className="impact-stat">
                  <div className="stat-value">
                    {businessImpact.reduce((sum, i) => sum + i.improvement, 0).toFixed(1)}%
                  </div>
                  <div className="stat-label">Total Improvement</div>
                </div>
              </div>
            </div>

            <div className="impact-list">
              {businessImpact.map((impact, index) => (
                <div key={index} className="impact-item">
                  <div className="impact-header">
                    <div className="impact-category">{impact.category}</div>
                    <div className="impact-metric">{impact.metric}</div>
                  </div>
                  
                  <div className="impact-comparison">
                    <div className="comparison-item">
                      <div className="comparison-label">Baseline</div>
                      <div className="comparison-value">{impact.baseline.toFixed(1)}</div>
                    </div>
                    <div className="comparison-arrow">→</div>
                    <div className="comparison-item">
                      <div className="comparison-label">Current</div>
                      <div className="comparison-value text-blue-600">{impact.current.toFixed(1)}</div>
                    </div>
                    <div className="comparison-improvement">
                      <div className={`improvement-value ${impact.improvement > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {impact.improvement > 0 ? '+' : ''}{impact.improvement.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="impact-description">
                    {impact.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="reports-panel">
            {reports.length === 0 ? (
              <div className="no-reports">
                <div className="no-reports-icon">📊</div>
                <h3>No Reports Generated</h3>
                <p>Generate your first success report to track progress over time</p>
                <button onClick={createReport} className="create-report-button">
                  Generate Report
                </button>
              </div>
            ) : (
              <div className="reports-list">
                {reports.map((report, index) => (
                  <div key={report.id} className="report-item">
                    <div className="report-header">
                      <div className="report-info">
                        <div className="report-date">
                          {new Date(report.timestamp).toLocaleString()}
                        </div>
                        <div className="report-score">
                          Score: {Math.round(report.overallScore)}%
                        </div>
                      </div>
                    </div>

                    <div className="report-categories">
                      {Object.entries(report.categoryScores).map(([category, score]) => (
                        <div key={category} className="category-score">
                          <div className="category-name">{category}</div>
                          <div className="category-value">{Math.round(score)}%</div>
                        </div>
                      ))}
                    </div>

                    {report.achievements.length > 0 && (
                      <div className="report-achievements">
                        <strong>Achievements:</strong>
                        <ul>
                          {report.achievements.slice(0, 3).map((achievement, i) => (
                            <li key={i} className="achievement-item">✅ {achievement}</li>
                          ))}
                          {report.achievements.length > 3 && (
                            <li className="more-achievements">
                              +{report.achievements.length - 3} more achievements
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {report.recommendations.length > 0 && (
                      <div className="report-recommendations">
                        <strong>Recommendations:</strong>
                        <ul>
                          {report.recommendations.slice(0, 2).map((rec, i) => (
                            <li key={i} className="recommendation-item">💡 {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="metrics-status-bar">
        <div className="status-info">
          <span>Metrics Tracking: {tracking ? 'Active' : 'Inactive'}</span>
          <span>•</span>
          <span>Score: {Math.round(currentScore)}%</span>
          <span>•</span>
          <span>Metrics: {metrics.length}</span>
          <span>•</span>
          <span>Reports: {reports.length}</span>
        </div>
        
        <div className="status-actions">
          <button
            onClick={() => console.log('Metrics data:', { metrics, userBehavior, businessImpact })}
            className="status-button"
          >
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;