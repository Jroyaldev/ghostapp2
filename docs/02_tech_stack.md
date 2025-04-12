# GhostMode Technical Stack

## Frontend Architecture

### Core Technologies
- **Expo + React Native**: Mobile-first native experience with cross-platform capabilities
- **NativeWind**: Tailwind utility classes + dark theme tokens for consistent styling
- **Framer Motion/Reanimated**: Animation and gesture fluidity throughout the application
  - Micro-animations for feedback and delight
  - Gesture-driven interactions
  - Stacked motion systems

### State Management
- **Zustand/Jotai**: Clean, scoped global state management
  - Minimal boilerplate
  - Atomic state design
  - Performance optimized

### UI Components
- Custom glassmorphic components (using `expo-blur`)
- Bottom-based navigation (iOS-native feel)
- Z-depth layering system for messages, cards, and navigation
- Responsive design with haptic feedback integration

### Performance Optimizations
- Caching for offline-read support
- Memory optimization for infinite scrollback
- Image and media optimization
- Sub-100ms baseline on core user actions

## Backend Infrastructure

### Platform
- **Firebase**: Comprehensive backend solution
  - User Authentication (OAuth: Apple, Google)
  - Realtime Database
  - Cloud Functions
  - Firestore
  - Authentication

### Realtime Features
- Pub/sub chat architecture
- Memory synchronization across devices
- Typing indicators and presence detection
- Group activity monitoring

### Security & Compliance
- Transport layer security (TLS)
- Basic content filters (toxicity, spam detection)
- GDPR-compliant data handling

## AI System Architecture

### Core AI Model
- **DeepSeek-V3**: Primary large language model
  - Fast response times
  - Economical inference costs
  - Strong contextual understanding

### Backup Models
- **OpenRouter/Fireworks**: Fallback options
  - Claude 3 Haiku
  - GPT-4 Turbo
  - Load balancing based on availability

### AI Infrastructure
- Prompt engineering system for persona management
- Context blending for memory-aware responses
- Fallback behavior for low-confidence responses
- Vibe detection and tone matching

## Memory System

### Storage
- **Firebase**: Primary storage for conversation history and saved items. 
- **Firestore**: Optional vector database integration for future semantic search (v2)
- **Cloud Functions**: Serverless operations

### Memory Features
- Memory chip persistence and organization
- Timeline indexing for historical navigation
- Tagging and categorization system
- Search functionality with relevance scoring

## Analytics & Monitoring

### Usage Metrics
- Core performance tracking (DAU, retention, messages/session)
- Event logging for key user actions
- Crash and error reporting
- In-app feedback collection

### Development Tooling
- Code quality and linting automation
- Performance benchmarking
- Automated testing framework
- Continuous integration and deployment
