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

      // For now, we'll provide a placeholder response
      // In a production environment, this would call the GitHub Copilot API
      // via a secure backend proxy to avoid exposing API keys
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Placeholder response - in production, replace with actual API call
      const mockResponse = generateMockResponse(question);
      
      setAnswer(mockResponse);
      
      // Add answer to conversation history
      setConversationHistory([
        ...newConversation,
        { type: 'answer', text: mockResponse, timestamp: new Date().toISOString() }
      ]);
      
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
            {conversationHistory.map((item, index) => (
              <div key={index} className={`history-item ${item.type}`}>
                <div className="history-timestamp">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
                <div className="history-text">
                  {item.type === 'question' ? '❓ ' : '💡 '}
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-panel">
        <h3>About This Feature</h3>
        <p>
          This interface is designed to connect with the GitHub Copilot custom agent 
          "dolmenwood" to answer questions about the Dolmenwood tabletop RPG.
        </p>
        <p className="note">
          <strong>Note:</strong> The current implementation uses demonstration responses. 
          In a production environment, this would require:
        </p>
        <ul>
          <li>A secure backend API proxy to handle GitHub authentication</li>
          <li>GitHub Copilot API credentials</li>
          <li>Integration with the custom "dolmenwood" agent</li>
        </ul>
        <p>
          For detailed rules and lore, please refer to the Dolmenwood Player's Book 
          PDF included in this repository.
        </p>
      </div>
    </div>
  );
}

export default AskQuestion;
