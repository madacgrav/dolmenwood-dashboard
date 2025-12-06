import React, { useState, useEffect } from 'react';
import './CharacterSheet.css';

const emptyCharacter = {
  name: '',
  kindredClass: '',
  background: '',
  alignment: '',
  affiliation: '',
  moonSign: '',
  abilityScores: {
    strength: { score: 10, mod: 0 },
    intelligence: { score: 10, mod: 0 },
    wisdom: { score: 10, mod: 0 },
    dexterity: { score: 10, mod: 0 },
    constitution: { score: 10, mod: 0 },
    charisma: { score: 10, mod: 0 }
  },
  saveTargets: {
    doom: null,
    ray: null,
    hold: null,
    blast: null,
    spell: null,
    resistance: null
  },
  hp: 0,
  maxHp: 0,
  ac: '',
  speed: null,
  exploring: null,
  overland: null,
  attack: null,
  kindredTraits: '',
  affiliation2: '',
  skillTargets: {
    listen: null,
    search: null,
    survival: null
  },
  languages: [],
  xp: 0,
  level: 1,
  nextLevel: null,
  modifier: null,
  inventory: {
    tinyItems: [],
    equippedItems: [],
    stowedItems: [],
    totalWeight: null
  },
  coins: {
    copper: null,
    silver: null,
    gold: null,
    pellucidum: null
  },
  otherNotes: ''
};

function CharacterSheet({ character, onSave, onCancel }) {
  const [formData, setFormData] = useState(character || emptyCharacter);

  useEffect(() => {
    setFormData(character || emptyCharacter);
  }, [character]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAbilityChange = (ability, field, value) => {
    setFormData(prev => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: {
          ...prev.abilityScores[ability],
          [field]: value === '' ? 0 : (parseInt(value, 10) || 0)
        }
      }
    }));
  };

  const handleSaveTargetChange = (target, value) => {
    setFormData(prev => ({
      ...prev,
      saveTargets: {
        ...prev.saveTargets,
        [target]: value === '' ? null : parseInt(value, 10)
      }
    }));
  };

  const handleSkillChange = (skill, value) => {
    setFormData(prev => ({
      ...prev,
      skillTargets: {
        ...prev.skillTargets,
        [skill]: value === '' ? null : value
      }
    }));
  };

  const handleLanguagesChange = (value) => {
    const langs = value.split(',').map(l => l.trim()).filter(l => l);
    setFormData(prev => ({
      ...prev,
      languages: langs
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="character-sheet-container">
      <div className="sheet-header">
        <button className="btn-back" onClick={onCancel}>← Back to List</button>
        <h1>Dolmenwood</h1>
      </div>

      <form onSubmit={handleSubmit} className="character-sheet">
        {/* Basic Information */}
        <div className="section basic-info">
          <div className="form-row">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Kindred & Class:</label>
              <input
                type="text"
                value={formData.kindredClass}
                onChange={(e) => handleChange('kindredClass', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Background:</label>
              <input
                type="text"
                value={formData.background}
                onChange={(e) => handleChange('background', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Alignment:</label>
              <input
                type="text"
                value={formData.alignment}
                onChange={(e) => handleChange('alignment', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Affiliation:</label>
              <input
                type="text"
                value={formData.affiliation}
                onChange={(e) => handleChange('affiliation', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Moon Sign:</label>
              <input
                type="text"
                value={formData.moonSign}
                onChange={(e) => handleChange('moonSign', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="section ability-scores">
          <h2>Ability Scores</h2>
          <div className="abilities-grid">
            {['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'].map(ability => (
              <div key={ability} className="ability-box">
                <div className="ability-name">{ability.charAt(0).toUpperCase() + ability.slice(1)}</div>
                <div className="ability-inputs">
                  <div>
                    <label>Score</label>
                    <input
                      type="number"
                      value={formData.abilityScores[ability].score}
                      onChange={(e) => handleAbilityChange(ability, 'score', e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Mod</label>
                    <input
                      type="number"
                      value={formData.abilityScores[ability].mod}
                      onChange={(e) => handleAbilityChange(ability, 'mod', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Targets & Combat Stats */}
        <div className="section combat-stats">
          <h2>Save Targets</h2>
          <div className="save-targets">
            {['doom', 'ray', 'hold', 'blast', 'spell', 'resistance'].map(target => (
              <div key={target} className="save-box">
                <label>{target.toUpperCase()}</label>
                <input
                  type="number"
                  value={formData.saveTargets[target] || ''}
                  onChange={(e) => handleSaveTargetChange(target, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="combat-grid">
            <div className="form-group">
              <label>HP</label>
              <input
                type="number"
                value={formData.hp}
                onChange={(e) => handleChange('hp', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Max HP</label>
              <input
                type="number"
                value={formData.maxHp}
                onChange={(e) => handleChange('maxHp', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>AC</label>
              <input
                type="text"
                value={formData.ac}
                onChange={(e) => handleChange('ac', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Speed</label>
              <input
                type="text"
                value={formData.speed || ''}
                onChange={(e) => handleChange('speed', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Attack</label>
              <input
                type="text"
                value={formData.attack || ''}
                onChange={(e) => handleChange('attack', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Kindred & Class Traits */}
        <div className="section">
          <h2>Kindred & Class Traits</h2>
          <textarea
            value={formData.kindredTraits}
            onChange={(e) => handleChange('kindredTraits', e.target.value)}
            rows="6"
            placeholder="Enter traits and abilities..."
          />
        </div>

        {/* Skills & Languages */}
        <div className="section">
          <h2>Skill Targets</h2>
          <div className="skills-grid">
            <div className="form-group">
              <label>Listen</label>
              <input
                type="text"
                value={formData.skillTargets.listen || ''}
                onChange={(e) => handleSkillChange('listen', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Search</label>
              <input
                type="text"
                value={formData.skillTargets.search || ''}
                onChange={(e) => handleSkillChange('search', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Survival</label>
              <input
                type="text"
                value={formData.skillTargets.survival || ''}
                onChange={(e) => handleSkillChange('survival', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Languages (comma-separated)</label>
            <input
              type="text"
              value={formData.languages.join(', ')}
              onChange={(e) => handleLanguagesChange(e.target.value)}
              placeholder="e.g., Woldish, Gaelic, Ogrice"
            />
          </div>
        </div>

        {/* Experience */}
        <div className="section">
          <h2>Experience</h2>
          <div className="xp-grid">
            <div className="form-group">
              <label>XP</label>
              <input
                type="number"
                value={formData.xp}
                onChange={(e) => handleChange('xp', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Level</label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => handleChange('level', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="form-group">
              <label>Next Level</label>
              <input
                type="text"
                value={formData.nextLevel || ''}
                onChange={(e) => handleChange('nextLevel', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Modifier</label>
              <input
                type="text"
                value={formData.modifier || ''}
                onChange={(e) => handleChange('modifier', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Other Notes */}
        <div className="section">
          <h2>Other Notes</h2>
          <textarea
            value={formData.otherNotes}
            onChange={(e) => handleChange('otherNotes', e.target.value)}
            rows="4"
            placeholder="Additional character notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-save">
            Save Character
          </button>
        </div>
      </form>
    </div>
  );
}

export default CharacterSheet;
