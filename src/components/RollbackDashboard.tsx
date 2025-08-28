"use client";

// Emergency Rollback Dashboard
// Based on CLAUDE-PART2.md - UI for emergency rollback system

import React, { useState, useEffect } from 'react';
import { useEmergencyRollback } from './EmergencyRollback';

interface RollbackDashboardProps {
  className?: string;
  showInProduction?: boolean;
  autoInitialize?: boolean;
}

const RollbackDashboard: React.FC<RollbackDashboardProps> = ({
  className = '',
  showInProduction = false,
  autoInitialize = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confirmRollback, setConfirmRollback] = useState<string | null>(null);
  
  const {
    initialize,
    cleanup,
    createRollbackPoint,
    executeRollback,
    rollbackPoints,
    healthMetrics,
    getSystemStatus,
    isActive
  } = useEmergencyRollback();

  const status = getSystemStatus();

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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getHealthStatus = () => {
    const { jsErrors, layoutShifts, performanceIssues, renderingProblems } = healthMetrics;
    const totalIssues = jsErrors + layoutShifts + performanceIssues + renderingProblems;
    
    if (totalIssues === 0) return { level: 'excellent', color: 'text-green-600', icon: '💚' };
    if (totalIssues <= 5) return { level: 'good', color: 'text-yellow-600', icon: '💛' };
    if (totalIssues <= 15) return { level: 'warning', color: 'text-orange-600', icon: '🧡' };
    return { level: 'critical', color: 'text-red-600', icon: '❤️' };
  };

  const healthStatus = getHealthStatus();

  const handleRollback = async (rollbackPointId?: string) => {
    const success = await executeRollback(rollbackPointId);
    if (success) {
      setConfirmRollback(null);
    }
  };

  const handleCreateRollbackPoint = () => {
    const label = prompt('Enter rollback point label:');
    if (label) {
      createRollbackPoint(label);
    }
  };

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-32 right-4 z-50 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all"
        title="Emergency Rollback"
      >
        🚨
      </button>
    );
  }

  return (
    <div className={`rollback-dashboard ${className}`}>
      {/* Dashboard Header */}
      <div className="rollback-header">
        <div className="rollback-title">
          <span>🚨 Emergency Rollback</span>
          <span className={`system-status ${healthStatus.color}`}>
            {healthStatus.icon} {healthStatus.level.toUpperCase()}
          </span>
        </div>
        
        <div className="rollback-controls">
          <button
            onClick={handleCreateRollbackPoint}
            className="rollback-button create"
            disabled={!isActive}
          >
            Create Point
          </button>
          
          <button
            onClick={() => setConfirmRollback('latest')}
            className="rollback-button emergency"
            disabled={!status.canRollback}
          >
            Emergency Rollback
          </button>
          
          {process.env.NODE_ENV !== 'production' && (
            <button onClick={() => setIsVisible(false)} className="rollback-button close">
              ×
            </button>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="system-status-panel">
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">System Status</div>
            <div className={`status-value ${status.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {status.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Rollback Points</div>
            <div className="status-value text-blue-600">{status.rollbackPointsCount}</div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Can Rollback</div>
            <div className={`status-value ${status.canRollback ? 'text-green-600' : 'text-red-600'}`}>
              {status.canRollback ? 'Yes' : 'No'}
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Is Rolled Back</div>
            <div className={`status-value ${status.isRolledBack ? 'text-orange-600' : 'text-green-600'}`}>
              {status.isRolledBack ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="health-metrics">
        <div className="metrics-header">
          <span>System Health</span>
          <span className="metrics-updated">
            Updated {getTimeAgo(healthMetrics.lastUpdated)}
          </span>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">JS Errors</div>
            <div className={`metric-value ${healthMetrics.jsErrors > 3 ? 'text-red-600' : 'text-green-600'}`}>
              {healthMetrics.jsErrors}
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Layout Shifts</div>
            <div className={`metric-value ${healthMetrics.layoutShifts > 10 ? 'text-red-600' : 'text-green-600'}`}>
              {healthMetrics.layoutShifts}
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Performance Issues</div>
            <div className={`metric-value ${healthMetrics.performanceIssues > 5 ? 'text-red-600' : 'text-green-600'}`}>
              {healthMetrics.performanceIssues}
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Rendering Problems</div>
            <div className={`metric-value ${healthMetrics.renderingProblems > 3 ? 'text-red-600' : 'text-green-600'}`}>
              {healthMetrics.renderingProblems}
            </div>
          </div>
        </div>
      </div>

      {/* Rollback Points */}
      {rollbackPoints.length > 0 && (
        <div className="rollback-points">
          <div className="points-header">
            <span>Rollback Points ({rollbackPoints.length})</span>
          </div>
          
          <div className="points-list">
            {rollbackPoints.slice(0, 10).map((point, index) => (
              <div key={point.id} className={`point-item ${index === 0 ? 'latest' : ''}`}>
                <div className="point-info">
                  <div className="point-header">
                    <span className="point-label">{point.label}</span>
                    {point.automatic && <span className="point-auto">AUTO</span>}
                    {index === 0 && <span className="point-latest">LATEST</span>}
                  </div>
                  <div className="point-meta">
                    <span className="point-time">{formatTime(point.timestamp)}</span>
                    <span className="point-ago">({getTimeAgo(point.timestamp)})</span>
                  </div>
                </div>
                
                <div className="point-actions">
                  <button
                    onClick={() => setConfirmRollback(point.id)}
                    className="point-rollback-btn"
                  >
                    Rollback
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmRollback && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <div className="confirm-header">
              <h3>⚠️ Confirm Rollback</h3>
            </div>
            
            <div className="confirm-content">
              <p>This will rollback all responsive enhancements and return the system to a previous state.</p>
              <p><strong>This action cannot be undone.</strong></p>
              
              {confirmRollback === 'latest' ? (
                <p>Rolling back to: <strong>Latest rollback point</strong></p>
              ) : (
                <p>Rolling back to: <strong>
                  {rollbackPoints.find(p => p.id === confirmRollback)?.label || 'Selected point'}
                </strong></p>
              )}
            </div>
            
            <div className="confirm-actions">
              <button
                onClick={() => setConfirmRollback(null)}
                className="confirm-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRollback(confirmRollback === 'latest' ? undefined : confirmRollback)}
                className="confirm-btn danger"
              >
                Execute Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Instructions */}
      <div className="emergency-instructions">
        <details>
          <summary>🆘 Emergency Procedures</summary>
          <div className="instructions-content">
            <h4>Keyboard Shortcuts:</h4>
            <ul>
              <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> - Emergency rollback</li>
            </ul>
            
            <h4>Console Commands:</h4>
            <ul>
              <li><code>window.ResponsiveRollback.execute()</code> - Execute rollback</li>
              <li><code>window.ResponsiveRollback.getHealth()</code> - Get health status</li>
            </ul>
            
            <h4>When to Use:</h4>
            <ul>
              <li>Site becomes unresponsive on mobile</li>
              <li>Navigation stops working</li>
              <li>Layout breaks completely</li>
              <li>Performance degrades significantly</li>
            </ul>
          </div>
        </details>
      </div>

      {/* Empty State */}
      {!isActive && (
        <div className="empty-state">
          <div className="empty-icon">🚨</div>
          <h3>Rollback System Inactive</h3>
          <p>Emergency rollback system is not initialized</p>
          <button onClick={initialize} className="empty-action-button">
            Initialize System
          </button>
        </div>
      )}
    </div>
  );
};

export default RollbackDashboard;