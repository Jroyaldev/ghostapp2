# Firebase Integration Guide for GhostMode

## Overview

GhostMode uses Firebase as its backend service provider for authentication, data storage, real-time messaging, and file storage. This document provides an overview of the Firebase setup and how to interact with Firebase services in the app.

## Firebase Services Configured

- **Authentication**: User sign-up, sign-in, and session management
- **Firestore**: NoSQL database for storing user profiles, conversations, and memories
- **Realtime Database**: For presence status, typing indicators, and real-time features
- **Storage**: For storing user avatars, images, and media files
- **Hosting**: For web deployment (if needed)

## Firebase SDK Implementation

GhostMode uses the React Native Firebase SDK (`@react-native-firebase/*`) for optimal performance on mobile platforms. The SDK provides native implementations of Firebase services that offer better performance and reliability than the web SDK on mobile.

## Authentication Flow

1. **Sign Up**: New users register with phone number verification
2. **Sign In**: Returning users authenticate with phone number verification
3. **Session Management**: Firebase manages authentication state across app restarts

### Setting Up Phone Authentication

To enable phone authentication in your Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (ghost-react-native-mobile)
3. Navigate to Authentication > Sign-in method
4. Enable the Phone provider
5. Add your app's SHA-1 hash (for Android apps)
6. Set up reCAPTCHA verification:
   - For iOS/Android, the reCAPTCHA verification is automatically handled by Firebase SDK
   - For Expo Go, we use `expo-firebase-recaptcha` to handle verification

**Important**: For testing purposes, you can use test phone numbers in the Firebase Authentication console.

## Data Model

### User Profiles
```
/users/{userId}
{
  displayName: string,
  phoneNumber: string,
  createdAt: timestamp,
  theme: string,
  avatar: string (URL)
}
```

### Spaces (Group Chats)
```
/spaces/{spaceId}
{
  name: string,
  description: string,
  createdAt: timestamp,
  createdBy: userId,
  members: array<userId>,
  avatar: string (URL),
  theme: string
}
```

### Messages
```
/spaces/{spaceId}/messages/{messageId}
{
  text: string,
  createdAt: timestamp,
  senderId: userId,
  senderName: string,
  type: string, // 'text', 'image', 'memory'
  mediaUrl: string (optional),
  reactions: map<userId, string>
}
```

### Memories
```
/users/{userId}/memories/{memoryId}
{
  title: string,
  content: string,
  createdAt: timestamp,
  spaceId: string,
  tags: array<string>,
  pinned: boolean
}
```

## User Presence System

User presence is managed through the Realtime Database for efficiency:

```
/status/{userId}
{
  state: string, // 'online' or 'offline'
  last_changed: timestamp
}
```

## Security Rules

Firebase security rules are defined in:
- `firestore.rules` for Firestore Database
- `storage.rules` for Storage
- `database.rules.json` for Realtime Database

These rules ensure that users can only access data they're authorized to see and modify.

## Testing Authentication

To test the phone authentication flow:

1. Enter a valid phone number (with country code) in the sign-in screen
2. Firebase will send a verification code to that phone number
3. Enter the verification code to complete authentication
4. Check the Firebase Authentication console to confirm the user was created

### Testing in Development

For development and testing purposes, you can use Firebase's test phone numbers:
- +1 650-555-3434 (verification code will always be 123456)
- More test numbers available in Firebase documentation

## Next Steps

1. **Implement Real-Time Messaging**: Use Firestore and onSnapshot listeners for real-time chat
2. **Set Up Ghost AI**: Connect DeepSeek-V3 for AI-powered conversations
3. **Memory System**: Implement the memory chip functionality for saving important messages
