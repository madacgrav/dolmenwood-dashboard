import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, authService } from './firebase';

const STORAGE_KEY = 'dolmenwood_parties';
const COLLECTION_NAME = 'parties';

// Track if Firebase is available
let firebaseAvailable = false;
let userId = null;

// Initialize storage with authenticated user
export const initPartyStorage = async () => {
  try {
    const user = authService.getCurrentUser();
    if (!user) {
      // No authenticated user, use localStorage only
      firebaseAvailable = false;
      userId = null;
      return false;
    }
    
    userId = user.uid;
    firebaseAvailable = true;
    
    // Migrate localStorage data to Firestore on first use
    await migrateLocalStorageToFirestore();
    
    return true;
  } catch (error) {
    console.warn('Firebase unavailable for parties, using localStorage fallback:', error);
    firebaseAvailable = false;
    return false;
  }
};

// Migrate existing localStorage data to Firestore
const migrateLocalStorageToFirestore = async () => {
  if (!firebaseAvailable || !userId) return;
  
  try {
    // Check if Firestore already has data
    const snapshot = await getDocs(collection(db, `users/${userId}/${COLLECTION_NAME}`));
    if (!snapshot.empty) return; // Already has data, don't migrate
    
    // Get localStorage data
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) return;
    
    const parties = JSON.parse(localData);
    
    // Upload to Firestore
    for (const party of parties) {
      await setDoc(
        doc(db, `users/${userId}/${COLLECTION_NAME}`, party.id),
        party
      );
    }
    
    console.log('Successfully migrated', parties.length, 'parties to cloud storage');
  } catch (error) {
    console.error('Error migrating party data:', error);
  }
};

export const partyStorage = {
  // Get all parties from Firestore or localStorage
  getParties: async () => {
    if (firebaseAvailable && userId) {
      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${userId}/${COLLECTION_NAME}`)
        );
        const parties = [];
        querySnapshot.forEach((doc) => {
          parties.push(doc.data());
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

  // Save parties (used for initial load)
  saveParties: async (parties) => {
    if (firebaseAvailable && userId) {
      try {
        // Save each party to Firestore
        for (const party of parties) {
          await setDoc(
            doc(db, `users/${userId}/${COLLECTION_NAME}`, party.id),
            party
          );
        }
        return true;
      } catch (error) {
        console.error('Error writing parties to Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
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
    const newParty = {
      ...party,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (firebaseAvailable && userId) {
      try {
        await setDoc(
          doc(db, `users/${userId}/${COLLECTION_NAME}`, newParty.id),
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
    parties.push(newParty);
    await partyStorage.saveParties(parties);
    return newParty;
  },

  // Update a party
  updateParty: async (id, updates) => {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    if (firebaseAvailable && userId) {
      try {
        await setDoc(
          doc(db, `users/${userId}/${COLLECTION_NAME}`, id),
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
    if (firebaseAvailable && userId) {
      try {
        await deleteDoc(doc(db, `users/${userId}/${COLLECTION_NAME}`, id));
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
    if (!firebaseAvailable || !userId) {
      return () => {}; // Return empty unsubscribe function
    }
    
    try {
      const unsubscribe = onSnapshot(
        collection(db, `users/${userId}/${COLLECTION_NAME}`),
        (snapshot) => {
          const parties = [];
          snapshot.forEach((doc) => {
            parties.push(doc.data());
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
    
    if (firebaseAvailable && userId) {
      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${userId}/${COLLECTION_NAME}`)
        );
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
