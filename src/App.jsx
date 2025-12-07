import React, { useState, useEffect } from 'react';
import CharacterList from './components/CharacterList';
import CharacterSheet from './components/CharacterSheet';
import AuthForm from './components/AuthForm';
import { storage, initStorage } from './utils/storage';
import { authService } from './utils/firebase';
import { exampleCharacters } from './data/exampleCharacters';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('Connecting...');
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe = null;
    let unsubscribeAuth = null;

    const initializeApp = async (currentUser) => {
      try {
        if (!currentUser) {
          // No user logged in
          setLoading(false);
          setSyncStatus('Not logged in');
          setCharacters([]);
          return;
        }

        // Initialize Firebase storage with authenticated user
        const firebaseReady = await initStorage();
        
        if (firebaseReady) {
          setSyncStatus('Cloud sync enabled');
          
          // Initial load - check if we need example data
          const stored = await storage.getCharacters();
          if (stored.length === 0) {
            // If no characters, load examples
            await storage.saveCharacters(exampleCharacters);
          }
          
          // Set up real-time listener for cloud sync (after initial load)
          unsubscribe = storage.subscribeToCharacters((updatedCharacters) => {
            setCharacters(updatedCharacters);
          });
        } else {
          setSyncStatus('Offline mode');
          
          // Fallback to localStorage
          const stored = await storage.getCharacters();
          if (stored.length === 0) {
            await storage.saveCharacters(exampleCharacters);
            setCharacters(exampleCharacters);
          } else {
            setCharacters(stored);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setSyncStatus('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    // Listen to auth state changes
    unsubscribeAuth = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(true);
      setError(''); // Clear errors on auth state change
      initializeApp(currentUser);
    });

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  const handleAuth = async (email, password, isSignUp) => {
    setError('');
    try {
      if (isSignUp) {
        await authService.signUp(email, password);
      } else {
        await authService.signIn(email, password);
      }
      // Auth state change listener will handle the rest
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      
      setError(errorMessage);
      throw error; // Re-throw so AuthForm can handle loading state
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await authService.signOut();
        setSelectedCharacter(null);
        setIsCreating(false);
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      }
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedCharacter(null);
  };

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    setIsCreating(false);
  };

  const handleBackToList = async () => {
    setSelectedCharacter(null);
    setIsCreating(false);
    // Refresh character list (will be updated by real-time listener if available)
    if (syncStatus === 'Offline mode') {
      const updated = await storage.getCharacters();
      setCharacters(updated);
    }
  };

  const handleSave = async (characterData) => {
    try {
      if (selectedCharacter) {
        // Update existing character
        await storage.updateCharacter(selectedCharacter.id, characterData);
      } else {
        // Create new character
        await storage.addCharacter(characterData);
      }
      handleBackToList();
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Error saving character. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        await storage.deleteCharacter(id);
        if (syncStatus === 'Offline mode') {
          const updated = await storage.getCharacters();
          setCharacters(updated);
        }
        if (selectedCharacter?.id === id) {
          handleBackToList();
        }
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('Error deleting character. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <h1>Dolmenwood</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="app">
        <AuthForm 
          onAuthSuccess={handleAuth} 
          onError={setError}
        />
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="sync-status">
        {syncStatus} | <button onClick={handleLogout} className="logout-link">Sign Out</button>
      </div>
      {!selectedCharacter && !isCreating ? (
        <CharacterList
          characters={characters}
          onSelectCharacter={handleSelectCharacter}
          onCreateNew={handleCreateNew}
          onDelete={handleDelete}
        />
      ) : (
        <CharacterSheet
          character={selectedCharacter}
          onSave={handleSave}
          onCancel={handleBackToList}
        />
      )}
    </div>
  );
}

export default App;
