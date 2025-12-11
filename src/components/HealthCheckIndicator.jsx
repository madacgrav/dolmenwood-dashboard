import React, { useState, useEffect } from 'react';
import { startPeriodicHealthCheck, HEALTH_STATUS } from '../utils/healthCheck';
import './HealthCheckIndicator.css';

function HealthCheckIndicator() {
  const [healthStatus, setHealthStatus] = useState({
    status: HEALTH_STATUS.CHECKING,
    message: 'Checking connection...',
    timestamp: Date.now()
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Start periodic health checks with default interval
    const cleanup = startPeriodicHealthCheck((result) => {
      setHealthStatus(result);
    });

    // Cleanup on unmount
    return cleanup;
  }, []);

  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case HEALTH_STATUS.CONNECTED:
        return '🟢';
      case HEALTH_STATUS.DISCONNECTED:
        return '🔴';
      case HEALTH_STATUS.OFFLINE:
        return '⚪';
      case HEALTH_STATUS.CHECKING:
      default:
        return '🟡';
    }
  };

  const getStatusClass = () => {
    switch (healthStatus.status) {
      case HEALTH_STATUS.CONNECTED:
        return 'health-status-connected';
      case HEALTH_STATUS.DISCONNECTED:
        return 'health-status-disconnected';
      case HEALTH_STATUS.OFFLINE:
        return 'health-status-offline';
      case HEALTH_STATUS.CHECKING:
      default:
        return 'health-status-checking';
    }
  };

  const getStatusText = () => {
    switch (healthStatus.status) {
      case HEALTH_STATUS.CONNECTED:
        return 'DB Connected';
      case HEALTH_STATUS.DISCONNECTED:
        return 'DB Disconnected';
      case HEALTH_STATUS.OFFLINE:
        return 'Offline Mode';
      case HEALTH_STATUS.CHECKING:
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="health-check-container">
      <div 
        className={`health-check-indicator ${getStatusClass()}`}
        onClick={() => setShowDetails(!showDetails)}
        title={healthStatus.message}
        aria-label={`Database status: ${getStatusText()}`}
      >
        <span className="health-icon">{getStatusIcon()}</span>
        <span className="health-text">{getStatusText()}</span>
      </div>
      
      {showDetails && (
        <div className="health-details">
          <div className="health-detail-row">
            <strong>Status:</strong> {healthStatus.message}
          </div>
          {healthStatus.responseTime && (
            <div className="health-detail-row">
              <strong>Response Time:</strong> {healthStatus.responseTime}ms
            </div>
          )}
          <div className="health-detail-row">
            <strong>Last Check:</strong> {new Date(healthStatus.timestamp).toLocaleTimeString()}
          </div>
          {healthStatus.error && (
            <div className="health-detail-row health-error">
              <strong>Error:</strong> {healthStatus.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HealthCheckIndicator;
