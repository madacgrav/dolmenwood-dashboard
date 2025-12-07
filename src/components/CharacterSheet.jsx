import React, { useState, useEffect } from 'react';
import './CharacterSheet.css';

// Avatar configuration constants
const AVATAR_MAX_SIZE = 150; // Maximum width/height in pixels
const AVATAR_JPEG_QUALITY = 0.7; // JPEG compression quality (0-1)
const AVATAR_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const emptyCharacter = {
  name: '',
  avatar: '', // Base64 encoded image
  age: '',
  height: '',
  weight: '',
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

// Helper component for displaying read-only values
const ReadOnlyField = ({ label, value }) => (
  <div className="form-group readonly">
    <label>{label}</label>
    <div className="readonly-value">{value || '—'}</div>
  </div>
);

function CharacterSheet({ character, onSave, onCancel }) {
  const [formData, setFormData] = useState(character || emptyCharacter);
  const [isEditing, setIsEditing] = useState(!character); // Edit mode if creating new character

  useEffect(() => {
    setFormData(character || emptyCharacter);
    setIsEditing(!character); // Edit mode if creating new character
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

  const handleAddSkill = () => {
    const skillName = prompt('Enter new skill name:');
    if (skillName && skillName.trim()) {
      const key = skillName.toLowerCase().replace(/\s+/g, '_');
      setFormData(prev => ({
        ...prev,
        skillTargets: {
          ...prev.skillTargets,
          [key]: null
        }
      }));
    }
  };

  const handleRemoveSkill = (skill) => {
    // Don't allow removing default skills
    if (['listen', 'search', 'survival'].includes(skill)) {
      return;
    }
    setFormData(prev => {
      const newSkillTargets = { ...prev.skillTargets };
      delete newSkillTargets[skill];
      return {
        ...prev,
        skillTargets: newSkillTargets
      };
    });
  };

  const handleInventoryChange = (category, index, field, value) => {
    setFormData(prev => {
      const newInventory = { ...prev.inventory };
      if (category === 'tinyItems') {
        const newTinyItems = [...newInventory.tinyItems];
        newTinyItems[index] = value;
        newInventory.tinyItems = newTinyItems;
      } else {
        const newItems = [...newInventory[category]];
        newItems[index] = {
          ...newItems[index],
          [field]: value
        };
        newInventory[category] = newItems;
      }
      return {
        ...prev,
        inventory: newInventory
      };
    });
  };

  const handleAddInventoryItem = (category) => {
    setFormData(prev => {
      const newInventory = { ...prev.inventory };
      if (category === 'tinyItems') {
        newInventory.tinyItems = [...newInventory.tinyItems, ''];
      } else {
        newInventory[category] = [...newInventory[category], { item: '', weight: null, description: '' }];
      }
      return {
        ...prev,
        inventory: newInventory
      };
    });
  };

  const handleRemoveInventoryItem = (category, index) => {
    setFormData(prev => {
      const newInventory = { ...prev.inventory };
      if (category === 'tinyItems') {
        newInventory.tinyItems = newInventory.tinyItems.filter((_, i) => i !== index);
      } else {
        newInventory[category] = newInventory[category].filter((_, i) => i !== index);
      }
      return {
        ...prev,
        inventory: newInventory
      };
    });
  };

  const handleCoinsChange = (coin, value) => {
    setFormData(prev => ({
      ...prev,
      coins: {
        ...prev.coins,
        [coin]: value === '' ? null : (parseInt(value, 10) || 0)
      }
    }));
  };

  const calculateTotalWeight = () => {
    const equippedWeight = formData.inventory.equippedItems.reduce((sum, item) => {
      const weight = parseFloat(item.weight);
      return sum + (isNaN(weight) ? 0 : weight);
    }, 0);
    const stowedWeight = formData.inventory.stowedItems.reduce((sum, item) => {
      const weight = parseFloat(item.weight);
      return sum + (isNaN(weight) ? 0 : weight);
    }, 0);
    return equippedWeight + stowedWeight;
  };

  const calculateTotalMoney = () => {
    const copper = formData.coins.copper || 0;
    const silver = formData.coins.silver || 0;
    const gold = formData.coins.gold || 0;
    const pellucidum = formData.coins.pellucidum || 0;
    
    // Convert everything to copper
    const totalInCopper = copper + (silver * 10) + (gold * 100) + (pellucidum * 1000);
    
    // Convert back to highest denominations
    const p = Math.floor(totalInCopper / 1000);
    const g = Math.floor((totalInCopper % 1000) / 100);
    const s = Math.floor((totalInCopper % 100) / 10);
    const c = totalInCopper % 10;
    
    const parts = [];
    if (p > 0) parts.push(`${p}p`);
    if (g > 0) parts.push(`${g}g`);
    if (s > 0) parts.push(`${s}s`);
    if (c > 0) parts.push(`${c}c`);
    
    return parts.length > 0 ? parts.join(' ') : '0c';
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
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(character || emptyCharacter);
    setIsEditing(false);
    if (!character) {
      onCancel(); // If creating new character and cancel, go back to list
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size
    if (file.size > AVATAR_MAX_FILE_SIZE) {
      alert('Image file must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image
        const canvas = document.createElement('canvas');
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > AVATAR_MAX_SIZE) {
            height = (height * AVATAR_MAX_SIZE) / width;
            width = AVATAR_MAX_SIZE;
          }
        } else {
          if (height > AVATAR_MAX_SIZE) {
            width = (width * AVATAR_MAX_SIZE) / height;
            height = AVATAR_MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality to keep size small
        const resizedBase64 = canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY);
        
        setFormData(prev => ({
          ...prev,
          avatar: resizedBase64
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }));
  };

  return (
    <div className="character-sheet-container">
      <div className="sheet-header">
        <button className="btn-back" onClick={onCancel}>← Back to List</button>
        <h1>Dolmenwood</h1>
        {!isEditing && character && (
          <button className="btn-edit" onClick={handleEdit}>✎ Edit</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="character-sheet">
        {/* Basic Information */}
        <div className="section basic-info">
          {/* Avatar Section */}
          <div className="avatar-section">
            {formData.avatar ? (
              <div className="avatar-container">
                <img src={formData.avatar} alt="Character avatar" className="character-avatar" />
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn-remove-avatar" 
                    onClick={handleRemoveAvatar}
                    title="Remove avatar"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              isEditing && (
                <div className="avatar-upload">
                  <label htmlFor="avatar-upload" className="avatar-upload-label">
                    <div className="avatar-placeholder">
                      <span>+</span>
                      <span className="upload-text">Add Avatar</span>
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              )
            )}
          </div>

          <div className="form-row">
            {isEditing ? (
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
            ) : (
              <ReadOnlyField label="Name:" value={formData.name} />
            )}
          </div>

          <div className="form-row">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Age:</label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Height:</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Weight:</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <ReadOnlyField label="Age:" value={formData.age} />
                <ReadOnlyField label="Height:" value={formData.height} />
                <ReadOnlyField label="Weight:" value={formData.weight} />
              </>
            )}
          </div>
          
          <div className="form-row">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Kindred & Class:</label>
                  <input
                    type="text"
                    value={formData.kindredClass}
                    onChange={(e) => handleChange('kindredClass', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Background:</label>
                  <input
                    type="text"
                    value={formData.background}
                    onChange={(e) => handleChange('background', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <ReadOnlyField label="Kindred & Class:" value={formData.kindredClass} />
                <ReadOnlyField label="Background:" value={formData.background} />
              </>
            )}
          </div>

          <div className="form-row">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Alignment:</label>
                  <input
                    type="text"
                    value={formData.alignment}
                    onChange={(e) => handleChange('alignment', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Affiliation:</label>
                  <input
                    type="text"
                    value={formData.affiliation}
                    onChange={(e) => handleChange('affiliation', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <ReadOnlyField label="Alignment:" value={formData.alignment} />
                <ReadOnlyField label="Affiliation:" value={formData.affiliation} />
              </>
            )}
          </div>

          <div className="form-row">
            {isEditing ? (
              <div className="form-group">
                <label>Moon Sign:</label>
                <input
                  type="text"
                  value={formData.moonSign}
                  onChange={(e) => handleChange('moonSign', e.target.value)}
                />
              </div>
            ) : (
              <ReadOnlyField label="Moon Sign:" value={formData.moonSign} />
            )}
          </div>
        </div>

        {/* Ability Scores */}
        <div className="section ability-scores">
          <h2>Ability Scores</h2>
          <div className="abilities-grid">
            {['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'].map(ability => (
              <div key={ability} className="ability-box">
                <div className="ability-name">{ability.charAt(0).toUpperCase() + ability.slice(1)}</div>
                {isEditing ? (
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
                ) : (
                  <div className="ability-readonly">
                    <div className="ability-score">{formData.abilityScores[ability].score}</div>
                    <div className="ability-mod">{formData.abilityScores[ability].mod >= 0 ? '+' : ''}{formData.abilityScores[ability].mod}</div>
                  </div>
                )}
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
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.saveTargets[target] || ''}
                    onChange={(e) => handleSaveTargetChange(target, e.target.value)}
                  />
                ) : (
                  <div className="readonly-value">{formData.saveTargets[target] || '—'}</div>
                )}
              </div>
            ))}
          </div>

          <div className="combat-grid">
            {isEditing ? (
              <>
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
              </>
            ) : (
              <>
                <ReadOnlyField label="HP" value={`${formData.hp}/${formData.maxHp}`} />
                <ReadOnlyField label="AC" value={formData.ac} />
                <ReadOnlyField label="Speed" value={formData.speed} />
                <ReadOnlyField label="Attack" value={formData.attack} />
              </>
            )}
          </div>
        </div>

        {/* Kindred & Class Traits */}
        <div className="section">
          <h2>Kindred & Class Traits</h2>
          {isEditing ? (
            <textarea
              value={formData.kindredTraits}
              onChange={(e) => handleChange('kindredTraits', e.target.value)}
              rows="6"
              placeholder="Enter traits and abilities..."
            />
          ) : (
            <div className="readonly-textarea">{formData.kindredTraits || '—'}</div>
          )}
        </div>

        {/* Skills & Languages */}
        <div className="section">
          <h2>Skill Targets</h2>
          <div className="skills-grid">
            {Object.entries(formData.skillTargets).map(([skill, value]) => (
              <div key={skill} className="form-group skill-item">
                {isEditing ? (
                  <>
                    <label>{skill.charAt(0).toUpperCase() + skill.slice(1).replace(/_/g, ' ')}</label>
                    <div className="skill-input-wrapper">
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleSkillChange(skill, e.target.value)}
                      />
                      {!['listen', 'search', 'survival'].includes(skill) && (
                        <button
                          type="button"
                          className="btn-remove-skill"
                          onClick={() => handleRemoveSkill(skill)}
                          title="Remove skill"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <ReadOnlyField 
                    label={skill.charAt(0).toUpperCase() + skill.slice(1).replace(/_/g, ' ')} 
                    value={value} 
                  />
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <button type="button" className="btn-add-skill" onClick={handleAddSkill}>
              + Add Skill
            </button>
          )}

          {isEditing ? (
            <div className="form-group">
              <label>Languages (comma-separated)</label>
              <input
                type="text"
                value={formData.languages.join(', ')}
                onChange={(e) => handleLanguagesChange(e.target.value)}
                placeholder="e.g., Woldish, Gaelic, Ogrice"
              />
            </div>
          ) : (
            <ReadOnlyField label="Languages" value={formData.languages.join(', ')} />
          )}
        </div>

        {/* Experience */}
        <div className="section">
          <h2>Experience</h2>
          <div className="xp-grid">
            {isEditing ? (
              <>
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
              </>
            ) : (
              <>
                <ReadOnlyField label="XP" value={formData.xp} />
                <ReadOnlyField label="Level" value={formData.level} />
                <ReadOnlyField label="Next Level" value={formData.nextLevel} />
                <ReadOnlyField label="Modifier" value={formData.modifier} />
              </>
            )}
          </div>
        </div>

        {/* Inventory */}
        <div className="section">
          <h2>Inventory</h2>
          
          {/* Tiny Items */}
          <div className="inventory-subsection">
            <h3>Tiny Items</h3>
            {isEditing ? (
              <>
                {formData.inventory.tinyItems.map((item, index) => (
                  <div key={index} className="inventory-item-row">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleInventoryChange('tinyItems', index, null, e.target.value)}
                      placeholder="Item name"
                      className="inventory-input"
                    />
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => handleRemoveInventoryItem('tinyItems', index)}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={() => handleAddInventoryItem('tinyItems')}>
                  + Add Tiny Item
                </button>
              </>
            ) : (
              <div className="readonly-list">
                {formData.inventory.tinyItems.length > 0 ? (
                  formData.inventory.tinyItems.map((item, index) => (
                    <div key={index} className="readonly-list-item">• {item}</div>
                  ))
                ) : (
                  <div className="readonly-value">—</div>
                )}
              </div>
            )}
          </div>

          {/* Equipped Items */}
          <div className="inventory-subsection">
            <h3>Equipped Items</h3>
            {isEditing ? (
              <>
                {formData.inventory.equippedItems.map((item, index) => (
                  <div key={index} className="inventory-item-row">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => handleInventoryChange('equippedItems', index, 'item', e.target.value)}
                      placeholder="Item name"
                      className="inventory-input"
                    />
                    <input
                      type="text"
                      value={item.weight || ''}
                      onChange={(e) => handleInventoryChange('equippedItems', index, 'weight', e.target.value)}
                      placeholder="Weight"
                      className="inventory-weight-input"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleInventoryChange('equippedItems', index, 'description', e.target.value)}
                      placeholder="Description"
                      className="inventory-input"
                    />
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => handleRemoveInventoryItem('equippedItems', index)}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={() => handleAddInventoryItem('equippedItems')}>
                  + Add Equipped Item
                </button>
              </>
            ) : (
              <div className="readonly-inventory">
                {formData.inventory.equippedItems.length > 0 ? (
                  formData.inventory.equippedItems.map((item, index) => (
                    <div key={index} className="readonly-inventory-item">
                      <span className="item-name">{item.item}</span>
                      {item.weight && <span className="item-weight">(Weight: {item.weight})</span>}
                      {item.description && <span className="item-description"> - {item.description}</span>}
                    </div>
                  ))
                ) : (
                  <div className="readonly-value">—</div>
                )}
              </div>
            )}
          </div>

          {/* Stowed Items */}
          <div className="inventory-subsection">
            <h3>Stowed Items</h3>
            {isEditing ? (
              <>
                {formData.inventory.stowedItems.map((item, index) => (
                  <div key={index} className="inventory-item-row">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => handleInventoryChange('stowedItems', index, 'item', e.target.value)}
                      placeholder="Item name"
                      className="inventory-input"
                    />
                    <input
                      type="text"
                      value={item.weight || ''}
                      onChange={(e) => handleInventoryChange('stowedItems', index, 'weight', e.target.value)}
                      placeholder="Weight"
                      className="inventory-weight-input"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleInventoryChange('stowedItems', index, 'description', e.target.value)}
                      placeholder="Description"
                      className="inventory-input"
                    />
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => handleRemoveInventoryItem('stowedItems', index)}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={() => handleAddInventoryItem('stowedItems')}>
                  + Add Stowed Item
                </button>
              </>
            ) : (
              <div className="readonly-inventory">
                {formData.inventory.stowedItems.length > 0 ? (
                  formData.inventory.stowedItems.map((item, index) => (
                    <div key={index} className="readonly-inventory-item">
                      <span className="item-name">{item.item}</span>
                      {item.weight && <span className="item-weight">(Weight: {item.weight})</span>}
                      {item.description && <span className="item-description"> - {item.description}</span>}
                    </div>
                  ))
                ) : (
                  <div className="readonly-value">—</div>
                )}
              </div>
            )}
          </div>

          {/* Total Weight */}
          <div className="inventory-total">
            <strong>Total Weight:</strong> {calculateTotalWeight()}
          </div>
        </div>

        {/* Coins */}
        <div className="section">
          <h2>Coins</h2>
          <div className="coins-grid">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Copper</label>
                  <input
                    type="number"
                    value={formData.coins.copper || ''}
                    onChange={(e) => handleCoinsChange('copper', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Silver</label>
                  <input
                    type="number"
                    value={formData.coins.silver || ''}
                    onChange={(e) => handleCoinsChange('silver', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Gold</label>
                  <input
                    type="number"
                    value={formData.coins.gold || ''}
                    onChange={(e) => handleCoinsChange('gold', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Pellucidium</label>
                  <input
                    type="number"
                    value={formData.coins.pellucidum || ''}
                    onChange={(e) => handleCoinsChange('pellucidum', e.target.value)}
                    min="0"
                  />
                </div>
              </>
            ) : (
              <>
                <ReadOnlyField label="Copper" value={formData.coins.copper || 0} />
                <ReadOnlyField label="Silver" value={formData.coins.silver || 0} />
                <ReadOnlyField label="Gold" value={formData.coins.gold || 0} />
                <ReadOnlyField label="Pellucidium" value={formData.coins.pellucidum || 0} />
              </>
            )}
          </div>
          <div className="coins-total">
            <strong>Total Money:</strong> {calculateTotalMoney()}
            <div className="conversion-hint">
              (10 copper = 1 silver, 10 silver = 1 gold, 10 gold = 1 pellucidium)
            </div>
          </div>
        </div>

        {/* Other Notes */}
        <div className="section">
          <h2>Other Notes</h2>
          {isEditing ? (
            <textarea
              value={formData.otherNotes}
              onChange={(e) => handleChange('otherNotes', e.target.value)}
              rows="4"
              placeholder="Additional character notes..."
            />
          ) : (
            <div className="readonly-textarea">{formData.otherNotes || '—'}</div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Character
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default CharacterSheet;
