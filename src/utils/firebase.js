import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { mockAuthService } from './mockAuth';

// Firebase configuration from environment variables
// Note: These are public configuration values and are safe to commit
// Firebase security is handled by Firestore Security Rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo"
};

// Initialize Firebase
let app = null;
let db = null;
let auth = null;
let useMockAuth = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization failed. App will use localStorage fallback.', error);
  useMockAuth = true;
}

// Authentication functions
export const authService = {
  // Sign up with email and password
  signUp: async (email, password) => {
    if (useMockAuth) {
      console.log('Using mock auth for sign up');
      return await mockAuthService.signUp(email, password);
    }
    
    if (!auth) {
      console.log('Firebase auth not available, falling back to mock auth');
      useMockAuth = true;
      return await mockAuthService.signUp(email, password);
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Error creating user:', error);
      // If Firebase fails, fall back to mock auth
      if (error.code === 'auth/network-request-failed' || error.code === 'auth/internal-error') {
        console.log('Firebase network error, falling back to mock auth');
        useMockAuth = true;
        return await mockAuthService.signUp(email, password);
      }
      throw error;
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    if (useMockAuth) {
      console.log('Using mock auth for sign in');
      return await mockAuthService.signIn(email, password);
    }
    
    if (!auth) {
      console.log('Firebase auth not available, falling back to mock auth');
      useMockAuth = true;
      return await mockAuthService.signIn(email, password);
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      // If Firebase fails, fall back to mock auth
      if (error.code === 'auth/network-request-failed' || error.code === 'auth/internal-error') {
        console.log('Firebase network error, falling back to mock auth');
        useMockAuth = true;
        return await mockAuthService.signIn(email, password);
      }
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    if (useMockAuth) {
      console.log('Using mock auth for sign out');
      await mockAuthService.signOut();
      // Trigger auth state change
      window.location.reload();
      return;
    }
    
    if (!auth) {
      console.log('Firebase auth not available, falling back to mock auth');
      useMockAuth = true;
      await mockAuthService.signOut();
      window.location.reload();
      return;
    }
    
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      // If Firebase fails, fall back to mock auth
      useMockAuth = true;
      await mockAuthService.signOut();
      window.location.reload();
    }
  },

  // Get current user
  getCurrentUser: () => {
    if (useMockAuth) {
      return mockAuthService.getCurrentUser();
    }
    return auth?.currentUser || null;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    // Check if we have a mock user first
    const mockUser = mockAuthService.getCurrentUser();
    
    if (useMockAuth || mockUser) {
      console.log('Using mock auth state listener');
      useMockAuth = true;
      return mockAuthService.onAuthStateChanged(callback);
    }
    
    if (!auth) {
      console.log('Firebase auth not available, falling back to mock auth');
      useMockAuth = true;
      return mockAuthService.onAuthStateChanged(callback);
    }
    
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Check if we have a mock user when Firebase reports no user
        const mockUser = mockAuthService.getCurrentUser();
        if (mockUser) {
          useMockAuth = true;
          callback(mockUser);
          return;
        }
      }
      callback(user);
    });
  }
};

export { db, auth };
