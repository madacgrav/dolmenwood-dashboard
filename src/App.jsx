import React, { useState, useEffect } from 'react';
import CharacterList from './components/CharacterList';
import CharacterSheet from './components/CharacterSheet';
import { storage } from './utils/storage';
import { exampleCharacters } from './data/exampleCharacters';
import './App.css';

function App() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Load characters from localStorage on mount
    const stored = storage.getCharacters();
    if (stored.length === 0) {
      // If no characters, load examples
      storage.saveCharacters(exampleCharacters);
      setCharacters(exampleCharacters);
    } else {
      setCharacters(stored);
    }
  }, []);

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedCharacter(null);
  };

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    setIsCreating(false);
  };

  const handleBackToList = () => {
    setSelectedCharacter(null);
    setIsCreating(false);
    // Refresh character list
    setCharacters(storage.getCharacters());
  };

  const handleSave = (characterData) => {
    if (selectedCharacter) {
      // Update existing character
      storage.updateCharacter(selectedCharacter.id, characterData);
    } else {
      // Create new character
      storage.addCharacter(characterData);
    }
    handleBackToList();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      storage.deleteCharacter(id);
      setCharacters(storage.getCharacters());
      if (selectedCharacter?.id === id) {
        handleBackToList();
      }
    }
  };

  return (
    <div className="app">
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
