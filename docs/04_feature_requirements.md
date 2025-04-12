# GhostMode Feature Requirements

> "iMessage redesigned by Apple's 2025 vision team… if they built it for group chats."

## 1️⃣ Core Experience — Messaging, Reimagined

### Onboarding & Entry
- [ ] One-tap sign-in (OAuth: Apple, Google)
- [ ] Persona setup (group-facing avatar + tone)
- [ ] Smart invite links (deep link to space)
- [ ] Interactive walkthrough (1-min core feature demo)

### Chat Interface — Native-Feel + Futuristic
- [ ] Real-time messaging (typing, delivery, scrollback)
- [ ] Glassmorphic message cards (blur, glow, minimal)
- [ ] Threaded replies (branch-view UI)
- [ ] Rich media preview (image, link, meme)
- [ ] Framer Motion-like transitions (no clunky state jumps)

### Group Dynamics — Where The Vibe Lives
- [ ] Persistent spaces (named, themed group chats)
- [ ] Custom group settings (name, emoji, avatar aura)
- [ ] Ghost vibe sensing (auto-detect tone from convo)
- [ ] Live "vibe ring" (color-glow border based on energy)
- [ ] Emoji + sticker reactions (tap, hold, customize)

### Memory System — Notion-Level Organization
- [ ] Infinite scrollback (searchable, fast)
- [ ] Memory chips (saved jokes, quotes, plans)
- [ ] Horizontal timeline (scrollable memory history)
- [ ] Pins + tags (filter, organize, recall fast)
- [ ] Fuzzy search (snappy + scoped)

## 2️⃣ Ghost AI — Personality-Driven Intelligence

### Core AI Behavior
- [ ] Passive by default, active when needed
- [ ] Mood-matched tone (friendly, hype, serious)
- [ ] Memory-aware replies (references past convo)
- [ ] Proactive moments (reminders, questions, nudges)

### Ghost Modes
- [ ] Default: Clean, helpful group assistant  
- [ ] Meme Lord: Chaos + punchlines + stickers  
- [ ] Planner: Extracts todos, suggests schedules  
- [ ] Summarizer: TL;DR generation + event logs  

### AI UX Integration
- [ ] Ghost avatar evolves with persona/tone
- [ ] Ghost never "feels like a bot" (acts like a person)
- [ ] Animated thoughts (no spinners—fluid loading)
- [ ] Soft failure states (humor or fallback suggestions)

## 3️⃣ Visual System — Apple-Level Polish

### Interface System
- [ ] Glass-dark UI baseline (mist, aura, depth)
- [ ] Z-depth layering (cards, nav, chat bubbles)
- [ ] Bottom nav only (gesture-native iOS UX)
- [ ] Atomic components (clean, themed)

### Visual Language
- [ ] Ghost avatars (Ghibli-meets-iOS-style)
- [ ] Color palette = vibe-reactive (coral, violet, teal, gold)
- [ ] Typography = ultra-clean (Satoshi/Inter)
- [ ] Icon set = glow-line (Lucide, Phosphor-based)

### Emotional Feedback
- [ ] Subtle haptics (tap, drag, reply)
- [ ] Whisper-style sounds (toggleable UI feedback)
- [ ] Animation rhythm (micro and macro motion consistency)

## 4️⃣ Tech Foundation — Built For Speed & Style

### Frontend
- [ ] Expo + React Native (mobile-first native experience)
- [ ] NativeWind (Tailwind utility classes + dark theme tokens)
- [ ] Moti + Reanimated 3 (gesture fluidity, stacked motion)
- [ ] Zustand / Jotai (clean, scoped global state)
- [ ] Caching for offline-read support

### Backend
- [ ] Supabase Auth + Postgres + Channels
- [ ] Realtime pub/sub chat + memory sync
- [ ] Edge functions for Ghost logic + AI relay
- [ ] Basic content filters (toxicity, spam, etc.)

### AI System
- [ ] DeepSeek-V3 (fast, smart, economical core)
- [ ] OpenRouter fallback (Claude 3 Haiku, GPT-4 Turbo)
- [ ] Prompt engine = persona routing + context blending
- [ ] Fallback behavior (when models return low confidence)

## 5️⃣ Product Insight & Launch Framework

### Analytics & Growth
- [ ] Core usage metrics (DAU, retention, messages/session)
- [ ] Event logging (onboarding, group creation, memory saved)
- [ ] Crash + error capture (visible in dev console)
- [ ] In-app feedback (emoji-based or message-based)

### Launch Readiness
- [ ] Private beta group system (invite code flow)
- [ ] Uptime SLA: 99.9% (Supabase + edge logs)
- [ ] Sub-100ms baseline on core user actions
- [ ] Published content rules (ghostmode.ethics.md)

## Feature Implementation Priority Matrix

| Priority | Feature | Impact | Complexity | Dependencies |
|----------|---------|--------|------------|-------------|
| **P0** | Glassmorphic UI + Vibe Ring | High | Medium | UI Components, Animation System |
| **P0** | Memory Chips Timeline | High | High | Backend Storage, UI Components |
| **P0** | Ghost Personas | High | High | AI Model, Prompt System |
| **P0** | Real-time Group Vibes | High | Medium | Realtime Channels, Animation |
| **P0** | Micro-animation polish | High | Medium | Animation System |
| **P1** | Authentication System | Medium | Low | Supabase Auth |
| **P1** | Threaded Replies | Medium | Medium | Message Architecture |
| **P1** | Rich Media Preview | Medium | Medium | Media Processing |
| **P1** | Emoji + Sticker Reactions | Medium | Low | Asset Library |
| **P1** | Memory Search | Medium | Medium | Search Index |
| **P2** | Core Metrics | Low | Low | Analytics Setup |
| **P2** | Group Settings | Low | Low | User Preferences |
| **P2** | UI Sound Effects | Low | Low | Sound Library |

## The "Ghost First Five" — MVP That Wins

Focus on these for launch magic:

1. [ ] **Glassmorphic UI + Vibe Ring** – Sets the tone and feel instantly  
2. [ ] **Memory Chips Timeline** – Turns chat into something meaningful  
3. [ ] **Ghost Personas** – Adds magic, humor, utility, and humanity  
4. [ ] **Real-time Group Vibes** – Makes the chat feel *alive*  
5. [ ] **Micro-animation polish** – Turns usable into unforgettable

## Deferred to V2 — Future Phases

These are cool, but not critical at launch:

- [ ] Voice messages  
- [ ] End-to-end encryption (v1 = secure transport)  
- [ ] Advanced vector memory (semantic search/recall)  
- [ ] Multi-device sync (iOS MVP first)  
- [ ] Public persona marketplace (v1 = curated internal list only)
