const STORAGE_KEY = 'dolmenwood_characters';

export const storage = {
  getCharacters: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveCharacters: (characters) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  addCharacter: (character) => {
    const characters = storage.getCharacters();
    const newCharacter = {
      ...character,
      id: Date.now().toString()
    };
    characters.push(newCharacter);
    storage.saveCharacters(characters);
    return newCharacter;
  },

  updateCharacter: (id, updates) => {
    const characters = storage.getCharacters();
    const index = characters.findIndex(char => char.id === id);
    if (index !== -1) {
      characters[index] = { ...characters[index], ...updates };
      storage.saveCharacters(characters);
      return characters[index];
    }
    return null;
  },

  deleteCharacter: (id) => {
    const characters = storage.getCharacters();
    const filtered = characters.filter(char => char.id !== id);
    storage.saveCharacters(filtered);
    return filtered;
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
