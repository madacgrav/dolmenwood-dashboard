import React from 'react';
import './CharacterList.css';

function CharacterList({ characters, onSelectCharacter, onCreateNew, onDelete }) {
  return (
    <div className="character-list-container">
      <div className="header">
        <h1>Dolmenwood</h1>
        <p className="subtitle">Character Dashboard</p>
      </div>
      
      <button className="btn-create" onClick={onCreateNew}>
        + Create New Character
      </button>

      <div className="character-grid">
        {characters.map((character) => (
          <div key={character.id} className="character-card">
            <div className="card-content" onClick={() => onSelectCharacter(character)}>
              <h2>{character.name}</h2>
              <p className="kindred-class">{character.kindredClass}</p>
              <div className="character-stats">
                <div className="stat">
                  <span className="label">Level</span>
                  <span className="value">{character.level}</span>
                </div>
                <div className="stat">
                  <span className="label">HP</span>
                  <span className="value">{character.hp}/{character.maxHp}</span>
                </div>
                <div className="stat">
                  <span className="label">AC</span>
                  <span className="value">{character.ac}</span>
                </div>
              </div>
              {character.background && (
                <p className="background">{character.background}</p>
              )}
            </div>
            <button 
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(character.id);
              }}
              aria-label="Delete character"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {characters.length === 0 && (
        <div className="empty-state">
          <p>No characters yet. Create your first Dolmenwood character!</p>
        </div>
      )}
    </div>
  );
}

export default CharacterList;
