import React, { useState } from 'react';
import './AskQuestion.css';

function AskQuestion({ user }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      // Add question to conversation history
      const newConversation = [
        ...conversationHistory,
        { type: 'question', text: question, timestamp: new Date().toISOString() }
      ];

      let responseText;
      
      // Check if backend API proxy is configured
      const proxyUrl = import.meta.env.VITE_GITHUB_API_PROXY_URL;
      
      if (proxyUrl) {
        // Use the secure backend proxy to call GitHub Copilot API
        try {
          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get response from server');
          }

          const data = await response.json();
          responseText = data.answer;
        } catch (apiError) {
          console.error('API Error:', apiError);
          // Fall back to mock response if API fails
          responseText = generateMockResponse(question);
          setError('Connected to demo mode. Configure backend to use real AI responses.');
        }
      } else {
        // No proxy configured - use mock response
        await new Promise(resolve => setTimeout(resolve, 1500));
        responseText = generateMockResponse(question);
      }
      
      setAnswer(responseText);
      
      // Add answer to conversation history
      setConversationHistory([
        ...newConversation,
        { type: 'answer', text: responseText, timestamp: new Date().toISOString() }
      ]);
      
      // Clear the question input for next question
      setQuestion('');
      
    } catch (err) {
      console.error('Error asking question:', err);
      setError('Failed to get an answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (q) => {
    const lowerQ = q.toLowerCase();
    
    // Provide helpful responses based on common Dolmenwood questions
    if (lowerQ.includes('character') && (lowerQ.includes('create') || lowerQ.includes('make'))) {
      return "To create a character in Dolmenwood:\n\n1. Choose your Kindred (race): Options include Breggle, Grimalkin, Half-Human/Elf, Human, Mossling, and Wood-Kin.\n\n2. Select your Class: Fighter, Friar, Hunter, Bard, Knight, Magician, or Thief.\n\n3. Roll ability scores: Strength, Intelligence, Wisdom, Dexterity, Constitution, and Charisma (typically 3d6 for each).\n\n4. Determine save targets and calculate derived stats like HP and AC.\n\n5. Choose a background that fits your character's history.\n\nUse the 'My Characters' tab to create and manage your character sheets!";
    }
    
    if (lowerQ.includes('kindred') || lowerQ.includes('race')) {
      return "Dolmenwood features six unique Kindred (races):\n\n• Breggle: Small, gnome-like folk with earthy wisdom\n• Grimalkin: Cat-folk with feline grace and curiosity\n• Half-Human/Elf: Balanced heritage with mixed abilities\n• Human: Versatile and adaptable\n• Mossling: Tiny forest dwellers connected to nature\n• Wood-Kin: Plant-based beings with unique abilities\n\nEach Kindred has special traits and abilities that make them suited for different roles!";
    }
    
    if (lowerQ.includes('class') && !lowerQ.includes('kindred')) {
      return "Dolmenwood offers seven character classes:\n\n• Fighter: Warriors skilled in combat\n• Friar: Holy warriors with divine magic\n• Hunter: Wilderness experts and trackers\n• Bard: Versatile performers with magical abilities\n• Knight: Noble warriors with special codes\n• Magician: Arcane spellcasters\n• Thief: Skilled rogues and scouts\n\nEach class has unique abilities and progression paths!";
    }
    
    if (lowerQ.includes('party') || lowerQ.includes('parties')) {
      return "The Parties tab allows you to:\n\n• Create adventuring parties to group characters together\n• View all members of a party and their stats\n• Add characters from your character list to parties\n• See party composition and balance\n• Coordinate with other players\n\nParties are shared across all users, making it easy to collaborate in campaigns!";
    }
    
    if (lowerQ.includes('map') || lowerQ.includes('maps')) {
      return "The Shared Maps feature lets you:\n\n• Upload maps for your Dolmenwood campaign\n• Share maps with all players\n• View maps in a gallery format\n• Click to enlarge and see details\n• Delete your own uploaded maps\n\nMaps are automatically resized and optimized for easy sharing!";
    }
    
    if (lowerQ.includes('save') || lowerQ.includes('sync')) {
      return "Your data is saved in two ways:\n\n1. Local Storage: All data is automatically saved to your browser\n2. Cloud Sync (with Firebase): When signed in, your characters sync across devices\n\nParties and Maps are shared with all users regardless of sign-in status. Your personal characters are private to your account!";
    }
    
    // Default response for other questions
    return `Thank you for your question about Dolmenwood!\n\nNote: This is a demonstration interface. In a production environment, this would connect to the GitHub Copilot custom agent "dolmenwood" to provide detailed answers about the game.\n\nYour question: "${q}"\n\nFor now, try asking about:\n• How to create a character\n• Available Kindred (races)\n• Character classes\n• Using parties\n• Uploading maps\n• How data is saved\n\nYou can also refer to the Dolmenwood Player's Book PDF included in this repository for comprehensive rules and lore!`;
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all conversation history?')) {
      setConversationHistory([]);
      setQuestion('');
      setAnswer('');
      setError('');
    }
  };

  return (
    <div className="ask-question-container">
      <div className="ask-question-header">
        <h1>Ask About Dolmenwood</h1>
        <p className="subtitle">Get answers about the game, rules, and lore</p>
      </div>

      <div className="question-form-section">
        <form onSubmit={handleAskQuestion} className="question-form">
          <div className="form-group">
            <label htmlFor="question-input">Your Question:</label>
            <textarea
              id="question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about Dolmenwood - characters, kindred, classes, rules, lore..."
              rows="4"
              disabled={isLoading}
              className="question-textarea"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-ask-question"
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? 'Getting Answer...' : '🔮 Ask Question'}
            </button>
            
            {conversationHistory.length > 0 && (
              <button 
                type="button"
                onClick={handleClearHistory}
                className="btn-clear-history"
                disabled={isLoading}
              >
                Clear History
              </button>
            )}
          </div>
        </form>

        {answer && (
          <div className="answer-section">
            <h3 className="answer-title">Answer:</h3>
            <div className="answer-content">
              {answer.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {conversationHistory.length > 0 && (
        <div className="conversation-history">
          <h2 className="history-title">Conversation History</h2>
          <div className="history-list">
            {conversationHistory.map((item, index) => {
              // Safe date formatting with fallback
              let timeStr = '';
              try {
                const date = new Date(item.timestamp);
                if (!isNaN(date.getTime())) {
                  timeStr = date.toLocaleTimeString();
                } else {
                  timeStr = 'Invalid time';
                }
              } catch (e) {
                timeStr = 'Invalid time';
              }
              
              return (
              <div key={index} className={`history-item ${item.type}`}>
                <div className="history-timestamp">
                  {timeStr}
                </div>
                <div className="history-text">
                  {item.type === 'question' ? '❓ ' : '💡 '}
                  {item.text}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="info-panel">
        <h3>About This Feature</h3>
        <p>
          This interface connects to a secure backend API proxy that handles GitHub 
          Copilot authentication to answer questions about the Dolmenwood tabletop RPG.
        </p>
        <p className="note">
          <strong>Setup Instructions:</strong>
        </p>
        <ul>
          <li>Install backend dependencies: <code>npm install</code></li>
          <li>Configure environment variables in <code>.env</code> file (see <code>.env.example</code>)</li>
          <li>Set your GitHub Personal Access Token with Copilot scope</li>
          <li>Start the backend server: <code>npm run server</code></li>
          <li>Start the frontend: <code>npm run dev</code></li>
        </ul>
        <p>
          {import.meta.env.VITE_GITHUB_API_PROXY_URL ? (
            <span className="status-connected">✓ Backend API configured</span>
          ) : (
            <span className="status-demo">⚠ Running in demo mode - configure backend for real AI responses</span>
          )}
        </p>
        <p>
          For detailed rules and lore, please refer to the Dolmenwood Player's Book 
          PDF included in this repository.
        </p>
      </div>
    </div>
  );
}

export default AskQuestion;
