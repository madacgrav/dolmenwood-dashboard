import React, { useState, useEffect } from 'react';
import CharacterList from './components/CharacterList';
import CharacterSheet from './components/CharacterSheet';
import Maps from './components/Maps';
import AuthForm from './components/AuthForm';
import PartyView from './components/PartyView';
import PartyList from './components/PartyList';
import PartyForm from './components/PartyForm';
import { storage, initStorage } from './utils/storage';
import { mapsStorage, initMapsStorage } from './utils/mapsStorage';
import { partyStorage, initPartyStorage } from './utils/partyStorage';
import { authService } from './utils/firebase';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingParty, setIsCreatingParty] = useState(false);
  const [currentView, setCurrentView] = useState('characters'); // 'characters', 'maps', 'parties', or 'party-view'
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('Connecting...');
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribeCharacters = null;
    let unsubscribeParties = null;
    let unsubscribeAuth = null;

    const initializeApp = async (currentUser) => {
      try {
        // Initialize party storage (shared, available to all users)
        const partyFirebaseReady = await initPartyStorage();
        
        // Initialize maps storage (shared, available to all users)
        await initMapsStorage();
        
        if (!currentUser) {
          // No user logged in - still load shared data
          setLoading(false);
          setSyncStatus('Not logged in');
          setCharacters([]);
          
          // Load parties even without user login (they're shared)
          if (partyFirebaseReady) {
            unsubscribeParties = partyStorage.subscribeToParties((updatedParties) => {
              setParties(updatedParties);
            });
          } else {
            const storedParties = await partyStorage.getParties();
            setParties(storedParties);
          }
          return;
        }

        // Initialize Firebase storage with authenticated user
        const firebaseReady = await initStorage();
        
        if (firebaseReady) {
          setSyncStatus('Cloud sync enabled');
          
          // Set up real-time listener for cloud sync
          unsubscribeCharacters = storage.subscribeToCharacters((updatedCharacters) => {
            setCharacters(updatedCharacters);
          });
          
          // Set up real-time listener for parties
          unsubscribeParties = partyStorage.subscribeToParties((updatedParties) => {
            setParties(updatedParties);
          });
        } else {
          setSyncStatus('Offline mode');
          
          // Fallback to localStorage
          const stored = await storage.getCharacters();
          setCharacters(stored);
          
          const storedParties = await partyStorage.getParties();
          setParties(storedParties);
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
      if (unsubscribeCharacters) {
        unsubscribeCharacters();
      }
      if (unsubscribeParties) {
        unsubscribeParties();
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

  const handleViewParty = (partyName) => {
    setSelectedParty(partyName);
    setCurrentView('party-view');
  };

  const handleBackFromParty = () => {
    setSelectedParty(null);
    setCurrentView('parties');
  };

  // Party management handlers
  const handleCreateNewParty = () => {
    setIsCreatingParty(true);
    setSelectedParty(null);
  };

  const handleSelectParty = (party) => {
    setSelectedParty(party);
    setIsCreatingParty(false);
  };

  const handleBackToPartyList = async () => {
    setSelectedParty(null);
    setIsCreatingParty(false);
    // Refresh party list (will be updated by real-time listener if available)
    if (syncStatus === 'Offline mode') {
      const updated = await partyStorage.getParties();
      setParties(updated);
    }
  };

  const handleSaveParty = async (partyData) => {
    try {
      if (selectedParty && selectedParty.id) {
        // Update existing party
        await partyStorage.updateParty(selectedParty.id, partyData);
      } else {
        // Create new party
        await partyStorage.addParty(partyData);
      }
      handleBackToPartyList();
    } catch (error) {
      console.error('Error saving party:', error);
      alert('Error saving party. Please try again.');
    }
  };

  const handleDeleteParty = async (id) => {
    if (window.confirm('Are you sure you want to delete this party? This will not delete the characters in the party.')) {
      try {
        await partyStorage.deleteParty(id);
        if (syncStatus === 'Offline mode') {
          const updated = await partyStorage.getParties();
          setParties(updated);
        }
        if (selectedParty?.id === id) {
          handleBackToPartyList();
        }
      } catch (error) {
        console.error('Error deleting party:', error);
        alert('Error deleting party. Please try again.');
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
        <span aria-label="Currently logged in user">{user?.email}</span> | {syncStatus} | <button onClick={handleLogout} className="logout-link">Sign Out</button>
      </div>
      
      {/* Navigation */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${currentView === 'characters' ? 'active' : ''}`}
          onClick={() => {
            setCurrentView('characters');
            setSelectedCharacter(null);
            setIsCreating(false);
          }}
        >
          My Characters
        </button>
        <button 
          className={`nav-tab ${currentView === 'parties' || currentView === 'party-view' ? 'active' : ''}`}
          onClick={() => {
            setCurrentView('parties');
            setSelectedParty(null);
            setIsCreatingParty(false);
          }}
        >
          Parties
        </button>
        <button 
          className={`nav-tab ${currentView === 'maps' ? 'active' : ''}`}
          onClick={() => {
            setCurrentView('maps');
            setSelectedCharacter(null);
            setIsCreating(false);
          }}
        >
          Shared Maps
        </button>
      </div>

      {/* Content based on current view */}
      {currentView === 'characters' ? (
        !selectedCharacter && !isCreating ? (
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
            onViewParty={handleViewParty}
          />
        )
      ) : currentView === 'parties' ? (
        !selectedParty && !isCreatingParty ? (
          <PartyList
            parties={parties}
            onSelectParty={handleSelectParty}
            onCreateNew={handleCreateNewParty}
            onDelete={handleDeleteParty}
            onViewParty={handleViewParty}
          />
        ) : (
          <PartyForm
            party={selectedParty}
            onSave={handleSaveParty}
            onCancel={handleBackToPartyList}
          />
        )
      ) : currentView === 'party-view' ? (
        <PartyView
          partyName={selectedParty}
          allCharacters={characters}
          currentUser={user}
          onBack={handleBackFromParty}
          onSelectCharacter={handleSelectCharacter}
        />
      ) : (
        <Maps user={user} mapsStorage={mapsStorage} />
      )}
    </div>
  );
}

export default App;
