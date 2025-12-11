import { db } from './firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

// Configuration constants
const HEALTH_CHECK_COLLECTION = 'shared_parties'; // Use shared collection for health checks
const CONNECTION_TIMEOUT_MS = 5000; // 5 seconds timeout for connectivity check
export const DEFAULT_CHECK_INTERVAL_MS = 30000; // 30 seconds between checks

// Health check status
export const HEALTH_STATUS = {
  CHECKING: 'checking',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  OFFLINE: 'offline'
};

/**
 * Check database connectivity by attempting a simple query
 * @returns {Promise<{status: string, message: string, timestamp: number}>}
 */
export const checkDatabaseConnectivity = async () => {
  const timestamp = Date.now();
  
  // If db is not initialized, we're in offline mode
  if (!db) {
    return {
      status: HEALTH_STATUS.OFFLINE,
      message: 'Using local storage (Firebase not configured)',
      timestamp
    };
  }

  try {
    // Attempt a lightweight query to test connectivity
    // Query for shared_parties collection with limit 1 (minimal data transfer)
    const testQuery = query(collection(db, HEALTH_CHECK_COLLECTION), limit(1));
    const startTime = Date.now();
    
    // Set a timeout for the query
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT_MS)
    );
    
    const queryPromise = getDocs(testQuery);
    
    await Promise.race([queryPromise, timeoutPromise]);
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: HEALTH_STATUS.CONNECTED,
      message: `Connected (${responseTime}ms)`,
      timestamp,
      responseTime
    };
  } catch (error) {
    console.warn('Database health check failed:', error);
    
    // Determine if it's a network issue or other error
    if (error.message === 'Connection timeout' || 
        error.code === 'unavailable' || 
        error.code === 'network-request-failed') {
      return {
        status: HEALTH_STATUS.DISCONNECTED,
        message: 'Cannot reach database (network issue)',
        timestamp,
        error: error.message
      };
    }
    
    return {
      status: HEALTH_STATUS.DISCONNECTED,
      message: 'Database connection error',
      timestamp,
      error: error.message
    };
  }
};

/**
 * Create a periodic health check interval
 * @param {Function} onStatusChange - Callback when status changes
 * @param {number} intervalMs - Check interval in milliseconds (default: 30000 = 30s)
 * @returns {Function} Cleanup function to stop the interval
 */
export const startPeriodicHealthCheck = (onStatusChange, intervalMs = DEFAULT_CHECK_INTERVAL_MS) => {
  let lastStatus = null;
  
  const performCheck = async () => {
    const result = await checkDatabaseConnectivity();
    
    // Only call callback if status changed
    if (result.status !== lastStatus) {
      lastStatus = result.status;
      onStatusChange(result);
    }
  };
  
  // Perform initial check
  performCheck();
  
  // Set up periodic checks
  const intervalId = setInterval(performCheck, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};
