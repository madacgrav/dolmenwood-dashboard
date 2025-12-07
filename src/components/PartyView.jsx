import React, { useState, useEffect } from 'react';
import './PartyView.css';

function PartyView({ partyName, allCharacters, currentUser, onBack, onSelectCharacter }) {
  const [partyMembers, setPartyMembers] = useState([]);
  const [partyDiary, setPartyDiary] = useState([]);

  useEffect(() => {
    if (partyName && allCharacters) {
      // Filter characters that belong to this party
      const members = allCharacters.filter(char => char.partyName === partyName);
      setPartyMembers(members);

      // Collect all diary entries from party members and sort by date
      const allDiaryEntries = [];
      members.forEach(member => {
        if (member.diaryEntries && member.diaryEntries.length > 0) {
          member.diaryEntries.forEach(entry => {
            allDiaryEntries.push({
              ...entry,
              characterName: member.name,
              characterId: member.id
            });
          });
        }
      });

      // Sort by date (newest first) - ISO strings can be compared directly
      allDiaryEntries.sort((a, b) => b.date.localeCompare(a.date));
      setPartyDiary(allDiaryEntries);
    }
  }, [partyName, allCharacters]);

  return (
    <div className="party-view-container">
      <div className="party-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1>{partyName}</h1>
      </div>

      {/* Party Members Section */}
      <div className="section party-members-section">
        <h2>Party Members ({partyMembers.length})</h2>
        {partyMembers.length > 0 ? (
          <div className="party-members-grid">
            {partyMembers.map((member) => (
              <div 
                key={member.id} 
                className="party-member-card"
                onClick={() => onSelectCharacter(member)}
              >
                {member.avatar && (
                  <div className="member-avatar-container">
                    <img src={member.avatar} alt={member.name} className="member-avatar" />
                  </div>
                )}
                <h3>{member.name}</h3>
                <p className="member-class">{member.kindredClass}</p>
                <div className="member-stats">
                  <div className="stat">
                    <span className="label">Level</span>
                    <span className="value">{member.level}</span>
                  </div>
                  <div className="stat">
                    <span className="label">HP</span>
                    <span className="value">{member.hp}/{member.maxHp}</span>
                  </div>
                  <div className="stat">
                    <span className="label">AC</span>
                    <span className="value">{member.ac}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No party members found for "{partyName}".</p>
          </div>
        )}
      </div>

      {/* Party Diary Section */}
      <div className="section party-diary-section">
        <h2>Party Diary</h2>
        {partyDiary.length > 0 ? (
          <div className="party-diary-entries">
            {partyDiary.map((entry) => (
              <div key={`${entry.characterId}-${entry.id}`} className="party-diary-entry">
                <div className="diary-entry-header">
                  {entry.sessionNumber && (
                    <span className="session-number">Session #{entry.sessionNumber}</span>
                  )}
                  <span className="diary-date">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <div className="diary-content">{entry.content}</div>
                <div className="diary-author">
                  — {entry.authorName} ({entry.characterName})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No diary entries yet. Party members can add entries on their character sheets.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PartyView;
