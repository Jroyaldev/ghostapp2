# GhostMode

> iMessage redesigned by Apple's 2025 vision team... if they built it for group chats.

GhostMode is a premium mobile messaging app built on React Native and Firebase, featuring AI assistance with memory persistence, real-time group dynamics, and a beautiful glassmorphic UI.

## Features

- **Glassmorphic UI**: Apple-inspired dark glass interface with premium feel
- **Ghost AI Assistant**: Context-aware AI that matches your group's vibe
- **Memory Chips**: Save and organize important moments from your conversations
- **Real-time Group Dynamics**: Live "vibe ring" showing the energy of your conversation
- **User Authentication**: Secure Firebase authentication system

## Tech Stack

- **Frontend**: Expo + React Native + NativeWind
- **Animation**: Framer Motion/Reanimated 
- **State Management**: Zustand/Jotai
- **Backend/Realtime**: Firebase (Auth, Firestore, Realtime DB, Storage)
- **AI Layer**: DeepSeek-V3 via Replicate or custom hosting

## Getting Started

### Prerequisites

- Node.js v20 or higher
- Expo CLI
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Jroyaldev/ghostapp2.git
   cd ghostapp2
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npx expo start
   ```

## Firebase Configuration

The app is configured to use Firebase for authentication, database, and storage. Firebase configuration is already set up in the `/app/services/firebase.js` file.

### Firestore Security Rules

To ensure proper testing and development, use the following Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default rule - deny all access unless explicitly allowed
    match /{document=**} {
      allow read, write: if false;
    }
    
    // User profiles - allow users to read/write only their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow subcollections within user documents with same permission model
      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Spaces/groups - users can read spaces they're members of and write to spaces they own
    match /spaces/{spaceId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
      
      // Messages in spaces - members can read, write under the same condition
      match /messages/{messageId} {
        allow read: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/spaces/$(spaceId)).data.members;
        allow create: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/spaces/$(spaceId)).data.members;
        allow update, delete: if request.auth != null && request.auth.uid == resource.data.senderId;
      }
    }
    
    // Memories - accessible by the owner only
    match /memories/{memoryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Testing collection - allow unrestricted access for development
    match /public_test/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Firebase Testing

The app includes a dedicated Firebase test screen accessible from the bottom navigation. This screen allows you to test:

- Firebase Authentication
- Firestore database operations

## App Structure

- `/app/screens`: Main application screens
- `/app/components`: Reusable UI components, including the glassmorphic UI elements
- `/app/navigation`: Navigation configuration and custom tab bar
- `/app/services`: Firebase and API services
- `/app/context`: React context providers
- `/app/theme`: Global styles and theming
- `/app/utils`: Utility functions and testing helpers

## UI Components

- **GlassmorphicTabBar**: Custom bottom navigation with premium look and feel
- **Hero Sections**: Apple Editors' Choice quality headers on primary screens
- **Card Components**: Glassmorphic card designs for content display

## Development Roadmap

### Completed
- App scaffolding and navigation structure
- Firebase integration (Auth, Firestore)
- Premium UI components (glassmorphic design)
- Authentication flow
- Testing utilities for Firebase

### Next Steps
1. **Group Spaces** - Implement creation and management of conversation spaces
2. **Ghost AI Integration** - Connect to DeepSeek-V3 for AI companion functionality
3. **Memory System** - Build the timeline and chip-based memory storage
4. **Vibe Detection** - Implement sentiment analysis for group dynamics visualization
5. **Media Sharing** - Add support for sharing images, videos, and other media
6. **Notifications** - Set up push notifications for new messages
7. **Profile Management** - Complete user profile creation and editing
8. **Animation Refinement** - Implement micro-animations for UI elements

## Documentation

- [Tech Stack](docs/02_tech_stack.md)
- [Brand Guidelines](docs/03_brand_guidelines.md)
- [Feature Requirements](docs/04_feature_requirements.md)
- [UI Specifications](docs/05_ui_specifications.md)
- [Firebase Setup](docs/07_firebase_setup.md)

## License

[MIT License](LICENSE)
