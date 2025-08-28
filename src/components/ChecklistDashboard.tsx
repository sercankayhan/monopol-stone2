"use client";

// Checklist Dashboard Component
// Based on CLAUDE-PART2.md - UI for implementation checklist system

import React, { useState, useEffect } from 'react';
import { useImplementationChecklist } from './ImplementationChecklist';

interface ChecklistDashboardProps {
  className?: string;
  autoInitialize?: boolean;
  showProgress?: boolean;
}

const ChecklistDashboard: React.FC<ChecklistDashboardProps> = ({
  className = '',
  autoInitialize = true,
  showProgress = true
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'phases' | 'progress' | 'timeline'>('overview');
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [showCompletedItems, setShowCompletedItems] = useState(false);

  const {
    isActive,
    phases,
    currentPhase,
    stats,
    notifications,
    initialize,
    cleanup,
    startItem,
    completeItem,
    skipItem,
    failItem,
    autoCheckItem,
    validateItem,
    getNextAvailableItems,
    dismissNotification,
    setCurrentPhase
  } = useImplementationChecklist();

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

  useEffect(() => {
    if (phases.length > 0 && !selectedPhase) {
      setSelectedPhase(phases[0].id);
    }
  }, [phases, selectedPhase]);

  const getPhaseById = (phaseId: string) => {
    return phases.find(phase => phase.id === phaseId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'skipped': return 'text-yellow-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-gray-400';
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

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'blocked': return 'text-red-600';
      case 'not-started': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getItemsToShow = (phaseItems: any[]) => {
    if (showCompletedItems) return phaseItems;
    return phaseItems.filter(item => item.status !== 'completed');
  };

  const handleItemAction = async (itemId: string, action: 'start' | 'complete' | 'skip' | 'fail' | 'validate') => {
    switch (action) {
      case 'start':
        startItem(itemId);
        break;
      case 'complete':
        const notes = prompt('Add completion notes (optional):');
        await completeItem(itemId, notes || undefined);
        break;
      case 'skip':
        const reason = prompt('Why are you skipping this item?');
        if (reason) skipItem(itemId, reason);
        break;
      case 'fail':
        const error = prompt('Describe the failure:');
        if (error) failItem(itemId, error);
        break;
      case 'validate':
        const validation = await validateItem(itemId);
        if (validation.valid) {
          alert('✅ Validation passed!');
          await completeItem(itemId, 'Completed via validation');
        } else {
          alert(`❌ Validation failed:\n${validation.errors.join('\n')}`);
        }
        break;
    }
  };

  if (!isActive) {
    return (
      <div className={`checklist-dashboard-inactive ${className}`}>
        <div className="inactive-state">
          <div className="inactive-icon">✅</div>
          <h3>Implementation Checklist Inactive</h3>
          <p>Initialize the checklist system to start your responsive implementation journey</p>
          <button onClick={initialize} className="inactive-action-button">
            Initialize Checklist
          </button>
        </div>
      </div>
    );
  }

  const nextAvailableItems = getNextAvailableItems();
  const currentPhaseData = getPhaseById(currentPhase || '');

  return (
    <div className={`checklist-dashboard ${className}`}>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.slice(0, 3).map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              <div className="notification-content">
                <span className="notification-message">{notification.message}</span>
                <span className="notification-time">{formatTimeAgo(notification.timestamp)}</span>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="notification-dismiss"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard Header */}
      <div className="checklist-header">
        <div className="checklist-title">
          <span>✅ Implementation Checklist</span>
          <span className="progress-summary">
            {stats.completedItems}/{stats.totalItems} completed ({Math.round(stats.completionRate)}%)
          </span>
        </div>
        
        <div className="checklist-controls">
          <div className="phase-selector">
            <label>Current Phase:</label>
            <select
              value={currentPhase || ''}
              onChange={(e) => setCurrentPhase(e.target.value)}
              className="phase-select"
            >
              {phases.map(phase => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </select>
          </div>
          
          <label className="toggle-completed">
            <input
              type="checkbox"
              checked={showCompletedItems}
              onChange={(e) => setShowCompletedItems(e.target.checked)}
            />
            Show completed
          </label>
        </div>
      </div>

      {/* Progress Overview */}
      {showProgress && (
        <div className="progress-overview">
          <div className="overall-progress">
            <div className="progress-circle">
              <div className="progress-value">{Math.round(stats.completionRate)}</div>
              <div className="progress-label">% Complete</div>
            </div>
            <div className="progress-details">
              <div className="progress-stats">
                <div className="stat-item">
                  <span className="stat-value text-green-600">{stats.completedItems}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value text-blue-600">{stats.inProgressItems}</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value text-red-600">{stats.failedItems}</span>
                  <span className="stat-label">Failed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value text-yellow-600">{stats.blockedItems}</span>
                  <span className="stat-label">Blocked</span>
                </div>
              </div>
            </div>
          </div>

          <div className="phase-progress">
            <h4>Phase Progress</h4>
            <div className="phases-grid">
              {phases.map(phase => (
                <div
                  key={phase.id}
                  className={`phase-card ${phase.id === currentPhase ? 'current' : ''} ${phase.status}`}
                  onClick={() => {
                    setCurrentPhase(phase.id);
                    setSelectedPhase(phase.id);
                  }}
                >
                  <div className="phase-name">{phase.name}</div>
                  <div className="phase-completion">{Math.round(phase.completionRate)}%</div>
                  <div className={`phase-status ${getPhaseStatusColor(phase.status)}`}>
                    {phase.status}
                  </div>
                  <div className="phase-progress-bar">
                    <div
                      className={`progress-fill ${phase.status}`}
                      style={{ width: `${phase.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="checklist-tabs">
        <button
          className={`tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeView === 'phases' ? 'active' : ''}`}
          onClick={() => setActiveView('phases')}
        >
          Phases
        </button>
        <button
          className={`tab ${activeView === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveView('progress')}
        >
          Progress
        </button>
        <button
          className={`tab ${activeView === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveView('timeline')}
        >
          Timeline
        </button>
      </div>

      {/* Tab Content */}
      <div className="checklist-content">
        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="overview-panel">
            <div className="next-items">
              <h3>Next Available Items</h3>
              {nextAvailableItems.length === 0 ? (
                <div className="no-items">
                  <div className="no-items-icon">🎉</div>
                  <p>All available items completed! Great progress!</p>
                </div>
              ) : (
                <div className="items-list">
                  {nextAvailableItems.slice(0, 5).map(item => (
                    <div key={item.id} className={`item-card next-item ${item.priority}`}>
                      <div className="item-header">
                        <div className="item-info">
                          <span className="item-priority">{getPriorityIcon(item.priority)}</span>
                          <span className="item-title">{item.title}</span>
                          <span className="item-time">{formatTime(item.estimatedTime)}</span>
                        </div>
                        <button
                          onClick={() => handleItemAction(item.id, 'start')}
                          className="item-start-button"
                        >
                          Start
                        </button>
                      </div>
                      <div className="item-description">{item.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="current-phase-overview">
              <h3>Current Phase: {currentPhaseData?.name}</h3>
              {currentPhaseData && (
                <div className="phase-details">
                  <div className="phase-description">{currentPhaseData.description}</div>
                  <div className="phase-stats">
                    <div className="phase-completion">
                      Progress: {Math.round(currentPhaseData.completionRate)}%
                    </div>
                    <div className="phase-items-count">
                      Items: {currentPhaseData.items.filter(i => i.status === 'completed').length}/{currentPhaseData.items.length}
                    </div>
                  </div>
                  
                  <div className="phase-items-preview">
                    {getItemsToShow(currentPhaseData.items).slice(0, 3).map(item => (
                      <div key={item.id} className={`preview-item ${item.status}`}>
                        <span className="preview-status">{getStatusIcon(item.status)}</span>
                        <span className="preview-title">{item.title}</span>
                        <span className={`preview-priority ${getPriorityColor(item.priority)}`}>
                          {getPriorityIcon(item.priority)}
                        </span>
                      </div>
                    ))}
                    {currentPhaseData.items.length > 3 && (
                      <div className="preview-more">
                        +{currentPhaseData.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phases Tab */}
        {activeView === 'phases' && (
          <div className="phases-panel">
            <div className="phase-selector-tabs">
              {phases.map(phase => (
                <button
                  key={phase.id}
                  className={`phase-tab ${selectedPhase === phase.id ? 'active' : ''} ${phase.status}`}
                  onClick={() => setSelectedPhase(phase.id)}
                >
                  <span className="phase-tab-name">{phase.name}</span>
                  <span className="phase-tab-progress">{Math.round(phase.completionRate)}%</span>
                </button>
              ))}
            </div>

            {selectedPhase && (
              <div className="phase-content">
                {(() => {
                  const phase = getPhaseById(selectedPhase);
                  if (!phase) return null;

                  return (
                    <div className="phase-details-full">
                      <div className="phase-header">
                        <h3>{phase.name}</h3>
                        <div className="phase-meta">
                          <span className={`phase-status-badge ${getPhaseStatusColor(phase.status)}`}>
                            {phase.status}
                          </span>
                          <span className="phase-progress-text">
                            {Math.round(phase.completionRate)}% complete
                          </span>
                        </div>
                      </div>
                      
                      <div className="phase-description">{phase.description}</div>

                      <div className="phase-items-full">
                        {getItemsToShow(phase.items).map(item => (
                          <div key={item.id} className={`checklist-item ${item.status} ${item.priority}`}>
                            <div className="item-header">
                              <div className="item-main-info">
                                <span className="item-status-icon">{getStatusIcon(item.status)}</span>
                                <div className="item-title-section">
                                  <div className="item-title">{item.title}</div>
                                  <div className="item-description">{item.description}</div>
                                </div>
                                <div className="item-meta">
                                  <span className={`item-priority-badge ${getPriorityColor(item.priority)}`}>
                                    {getPriorityIcon(item.priority)} {item.priority}
                                  </span>
                                  <span className="item-estimated-time">
                                    {formatTime(item.estimatedTime)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="item-actions">
                                {item.status === 'pending' && (
                                  <button
                                    onClick={() => handleItemAction(item.id, 'start')}
                                    className="item-action-button start"
                                    disabled={item.dependencies.some(dep => {
                                      const depItem = phases.flatMap(p => p.items).find(i => i.id === dep);
                                      return depItem?.status !== 'completed';
                                    })}
                                  >
                                    Start
                                  </button>
                                )}
                                
                                {item.status === 'in-progress' && (
                                  <>
                                    <button
                                      onClick={() => handleItemAction(item.id, 'complete')}
                                      className="item-action-button complete"
                                    >
                                      Complete
                                    </button>
                                    <button
                                      onClick={() => handleItemAction(item.id, 'fail')}
                                      className="item-action-button fail"
                                    >
                                      Mark Failed
                                    </button>
                                  </>
                                )}
                                
                                {(item.status === 'pending' || item.status === 'in-progress') && (
                                  <button
                                    onClick={() => handleItemAction(item.id, 'skip')}
                                    className="item-action-button skip"
                                  >
                                    Skip
                                  </button>
                                )}
                                
                                {item.autoCheck && (
                                  <button
                                    onClick={() => autoCheckItem(item.id)}
                                    className="item-action-button auto-check"
                                  >
                                    Auto-check
                                  </button>
                                )}
                                
                                {item.validationRules && item.validationRules.length > 0 && (
                                  <button
                                    onClick={() => handleItemAction(item.id, 'validate')}
                                    className="item-action-button validate"
                                  >
                                    Validate
                                  </button>
                                )}
                              </div>
                            </div>

                            {item.dependencies.length > 0 && (
                              <div className="item-dependencies">
                                <strong>Dependencies:</strong>
                                <div className="dependencies-list">
                                  {item.dependencies.map(depId => {
                                    const depItem = phases.flatMap(p => p.items).find(i => i.id === depId);
                                    return (
                                      <span key={depId} className={`dependency ${depItem?.status || 'unknown'}`}>
                                        {getStatusIcon(depItem?.status || 'unknown')} {depItem?.title || depId}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {item.notes && (
                              <div className="item-notes">
                                <strong>Notes:</strong> {item.notes}
                              </div>
                            )}

                            {item.actualTime && (
                              <div className="item-timing">
                                <strong>Time taken:</strong> {formatTime(Math.round(item.actualTime / 60000))}
                                {item.estimatedTime && (
                                  <span className="time-comparison">
                                    (estimated: {formatTime(item.estimatedTime)})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeView === 'progress' && (
          <div className="progress-panel">
            <div className="overall-stats">
              <h3>Implementation Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card total">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.totalItems}</div>
                    <div className="stat-label">Total Items</div>
                  </div>
                </div>

                <div className="stat-card completed">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-value text-green-600">{stats.completedItems}</div>
                    <div className="stat-label">Completed</div>
                  </div>
                </div>

                <div className="stat-card in-progress">
                  <div className="stat-icon">🔄</div>
                  <div className="stat-content">
                    <div className="stat-value text-blue-600">{stats.inProgressItems}</div>
                    <div className="stat-label">In Progress</div>
                  </div>
                </div>

                <div className="stat-card time">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-content">
                    <div className="stat-value">{formatTime(stats.actualTimeSpent / 60000)}</div>
                    <div className="stat-label">Time Spent</div>
                  </div>
                </div>

                <div className="stat-card estimated">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-value">{formatTime(stats.totalEstimatedTime)}</div>
                    <div className="stat-label">Total Estimated</div>
                  </div>
                </div>

                <div className="stat-card blocked">
                  <div className="stat-icon">🚫</div>
                  <div className="stat-content">
                    <div className="stat-value text-red-600">{stats.blockedItems}</div>
                    <div className="stat-label">Blocked</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="phases-breakdown">
              <h3>Phase Breakdown</h3>
              <div className="breakdown-list">
                {phases.map(phase => (
                  <div key={phase.id} className="breakdown-item">
                    <div className="breakdown-header">
                      <div className="breakdown-name">{phase.name}</div>
                      <div className="breakdown-stats">
                        <span className="breakdown-progress">{Math.round(phase.completionRate)}%</span>
                        <span className="breakdown-count">
                          {phase.items.filter(i => i.status === 'completed').length}/{phase.items.length}
                        </span>
                      </div>
                    </div>
                    <div className="breakdown-progress-bar">
                      <div
                        className={`breakdown-progress-fill ${phase.status}`}
                        style={{ width: `${phase.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="breakdown-details">
                      <div className="breakdown-categories">
                        {['critical', 'high', 'medium', 'low'].map(priority => {
                          const priorityItems = phase.items.filter(i => i.priority === priority);
                          if (priorityItems.length === 0) return null;
                          const completed = priorityItems.filter(i => i.status === 'completed').length;
                          return (
                            <span key={priority} className={`priority-breakdown ${priority}`}>
                              {getPriorityIcon(priority)} {completed}/{priorityItems.length}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeView === 'timeline' && (
          <div className="timeline-panel">
            <div className="timeline-header">
              <h3>Implementation Timeline</h3>
              <div className="timeline-controls">
                <button
                  onClick={() => setShowCompletedItems(!showCompletedItems)}
                  className={`timeline-filter ${showCompletedItems ? 'active' : ''}`}
                >
                  {showCompletedItems ? 'Hide completed' : 'Show completed'}
                </button>
              </div>
            </div>

            <div className="timeline">
              {phases.map((phase, phaseIndex) => (
                <div key={phase.id} className={`timeline-phase ${phase.status}`}>
                  <div className="timeline-phase-header">
                    <div className="phase-marker">{phaseIndex + 1}</div>
                    <div className="phase-info">
                      <div className="phase-name">{phase.name}</div>
                      <div className="phase-status">{Math.round(phase.completionRate)}% complete</div>
                    </div>
                  </div>
                  
                  <div className="timeline-items">
                    {getItemsToShow(phase.items).map((item, itemIndex) => (
                      <div key={item.id} className={`timeline-item ${item.status}`}>
                        <div className="item-marker">
                          <span className="item-status-dot">{getStatusIcon(item.status)}</span>
                          <div className="item-connector"></div>
                        </div>
                        <div className="item-content">
                          <div className="item-header">
                            <div className="item-title">{item.title}</div>
                            <div className="item-meta">
                              <span className={`item-priority ${getPriorityColor(item.priority)}`}>
                                {getPriorityIcon(item.priority)}
                              </span>
                              <span className="item-time">{formatTime(item.estimatedTime)}</span>
                            </div>
                          </div>
                          <div className="item-description">{item.description}</div>
                          
                          {item.completedTime && (
                            <div className="item-completed-time">
                              Completed {formatTimeAgo(item.completedTime)}
                            </div>
                          )}
                          
                          {item.status === 'in-progress' && (
                            <div className="item-in-progress">
                              Started {item.startTime ? formatTimeAgo(item.startTime) : 'recently'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="checklist-status-bar">
        <div className="status-info">
          <span>Progress: {Math.round(stats.completionRate)}%</span>
          <span>•</span>
          <span>Phase: {currentPhaseData?.name}</span>
          <span>•</span>
          <span>Next: {nextAvailableItems.length} items</span>
          <span>•</span>
          <span>Time: {formatTime(stats.actualTimeSpent / 60000)} / {formatTime(stats.totalEstimatedTime)}</span>
        </div>
        
        <div className="status-actions">
          <button
            onClick={() => console.log('Checklist data:', { phases, stats, nextAvailableItems })}
            className="status-button"
          >
            Export Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistDashboard;