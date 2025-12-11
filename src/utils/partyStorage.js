import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY = 'dolmenwood_parties';
const COLLECTION_NAME = 'shared_parties'; // Global collection, accessible to all users

// Track if Firebase is available
let firebaseAvailable = false;

// Initialize storage (no user-specific setup needed for shared data)
export const initPartyStorage = async () => {
  try {
    if (!db) {
      firebaseAvailable = false;
      return false;
    }
    
    firebaseAvailable = true;
    return true;
  } catch (error) {
    console.warn('Firebase unavailable for parties, using localStorage fallback:', error);
    firebaseAvailable = false;
    return false;
  }
};

export const partyStorage = {
  // Get all parties from Firestore or localStorage
  getParties: async () => {
    if (firebaseAvailable) {
      try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const parties = [];
        querySnapshot.forEach((doc) => {
          parties.push({ id: doc.id, ...doc.data() });
        });
        return parties;
      } catch (error) {
        console.error('Error reading parties from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading parties from localStorage:', error);
      return [];
    }
  },

  // Save parties (used for localStorage)
  saveParties: async (parties) => {
    // localStorage only - Firebase uses individual documents
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
      return true;
    } catch (error) {
      console.error('Error writing parties to localStorage:', error);
      return false;
    }
  },

  // Add a new party
  addParty: async (party) => {
    // Extract only allowed fields to prevent system field overrides
    const { name, description } = party;
    const newParty = {
      name: name || '',
      description: description || '',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (firebaseAvailable) {
      try {
        await setDoc(
          doc(db, COLLECTION_NAME, newParty.id),
          newParty
        );
        return newParty;
      } catch (error) {
        console.error('Error adding party to Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const parties = await partyStorage.getParties();
    parties.unshift(newParty); // Add to beginning for newest first
    await partyStorage.saveParties(parties);
    return newParty;
  },

  // Update a party
  updateParty: async (id, updates) => {
    // Extract only allowed fields to prevent system field overrides
    const { name, description } = updates;
    const updatedData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      updatedAt: new Date().toISOString()
    };
    
    if (firebaseAvailable) {
      try {
        await setDoc(
          doc(db, COLLECTION_NAME, id),
          updatedData,
          { merge: true }
        );
        // Return the merged data
        return { id, ...updatedData };
      } catch (error) {
        console.error('Error updating party in Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const parties = await partyStorage.getParties();
    const index = parties.findIndex(p => p.id === id);
    if (index !== -1) {
      parties[index] = { ...parties[index], ...updatedData };
      await partyStorage.saveParties(parties);
      return parties[index];
    }
    return null;
  },

  // Delete a party
  deleteParty: async (id) => {
    if (firebaseAvailable) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        return await partyStorage.getParties();
      } catch (error) {
        console.error('Error deleting party from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const parties = await partyStorage.getParties();
    const filtered = parties.filter(p => p.id !== id);
    await partyStorage.saveParties(filtered);
    return filtered;
  },

  // Subscribe to real-time updates
  subscribeToParties: (callback) => {
    if (!firebaseAvailable) {
      return () => {}; // Return empty unsubscribe function
    }
    
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const parties = [];
          snapshot.forEach((doc) => {
            parties.push({ id: doc.id, ...doc.data() });
          });
          callback(parties);
        },
        (error) => {
          console.error('Error in party real-time listener:', error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up party listener:', error);
      return () => {};
    }
  },

  clearAll: async () => {
    localStorage.removeItem(STORAGE_KEY);
    
    if (firebaseAvailable) {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const deletePromises = [];
        querySnapshot.forEach((document) => {
          deletePromises.push(deleteDoc(document.ref));
        });
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error clearing parties from Firestore:', error);
      }
    }
  }
};
