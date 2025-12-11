import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, authService } from './firebase';
import { partyMemberStorage } from './partyMemberStorage';

const STORAGE_KEY = 'dolmenwood_characters';
const COLLECTION_NAME = 'characters';

// Track if Firebase is available
let firebaseAvailable = false;
let userId = null;

// Initialize storage with authenticated user
export const initStorage = async () => {
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
    console.warn('Firebase unavailable, using localStorage fallback:', error);
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
    
    const characters = JSON.parse(localData);
    
    // Upload to Firestore
    for (const character of characters) {
      await setDoc(
        doc(db, `users/${userId}/${COLLECTION_NAME}`, character.id),
        character
      );
    }
    
    console.log('Successfully migrated', characters.length, 'characters to cloud storage');
  } catch (error) {
    console.error('Error migrating data:', error);
  }
};

export const storage = {
  // Get all characters from Firestore or localStorage
  getCharacters: async () => {
    if (firebaseAvailable && userId) {
      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${userId}/${COLLECTION_NAME}`)
        );
        const characters = [];
        querySnapshot.forEach((doc) => {
          characters.push(doc.data());
        });
        return characters;
      } catch (error) {
        console.error('Error reading from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // Save characters (used for initial load)
  saveCharacters: async (characters) => {
    if (firebaseAvailable && userId) {
      try {
        // Save each character to Firestore
        for (const character of characters) {
          await setDoc(
            doc(db, `users/${userId}/${COLLECTION_NAME}`, character.id),
            character
          );
        }
        return true;
      } catch (error) {
        console.error('Error writing to Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  // Add a new character
  addCharacter: async (character) => {
    const newCharacter = {
      ...character,
      id: crypto.randomUUID(),
      userId: userId, // Store userId for reference
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (firebaseAvailable && userId) {
      try {
        await setDoc(
          doc(db, `users/${userId}/${COLLECTION_NAME}`, newCharacter.id),
          newCharacter
        );
        
        // Sync to shared party members if character is in a party
        if (newCharacter.partyName) {
          await partyMemberStorage.savePartyMember(newCharacter);
        }
        
        return newCharacter;
      } catch (error) {
        console.error('Error adding to Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const characters = await storage.getCharacters();
    characters.push(newCharacter);
    await storage.saveCharacters(characters);
    
    // Sync to shared party members if character is in a party
    if (newCharacter.partyName) {
      await partyMemberStorage.savePartyMember(newCharacter);
    }
    
    return newCharacter;
  },

  // Update a character
  updateCharacter: async (id, updates) => {
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
        
        // Sync to shared party members
        const fullData = { id, userId, ...updatedData };
        if (fullData.partyName) {
          await partyMemberStorage.savePartyMember(fullData);
        } else {
          // Character left the party, remove from shared collection
          await partyMemberStorage.removePartyMember(id);
        }
        
        // Return the merged data
        return fullData;
      } catch (error) {
        console.error('Error updating in Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const characters = await storage.getCharacters();
    const index = characters.findIndex(char => char.id === id);
    if (index !== -1) {
      characters[index] = { ...characters[index], ...updatedData };
      await storage.saveCharacters(characters);
      
      // Sync to shared party members
      if (characters[index].partyName) {
        await partyMemberStorage.savePartyMember(characters[index]);
      } else {
        // Character left the party, remove from shared collection
        await partyMemberStorage.removePartyMember(id);
      }
      
      return characters[index];
    }
    return null;
  },

  // Delete a character
  deleteCharacter: async (id) => {
    if (firebaseAvailable && userId) {
      try {
        await deleteDoc(doc(db, `users/${userId}/${COLLECTION_NAME}`, id));
        
        // Remove from shared party members
        await partyMemberStorage.removePartyMember(id);
        
        return await storage.getCharacters();
      } catch (error) {
        console.error('Error deleting from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const characters = await storage.getCharacters();
    const filtered = characters.filter(char => char.id !== id);
    await storage.saveCharacters(filtered);
    
    // Remove from shared party members
    await partyMemberStorage.removePartyMember(id);
    
    return filtered;
  },

  // Subscribe to real-time updates
  subscribeToCharacters: (callback) => {
    if (!firebaseAvailable || !userId) {
      return () => {}; // Return empty unsubscribe function
    }
    
    try {
      const unsubscribe = onSnapshot(
        collection(db, `users/${userId}/${COLLECTION_NAME}`),
        (snapshot) => {
          const characters = [];
          snapshot.forEach((doc) => {
            characters.push(doc.data());
          });
          callback(characters);
        },
        (error) => {
          console.error('Error in real-time listener:', error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up listener:', error);
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
        console.error('Error clearing Firestore:', error);
      }
    }
  }
};
