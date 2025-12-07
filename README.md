# Dolmenwood Character Dashboard

A mobile-optimized web application for managing character sheets for the Dolmenwood tabletop RPG. This application allows players to create, read, update, and delete character sheets with an interface designed to match the official Dolmenwood character sheet format.

## Features

- ✨ **Full CRUD Operations**: Create, read, update, and delete characters
- 🔐 **User Authentication**: Secure email/password login system
- 👤 **Private Character Lists**: Each user has their own unique set of characters
- 📱 **Mobile-First Design**: Optimized for smartphones and tablets
- ☁️ **Cloud Sync** (Optional): Characters sync across all your devices in real-time via Firebase
- 💾 **Offline Support**: Works without internet using localStorage fallback
- 🎨 **Beautiful UI**: Dark fantasy theme matching Dolmenwood aesthetics
- 📋 **Complete Character Sheet**: All stats from the official character sheet including:
  - Basic Info (Name, Kindred & Class, Background, Alignment, etc.)
  - Ability Scores (Strength, Intelligence, Wisdom, Dexterity, Constitution, Charisma)
  - Save Targets (Doom, Ray, Hold, Blast, Spell, Resistance)
  - Combat Stats (HP, AC, Attack, Speed)
  - Skills & Languages
  - Experience & Level tracking
  - Kindred & Class Traits
  - Notes section

## Cloud Sync Setup (Optional)

To enable cross-device synchronization with user accounts:

1. See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for detailed setup instructions
2. Create a free Firebase project
3. Enable Email/Password authentication
4. Configure environment variables
5. Characters will automatically sync across all your devices when you sign in!

**Without Firebase:** App works using localStorage (data stays on your device only, no user accounts)

## Quick Start

### Prerequisites

- Node.js 14+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The application will be available at `http://localhost:3000`

## Usage

### Authentication (when Firebase is enabled)

- **Sign Up**: Create a new account with email and password
- **Sign In**: Access your account and characters
- **Sign Out**: Click the "Sign Out" link in the top right corner

### Main Dashboard

- View all your characters in card format
- Click on any character card to view/edit details
- Click the **+ Create New Character** button to add a new character
- Hover over a character card to reveal the delete button (×)

### Character Sheet

- Fill in all character information
- All fields are optional except Name
- Click **Save Character** to save changes
- Click **Back to List** or **Cancel** to return without saving

### Data Persistence

- **With Firebase**: Characters are stored in the cloud and synced across all your devices when signed in to the same account. Each user has their own private character list.
- **Without Firebase**: All character data is stored in your browser's localStorage. Data persists across sessions but is specific to your browser.

To backup your data:

1. Open browser developer tools (F12)
2. Go to Application → Local Storage
3. Copy the `dolmenwood_characters` key value

## Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Responsive styling with mobile-first approach
- **localStorage API** - Client-side data persistence

## Project Structure

```
dolmenwood-dashboard/
├── src/
│   ├── components/
│   │   ├── CharacterList.jsx      # Main dashboard view
│   │   ├── CharacterList.css
│   │   ├── CharacterSheet.jsx     # Character detail/edit form
│   │   └── CharacterSheet.css
│   ├── data/
│   │   └── exampleCharacters.js   # Example characters from the PDFs (not auto-loaded)
│   ├── utils/
│   │   └── storage.js             # localStorage utility functions
│   ├── App.jsx                    # Main app component
│   ├── App.css                    # Global styles
│   └── main.jsx                   # Application entry point
├── index.html
├── vite.config.js
└── package.json
```

## Example Characters

The `src/data/exampleCharacters.js` file contains 4 pre-made characters from the Dolmenwood PDFs that can be used as reference:

1. **Brion Blackthorn** - Breggle Knight, Sorcerer's Assistant
2. **Gilly Dagwood** - Half Human/Elf Friar, Jeweler
3. **Mudwort Mosfoot** - Mossling Hunter, Squirrel Trainer
4. **Kitty Grisner** - Grimalkin Bard, Mariner

**Note:** New user accounts start with an empty character list. These examples are included for reference only.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

See LICENSE file for details.

## Contributing

This is a community project for Dolmenwood players. Feel free to submit issues and pull requests!