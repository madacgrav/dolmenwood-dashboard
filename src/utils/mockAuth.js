// Mock authentication for testing when Firebase is unavailable
// This simulates Firebase auth behavior using localStorage

const MOCK_USER_KEY = 'mock_user';
const AUTH_CHANGE_EVENT = 'mock-auth-change';

// Helper to trigger auth state change
const triggerAuthChange = () => {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
};

export const mockAuthService = {
  // Sign up with email and password
  signUp: async (email, password) => {
    // Simulate a slight delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = {
      uid: `mock-${Date.now()}`,
      email: email,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    triggerAuthChange();
    return user;
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    // Simulate a slight delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = {
      uid: `mock-${Date.now()}`,
      email: email,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    triggerAuthChange();
    return user;
  },

  // Sign out
  signOut: async () => {
    localStorage.removeItem(MOCK_USER_KEY);
    triggerAuthChange();
  },

  // Get current user
  getCurrentUser: () => {
    const stored = localStorage.getItem(MOCK_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    // Call immediately with current user
    const user = mockAuthService.getCurrentUser();
    setTimeout(() => callback(user), 0);
    
    // Listen for changes
    const listener = () => {
      const user = mockAuthService.getCurrentUser();
      callback(user);
    };
    
    window.addEventListener(AUTH_CHANGE_EVENT, listener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    };
  }
};
