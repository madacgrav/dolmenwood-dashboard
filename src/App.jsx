import React, { useState, useEffect } from 'react';
import CharacterList from './components/CharacterList';
import CharacterSheet from './components/CharacterSheet';
import { storage, initStorage } from './utils/storage';
import { exampleCharacters } from './data/exampleCharacters';
import './App.css';

function App() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('Connecting...');

  useEffect(() => {
    let unsubscribe = null;

    const initializeApp = async () => {
      try {
        // Initialize Firebase storage
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

    initializeApp();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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
          <p>Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="sync-status">{syncStatus}</div>
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
