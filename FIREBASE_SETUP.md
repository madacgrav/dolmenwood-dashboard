# Firebase Setup Guide

This guide will help you set up Firebase for cross-browser and cross-machine character synchronization.

## Why Firebase?

Firebase provides:
- ✅ **Cloud storage** - Characters saved in the cloud
- ✅ **User authentication** - Secure email/password login
- ✅ **Real-time sync** - Changes appear instantly across all devices
- ✅ **No backend needed** - Works with static hosting (GitHub Pages)
- ✅ **Free tier** - Generous free quota for personal use
- ✅ **Data isolation** - Each user has their own private character list

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `dolmenwood-dashboard` (or any name you prefer)
4. Disable Google Analytics (optional, not needed for this app)
5. Click **"Create project"**

### 2. Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Give your app a nickname: `Dolmenwood Dashboard`
3. **Do NOT** check "Firebase Hosting" (we use GitHub Pages)
4. Click **"Register app"**
5. You'll see a config object - **keep this page open**

### 3. Copy Firebase Configuration

1. Copy the configuration values from the Firebase Console
2. Create a file named `.env` in the project root (same folder as `package.json`)
3. Copy the contents from `.env.example` to `.env`
4. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyB_your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

### 4. Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it in the next step)
4. Choose a location (select closest to you or your users)
5. Click **"Enable"**

### 5. Configure Security Rules

To allow users to read and write only their own data, and to allow shared access to parties and maps:

1. In Firestore Database, click the **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write only their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow all users (even unauthenticated) to read shared parties
    // Only authenticated users can create, update, or delete parties
    match /shared_parties/{partyId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // Allow all users (even unauthenticated) to read shared maps
    // Only authenticated users can create, update, or delete maps
    match /shared_maps/{mapId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### 6. Enable Email/Password Authentication

This allows users to create accounts with email and password:

1. Go to **Build** → **Authentication**
2. Click **"Get started"**
3. Click the **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Click **"Save"**

### 7. Deploy Environment Variables to GitHub Pages

Since GitHub Pages serves static files, you need to set environment variables during build:

#### Option A: GitHub Actions (Recommended)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** for each variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

4. Update your `.github/workflows/deploy.yml` to include these secrets:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
```

#### Option B: Hardcode Values (Less Secure)

If you don't mind your Firebase config being public (it's designed to be):

1. Edit `src/utils/firebase.js`
2. Replace the `import.meta.env` values with your actual config values
3. Commit and push

**Note:** Firebase config values are meant to be public. Security is enforced by Firestore Security Rules.

## Testing

1. Run `npm run dev` locally
2. You should see the Sign In / Sign Up form
3. Create an account with an email and password
4. Create a character
5. Sign out and sign back in - you should see your character
6. Open the app in a different browser or device with the same account
7. You should see the same characters appear!

## Troubleshooting

### "Missing or insufficient permissions" error

This error occurs when Firestore Security Rules are not correctly configured:

- **Solution:** Make sure you've published the security rules from Step 5 above
- The rules must include permissions for:
  - `users/{userId}` - User-specific character data
  - `shared_parties/{partyId}` - Shared party data (readable by all, writable by authenticated users)
  - `shared_maps/{mapId}` - Shared map data (readable by all, writable by authenticated users)
- Check the **Firestore Rules** tab in Firebase Console to verify rules are published
- After publishing rules, it may take a few seconds to take effect

### "Cloud sync enabled" doesn't appear

- Check browser console for errors
- Verify `.env` file exists with correct values
- Make sure Email/Password authentication is enabled in Firebase

### Characters don't sync

- Check Firestore Security Rules are published
- Verify Email/Password sign-in is enabled
- Check browser console for permission errors
- Make sure you're signed in with the same account on all devices

### "Offline mode" appears

- App will fallback to localStorage if Firebase fails (no cloud sync)
- Check if `.env` file has correct values
- Verify internet connection
- Make sure you're signed in (or sign up for a new account)

## Cost

Firebase free tier includes:
- **1 GB** stored data
- **10 GB/month** network bandwidth  
- **50,000 reads/day**
- **20,000 writes/day**

For a character sheet app, this is **more than enough** for hundreds of users.

## Data Migration

Existing localStorage data will automatically migrate to Firebase on first load when cloud sync is enabled.

## Security Notes

- ✅ Firebase config values are public (by design)
- ✅ Security is enforced by Firestore Rules
- ✅ Each user can only access their own data
- ✅ Email/password authentication provides secure user accounts
- ⚠️ Store your password securely - password reset features require additional Firebase setup
- ⚠️ Each account has its own unique character list

## Need Help?

Check the [Firebase Documentation](https://firebase.google.com/docs/firestore) or open an issue on GitHub.
