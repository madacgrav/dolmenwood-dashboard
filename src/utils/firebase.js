import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization failed. App will use localStorage fallback.', error);
}

// Sign in anonymously to allow read/write access
// This allows users to use the app without creating an account
let authInitialized = false;

export const initAuth = async () => {
  if (!auth) {
    throw new Error('Firebase not initialized');
  }
  
  if (authInitialized) return auth.currentUser;
  
  try {
    const userCredential = await signInAnonymously(auth);
    authInitialized = true;
    console.log('Signed in anonymously with user ID:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

export { db, auth };
