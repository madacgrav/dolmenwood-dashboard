import React from 'react';
import './PartyList.css';

function PartyList({ parties, onSelectParty, onCreateNew, onDelete, onViewParty }) {
  return (
    <div className="party-list-container">
      <div className="header">
        <h1>Party Management</h1>
        <p className="subtitle">Manage your adventuring parties</p>
      </div>
      
      <button className="btn-create" onClick={onCreateNew}>
        + Create New Party
      </button>

      <div className="party-grid">
        {parties.map((party) => (
          <div key={party.id} className="party-card">
            <div className="card-content" onClick={() => onSelectParty(party)}>
              <h2>{party.name}</h2>
              {party.description && (
                <p className="party-description">{party.description}</p>
              )}
              <div className="party-meta">
                <span className="meta-item">
                  Created: {new Date(party.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="card-actions">
              <button 
                className="btn-view"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewParty(party.name);
                }}
                aria-label="View party members"
              >
                👥 View Members
              </button>
              <button 
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(party.id);
                }}
                aria-label="Delete party"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {parties.length === 0 && (
        <div className="empty-state">
          <p>No parties yet. Create your first adventuring party!</p>
        </div>
      )}
    </div>
  );
}

export default PartyList;
