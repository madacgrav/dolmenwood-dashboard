import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where 
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY = 'dolmenwood_party_members';
const COLLECTION_NAME = 'shared_party_members'; // Global collection, accessible to all users

// Track if Firebase is available
let firebaseAvailable = false;

// Initialize storage (no user-specific setup needed for shared data)
export const initPartyMemberStorage = async () => {
  try {
    if (!db) {
      firebaseAvailable = false;
      return false;
    }
    
    firebaseAvailable = true;
    return true;
  } catch (error) {
    console.warn('Firebase unavailable for party members, using localStorage fallback:', error);
    firebaseAvailable = false;
    return false;
  }
};

export const partyMemberStorage = {
  // Get all members for a specific party from Firestore or localStorage
  getPartyMembers: async (partyName) => {
    if (!partyName) return [];
    
    if (firebaseAvailable) {
      try {
        const q = query(
          collection(db, COLLECTION_NAME), 
          where('partyName', '==', partyName)
        );
        const querySnapshot = await getDocs(q);
        const members = [];
        querySnapshot.forEach((doc) => {
          members.push(doc.data());
        });
        return members;
      } catch (error) {
        console.error('Error reading party members from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const allMembers = data ? JSON.parse(data) : [];
      return allMembers.filter(m => m.partyName === partyName);
    } catch (error) {
      console.error('Error reading party members from localStorage:', error);
      return [];
    }
  },

  // Save or update a party member entry
  // This creates a lightweight reference to the character with just the data needed for display
  savePartyMember: async (characterData) => {
    // Validate required fields
    if (!characterData || typeof characterData !== 'object') {
      console.error('Invalid character data provided to savePartyMember');
      return null;
    }
    
    if (!characterData.id || typeof characterData.id !== 'string') {
      console.error('Character ID is required and must be a string');
      return null;
    }
    
    if (!characterData.partyName || typeof characterData.partyName !== 'string') {
      console.error('Party name is required and must be a string');
      return null;
    }

    const memberData = {
      id: characterData.id,
      name: characterData.name || 'Unnamed Character',
      partyName: characterData.partyName,
      kindredClass: characterData.kindredClass || '',
      level: characterData.level || 1,
      hp: characterData.hp || 0,
      maxHp: characterData.maxHp || 0,
      ac: characterData.ac || 10,
      avatar: characterData.avatar || null,
      userId: characterData.userId || null, // Track which user owns this character
      updatedAt: new Date().toISOString()
    };
    
    if (firebaseAvailable) {
      try {
        // Use character ID as document ID to ensure one entry per character
        await setDoc(
          doc(db, COLLECTION_NAME, characterData.id),
          memberData
        );
        return memberData;
      } catch (error) {
        console.error('Error saving party member to Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const allMembers = data ? JSON.parse(data) : [];
      
      // Find and update or add new
      const existingIndex = allMembers.findIndex(m => m.id === characterData.id);
      if (existingIndex !== -1) {
        allMembers[existingIndex] = memberData;
      } else {
        allMembers.push(memberData);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allMembers));
      return memberData;
    } catch (error) {
      console.error('Error saving party member to localStorage:', error);
      return null;
    }
  },

  // Remove a character from all parties (when character is deleted or party is cleared)
  removePartyMember: async (characterId) => {
    if (!characterId) return;
    
    if (firebaseAvailable) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, characterId));
      } catch (error) {
        console.error('Error removing party member from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const allMembers = data ? JSON.parse(data) : [];
      const filtered = allMembers.filter(m => m.id !== characterId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing party member from localStorage:', error);
    }
  },

  // Subscribe to real-time updates for a specific party
  subscribeToPartyMembers: (partyName, callback) => {
    if (!firebaseAvailable || !partyName) {
      return () => {}; // Return empty unsubscribe function
    }
    
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('partyName', '==', partyName)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const members = [];
          snapshot.forEach((doc) => {
            members.push(doc.data());
          });
          callback(members);
        },
        (error) => {
          console.error('Error in party members real-time listener:', error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up party members listener:', error);
      return () => {};
    }
  }
};
