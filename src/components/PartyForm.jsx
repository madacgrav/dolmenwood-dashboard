import React, { useState, useEffect } from 'react';
import './PartyForm.css';

function PartyForm({ party, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (party) {
      setFormData({
        name: party.name || '',
        description: party.description || ''
      });
    }
  }, [party]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Party name is required');
      return;
    }

    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="party-form-container">
      <div className="form-header">
        <h1>{party ? 'Edit Party' : 'Create New Party'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="party-form">
        <div className="form-section">
          <h2>Party Details</h2>
          
          <div className="form-group">
            <label htmlFor="party-name">
              Party Name <span className="required">*</span>
            </label>
            <input
              id="party-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter party name..."
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="party-description">Description</label>
            <textarea
              id="party-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter a description for this party..."
              rows={6}
              maxLength={500}
            />
            <small className="char-count">
              {formData.description.length}/500 characters
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-save">
            {party ? 'Update Party' : 'Create Party'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PartyForm;
