"use client";

// Maintenance Dashboard Component
// Based on CLAUDE-PART2.md - UI for maintenance automation system

import React, { useState, useEffect } from 'react';
import { useMaintenanceAutomation } from './MaintenanceAutomation';

interface MaintenanceDashboardProps {
  className?: string;
  autoInitialize?: boolean;
  showSchedule?: boolean;
}

const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
  className = '',
  autoInitialize = true,
  showSchedule = true
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'health' | 'reports'>('overview');
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'on-change'>('daily');

  const {
    isActive,
    schedule,
    currentTask,
    healthMetrics,
    reports,
    autoRunEnabled,
    nextMaintenanceTime,
    initialize,
    cleanup,
    runTask,
    runMaintenanceCycle,
    toggleAutoRun
  } = useMaintenanceAutomation();

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

  const getTasksByFrequency = (frequency: string) => {
    switch (frequency) {
      case 'daily': return schedule.dailyTasks;
      case 'weekly': return schedule.weeklyTasks;
      case 'monthly': return schedule.monthlyTasks;
      case 'on-change': return schedule.onChangeTasks;
      default: return [];
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '⏳';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'skipped': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚡';
      case 'medium': return '💡';
      case 'low': return '🔵';
      default: return '❓';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '💚';
      case 'warning': return '💛';
      case 'critical': return '❤️';
      default: return '❓';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimeAgo = (timestamp?: number | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatTimeUntil = (timestamp?: number | null) => {
    if (!timestamp) return 'Unknown';
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'Now';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'Soon';
  };

  const getOverallHealthScore = () => {
    if (healthMetrics.length === 0) return 0;
    return Math.round(healthMetrics.reduce((acc, metric) => acc + metric.value, 0) / healthMetrics.length);
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
      <div className={`maintenance-dashboard-inactive ${className}`}>
        <div className="inactive-state">
          <div className="inactive-icon">🔧</div>
          <h3>Maintenance Automation Inactive</h3>
          <p>Initialize the maintenance system to start automated health monitoring</p>
          <button onClick={initialize} className="inactive-action-button">
            Initialize Maintenance
          </button>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatus();

  return (
    <div className={`maintenance-dashboard ${className}`}>
      {/* Dashboard Header */}
      <div className="maintenance-header">
        <div className="maintenance-title">
          <span>🔧 Maintenance Automation</span>
          <span className={`system-health ${healthStatus.color}`}>
            {healthStatus.icon} {healthStatus.level.toUpperCase()} ({getOverallHealthScore()}%)
          </span>
        </div>
        
        <div className="maintenance-controls">
          <button
            onClick={runMaintenanceCycle}
            className="maintenance-button run"
            disabled={!!currentTask}
          >
            {currentTask ? 'Running...' : 'Run Now'}
          </button>
          
          <label className="auto-run-toggle">
            <input
              type="checkbox"
              checked={autoRunEnabled}
              onChange={(e) => toggleAutoRun(e.target.checked)}
            />
            Auto-run
          </label>
        </div>
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        <div className="overview-card current-task">
          <div className="card-header">
            <span className="card-title">Current Task</span>
            <span className="card-icon">⚡</span>
          </div>
          <div className="card-content">
            {currentTask ? (
              <>
                <div className="current-task-name">{currentTask.name}</div>
                <div className="current-task-status">
                  <span className={`status-indicator ${getTaskStatusColor(currentTask.status)}`}>
                    {getTaskStatusIcon(currentTask.status)} {currentTask.status}
                  </span>
                </div>
              </>
            ) : (
              <div className="no-current-task">No task running</div>
            )}
          </div>
        </div>

        <div className="overview-card next-maintenance">
          <div className="card-header">
            <span className="card-title">Next Maintenance</span>
            <span className="card-icon">⏰</span>
          </div>
          <div className="card-content">
            <div className="next-time">
              {formatTimeUntil(nextMaintenanceTime)}
            </div>
            <div className="auto-status">
              Auto-run: {autoRunEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        <div className="overview-card health-summary">
          <div className="card-header">
            <span className="card-title">Health Summary</span>
            <span className="card-icon">❤️</span>
          </div>
          <div className="card-content">
            <div className="health-score">{getOverallHealthScore()}%</div>
            <div className="health-metrics-count">
              {healthMetrics.length} metrics monitored
            </div>
          </div>
        </div>

        <div className="overview-card recent-reports">
          <div className="card-header">
            <span className="card-title">Recent Reports</span>
            <span className="card-icon">📊</span>
          </div>
          <div className="card-content">
            <div className="reports-count">{reports.length}</div>
            <div className="last-report">
              {reports.length > 0 ? formatTimeAgo(reports[0].timestamp) : 'No reports'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="maintenance-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`tab ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          Health ({healthMetrics.length})
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="maintenance-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-panel">
            <div className="system-status">
              <h3>System Status</h3>
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-label">Automation</div>
                  <div className={`status-value ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-label">Auto-run</div>
                  <div className={`status-value ${autoRunEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                    {autoRunEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-label">Health Score</div>
                  <div className={`status-value ${healthStatus.color}`}>
                    {getOverallHealthScore()}%
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-label">Tasks Total</div>
                  <div className="status-value text-blue-600">
                    {schedule.dailyTasks.length + schedule.weeklyTasks.length + schedule.monthlyTasks.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button
                  onClick={() => runTask('daily-health-check')}
                  className="action-button health"
                  disabled={!!currentTask}
                >
                  <span className="action-icon">❤️</span>
                  <span className="action-text">Health Check</span>
                </button>
                
                <button
                  onClick={() => runTask('daily-performance-audit')}
                  className="action-button performance"
                  disabled={!!currentTask}
                >
                  <span className="action-icon">⚡</span>
                  <span className="action-text">Performance Audit</span>
                </button>
                
                <button
                  onClick={() => runTask('weekly-compatibility-scan')}
                  className="action-button compatibility"
                  disabled={!!currentTask}
                >
                  <span className="action-icon">🔧</span>
                  <span className="action-text">Compatibility Scan</span>
                </button>
                
                <button
                  onClick={runMaintenanceCycle}
                  className="action-button full"
                  disabled={!!currentTask}
                >
                  <span className="action-icon">🚀</span>
                  <span className="action-text">Full Maintenance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="tasks-panel">
            <div className="tasks-controls">
              <div className="frequency-selector">
                <label>Frequency:</label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value as any)}
                  className="frequency-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="on-change">On Change</option>
                </select>
              </div>
            </div>

            <div className="tasks-list">
              {getTasksByFrequency(selectedFrequency).map((task, index) => (
                <div key={task.id || index} className={`task-item ${task.status}`}>
                  <div className="task-header">
                    <div className="task-info">
                      <span className="task-icon">{getTaskStatusIcon(task.status)}</span>
                      <span className="task-name">{task.name}</span>
                      <span className={`task-priority ${getPriorityColor(task.priority)}`}>
                        {getPriorityIcon(task.priority)} {task.priority}
                      </span>
                    </div>
                    
                    <div className="task-actions">
                      <button
                        onClick={() => runTask(task.id)}
                        className="task-run-button"
                        disabled={!!currentTask || task.status === 'running'}
                      >
                        Run
                      </button>
                    </div>
                  </div>

                  <div className="task-details">
                    <div className="task-description">{task.description}</div>
                    
                    <div className="task-meta">
                      <div className="task-timing">
                        <span>Last run: {formatTimeAgo(task.lastRun)}</span>
                        {task.duration && (
                          <span>Duration: {formatDuration(task.duration)}</span>
                        )}
                      </div>
                      
                      <div className="task-settings">
                        <span>Auto-execute: {task.autoExecute ? 'Yes' : 'No'}</span>
                        <span>Frequency: {task.frequency}</span>
                      </div>
                    </div>

                    {task.result && (
                      <div className={`task-result ${task.status === 'failed' ? 'error' : 'success'}`}>
                        <strong>Result:</strong> {task.result}
                      </div>
                    )}

                    {task.error && (
                      <div className="task-error">
                        <strong>Error:</strong> {task.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="health-panel">
            {healthMetrics.length === 0 ? (
              <div className="no-health-data">
                <div className="no-data-icon">❤️</div>
                <h3>No Health Data</h3>
                <p>Run a health check to see system metrics</p>
                <button
                  onClick={() => runTask('daily-health-check')}
                  className="health-check-button"
                  disabled={!!currentTask}
                >
                  Run Health Check
                </button>
              </div>
            ) : (
              <div className="health-metrics">
                <div className="health-overview">
                  <div className="health-score-display">
                    <div className="score-circle">
                      <span className="score-value">{getOverallHealthScore()}</span>
                      <span className="score-label">Health Score</span>
                    </div>
                    <div className={`health-status-text ${healthStatus.color}`}>
                      {healthStatus.icon} {healthStatus.level}
                    </div>
                  </div>
                </div>

                <div className="metrics-grid">
                  {healthMetrics.map((metric, index) => (
                    <div key={index} className={`metric-card ${metric.status}`}>
                      <div className="metric-header">
                        <span className="metric-icon">{getHealthStatusIcon(metric.status)}</span>
                        <span className="metric-name">{metric.name}</span>
                      </div>
                      
                      <div className="metric-value">
                        <span className="value-number">{Math.round(metric.value)}</span>
                        <span className="value-unit">%</span>
                      </div>
                      
                      <div className="metric-details">
                        <div className="metric-threshold">
                          Threshold: {metric.threshold}%
                        </div>
                        <div className={`metric-status ${getHealthStatusColor(metric.status)}`}>
                          {metric.status}
                        </div>
                        <div className="metric-updated">
                          Updated: {formatTimeAgo(metric.lastUpdated)}
                        </div>
                      </div>

                      <div className="metric-progress">
                        <div
                          className={`progress-bar ${metric.status}`}
                          style={{ width: `${Math.min(100, metric.value)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="reports-panel">
            {reports.length === 0 ? (
              <div className="no-reports">
                <div className="no-reports-icon">📊</div>
                <h3>No Reports Available</h3>
                <p>Reports will appear after maintenance cycles are completed</p>
              </div>
            ) : (
              <div className="reports-list">
                {reports.map((report, index) => (
                  <div key={index} className="report-item">
                    <div className="report-header">
                      <div className="report-info">
                        <span className="report-date">
                          {new Date(report.timestamp).toLocaleString()}
                        </span>
                        <span className="report-duration">
                          Duration: {formatDuration(report.duration)}
                        </span>
                      </div>
                      
                      <div className={`report-health-score ${report.healthScore >= 80 ? 'good' : report.healthScore >= 60 ? 'fair' : 'poor'}`}>
                        {Math.round(report.healthScore)}%
                      </div>
                    </div>

                    <div className="report-summary">
                      <div className="summary-stats">
                        <div className="stat-item">
                          <span className="stat-label">Tasks Run</span>
                          <span className="stat-value">{report.tasksRun}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Succeeded</span>
                          <span className="stat-value text-green-600">{report.tasksSucceeded}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Failed</span>
                          <span className="stat-value text-red-600">{report.tasksFailed}</span>
                        </div>
                      </div>
                    </div>

                    {report.issues.length > 0 && (
                      <div className="report-issues">
                        <strong>Issues:</strong>
                        <ul>
                          {report.issues.slice(0, 3).map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                          {report.issues.length > 3 && (
                            <li>+{report.issues.length - 3} more issues</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {report.recommendations.length > 0 && (
                      <div className="report-recommendations">
                        <strong>Recommendations:</strong>
                        <ul>
                          {report.recommendations.slice(0, 2).map((rec, i) => (
                            <li key={i}>{rec}</li>
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
      <div className="maintenance-status-bar">
        <div className="status-info">
          <span>Maintenance System Active</span>
          <span>•</span>
          <span>Health: {getOverallHealthScore()}%</span>
          <span>•</span>
          <span>Auto-run: {autoRunEnabled ? 'On' : 'Off'}</span>
          <span>•</span>
          <span>Next: {formatTimeUntil(nextMaintenanceTime)}</span>
        </div>
        
        {currentTask && (
          <div className="current-task-indicator">
            <span className="task-spinner">🔄</span>
            Running: {currentTask.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceDashboard;