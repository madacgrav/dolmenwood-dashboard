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

const MAPS_COLLECTION = 'shared_maps'; // Global collection, not user-specific
const LOCAL_STORAGE_KEY = 'dolmenwood_maps';

// Track if Firebase is available
let firebaseAvailable = false;

export const initMapsStorage = async () => {
  try {
    if (!db) {
      firebaseAvailable = false;
      return false;
    }
    
    firebaseAvailable = true;
    return true;
  } catch (error) {
    console.warn('Firebase unavailable for maps, using localStorage fallback:', error);
    firebaseAvailable = false;
    return false;
  }
};

export const mapsStorage = {
  // Get all maps from Firestore or localStorage
  getMaps: async () => {
    if (firebaseAvailable) {
      try {
        const q = query(collection(db, MAPS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const maps = [];
        querySnapshot.forEach((doc) => {
          maps.push({ id: doc.id, ...doc.data() });
        });
        return maps;
      } catch (error) {
        console.error('Error reading maps from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading maps from localStorage:', error);
      return [];
    }
  },

  // Add a new map
  addMap: async (mapData) => {
    const newMap = {
      ...mapData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    if (firebaseAvailable) {
      try {
        await setDoc(
          doc(db, MAPS_COLLECTION, newMap.id),
          newMap
        );
        return newMap;
      } catch (error) {
        console.error('Error adding map to Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const maps = await mapsStorage.getMaps();
    maps.unshift(newMap); // Add to beginning for newest first
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(maps));
    return newMap;
  },

  // Delete a map
  deleteMap: async (id) => {
    if (firebaseAvailable) {
      try {
        await deleteDoc(doc(db, MAPS_COLLECTION, id));
        return await mapsStorage.getMaps();
      } catch (error) {
        console.error('Error deleting map from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const maps = await mapsStorage.getMaps();
    const filtered = maps.filter(map => map.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  },

  // Subscribe to real-time updates
  subscribeToMaps: (callback) => {
    if (!firebaseAvailable) {
      // For localStorage, just load once
      mapsStorage.getMaps().then(callback);
      return () => {}; // Return empty unsubscribe function
    }
    
    try {
      const q = query(collection(db, MAPS_COLLECTION), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const maps = [];
          snapshot.forEach((doc) => {
            maps.push({ id: doc.id, ...doc.data() });
          });
          callback(maps);
        },
        (error) => {
          console.error('Error in real-time listener for maps:', error);
          // Fallback to localStorage
          mapsStorage.getMaps().then(callback);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up listener for maps:', error);
      // Fallback to localStorage
      mapsStorage.getMaps().then(callback);
      return () => {};
    }
  }
};
