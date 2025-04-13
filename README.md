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

For Android, you'll need to add the `google-services.json` file to the `android/app` directory. For iOS, add the `GoogleService-Info.plist` file to the iOS project in Xcode.

## App Structure

- `/app/screens`: Main application screens
- `/app/components`: Reusable UI components
- `/app/navigation`: Navigation configuration
- `/app/services`: Firebase and API services
- `/app/context`: React context providers
- `/app/styles`: Global styles and theming

## Development Roadmap

See the [Development Roadmap](docs/06_development_roadmap.md) for the current status and planned features.

## Documentation

- [Tech Stack](docs/02_tech_stack.md)
- [Brand Guidelines](docs/03_brand_guidelines.md)
- [Feature Requirements](docs/04_feature_requirements.md)
- [UI Specifications](docs/05_ui_specifications.md)
- [Firebase Setup](docs/07_firebase_setup.md)

## License

[MIT License](LICENSE)
