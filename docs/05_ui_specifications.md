# GhostMode UI/UX Specifications

> "iMessage reimagined by Apple in 2025 if they built for Gen Z group chats instead of SMS history."

## Overall Style Guidelines

- **Black background** as default canvas
- **White and grayscale text** = clean, high contrast, low distraction
- **One accent color only**, chosen dynamically by group (teal, coral, violet, gold)
- **Minimal chrome**: No bubbles, no skeuomorphismu2014just clean rounded edges and motion polish
- **Everything breathes**: Spacing and padding matter more than visual effects
- **Motion as clarity**: Never decorate; only communicate hierarchy, activity, or focus

## Core Chat Page Layout

### Header / Banner

- **Full-bleed top banner** with group member avatars (circular, evenly spaced)
- Subtle scroll collapse: avatars shrink into nav bar
- Optional group name or emoji mood indicator in center
- Settings icon = soft dot or triple-line glyph, top-right

### Chat Messages

- **Message bubbles = glassy, minimal**  
  - Sent: White-on-dark  
  - Received: Grayed-white or soft accent-on-dark  
- Bubbles hug content tightlyu2014no dead space
- Rounded corners = uniform and pill-like
- **Timestamp on swipe-left** (not cluttering view)
- Reactions: Float above message, minimal (tap to expand)

### Chat Behavior

- Press-and-hold: opens radial-style options (react, reply, save)
- Ghost can reply with subtle glow animation & face shift
- Scrolling: buttery, native-feel with **rubber banding**

## Typebox (Bottom Input)

- Fixed to bottom with **glassmorphic bar**, rounded top
- Inside:  
  - Text input = large, full width, placeholder says: *"Say somethingu2026"*  
  - Left: + icon (for meme/image/memory trigger)  
  - Right: **Ghost emoji icon**, pulses slightly if Ghost is listening  
- Keyboard transition: feels native, no delay

## Vibe-Driven Design Elements

- **Ghost Vibe Ring**: top of chat glows slightly based on group energy  
  - Chill = dim teal shimmer  
  - Hype = violet flicker  
  - Tense = red pulse  
- **Ghost face subtly changes** on banner as energy shifts

## Transitions + Motion

- Use **Framer Motion** (via Reanimated 3 or Moti) for:
  - Avatar entrance animations (bounce + fade)
  - Ghost responses (slide-in bottom, glow pulse)
  - Smooth scroll momentum, collapsible headers

## System Components & Design System

- **Buttons**: Rounded, minimal, only show if needed
- **Modals**: Slide up from bottom, dark glass background, sticky close icon
- **Toast / feedback**: Brief, bottom-center, floating with micro-emotion (pulse, blink)

## Memory Interface

### Memory Chips
- Horizontal scrollable row of rounded pill/chip items
- Each chip represents a saved memory (conversation highlight)
- Ghost-curated or user-saved memories
- Visual indicator for memory type (joke, plan, important info)

### Memory Timeline
- Accessible via swipe gesture from main chat
- Calendar-like view of conversation highlights
- Filterable by tags or memory type
- Smooth animations for transitions between timeline and chat

## Ghost Persona Visualization

### Default State
- Minimalist ghost icon/avatar in header
- Subtle ambient animations (gentle floating or breathing)
- Neutral expression with simple eyes and mouth

### Active/Responding States
- Animation transitions when Ghost is engaged
- Expression changes based on conversation context
- Glow effects that match the current vibe color

### Persona Variations
- Visual differences between Ghost personalities
- Color accent shifts based on active persona
- Animation style changes to match personality (playful, helpful, informative)

## Tech Implementation Guide

### UI Frameworks
- **Expo** (with `expo-router`)
- **NativeWind** (Tailwind for React Native)
- **Moti + Reanimated** for transitions
- **React Native Paper** (selectivelyu2014for modals or cards)

### Visual Effects
- `expo-blur` for glassmorphic cards and bottom bar
- `react-native-linear-gradient` for accent shading
- `react-native-svg` for custom ghost + mood rings

### Iconography
- Use `Lucide` or `Phosphor` icons u2192 outlined, no fills
- Custom icons = white stroke SVGs with soft glow filter

## Accessibility Considerations

- High contrast mode for visually impaired users
- Screen reader compatibility for all UI elements
- Haptic feedback alternatives for audio cues
- Customizable text sizing

## Summary of Design Vision

GhostMode's chat experience should feel like:
- **Messages.app rebuilt in 2025 by the Apple Vision team**
- **A UI that breathes, glows, and subtly reacts**
- **No extra features. Just the *right* ones.**
- **A living groupchat, not a chat log.**

Imagine:
> A perfectly rounded typebox.  
> Glassy message layers.  
> Avatars floating like stars.  
> Ghost whispering back with emotion-aware glow.  
> Every detail whispering: "We cared."
