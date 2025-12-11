import React from 'react';
import './PartyList.css';

function PartyList({ parties, onSelectParty, onCreateNew, onDelete, onViewParty, isAuthenticated }) {
  return (
    <div className="party-list-container">
      <div className="header">
        <h1>Party Management</h1>
        <p className="subtitle">
          {isAuthenticated 
            ? 'Manage your adventuring parties' 
            : 'View adventuring parties (sign in to create or edit)'}
        </p>
      </div>
      
      <button className="btn-create" onClick={onCreateNew}>
        + Create New Party
      </button>

      <div className="party-grid">
        {parties.map((party) => (
          <div key={party.id} className="party-card">
            <div className="card-content" onClick={() => isAuthenticated ? onSelectParty(party) : alert('Please sign in to edit parties')}>
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
              {isAuthenticated && (
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
              )}
            </div>
          </div>
        ))}
      </div>

      {parties.length === 0 && (
        <div className="empty-state">
          <p>No parties yet. {isAuthenticated ? 'Create your first adventuring party!' : 'Sign in to create the first adventuring party!'}</p>
        </div>
      )}
    </div>
  );
}

export default PartyList;
