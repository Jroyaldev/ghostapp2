/**
 * GhostMode Theme Configuration
 * Based on the brand pillars:
 * 1. APPLE - Sleek, Silent, Premium
 * 2. DISCORD - Culture, Vibe, Expression
 * 3. NOTION - Structure, Memory, Modularity
 */

export const colors = {
  // Background colors
  background: {
    primary: '#121214',     // Dark background
    deep: '#0A0A0C',        // Deep gray background
    card: 'rgba(32, 32, 36, 0.75)', // Glassmorphic UI cards
  },
  
  // Vibe colors
  vibe: {
    friendly: '#FF6B6B',    // Coral - friendly vibe
    helpful: '#4ECDC4',      // Teal - helpful vibe
    chaotic: '#9D50BB',      // Violet - chaotic vibe
    serious: '#FFD166',      // Gold - serious vibe
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',      // Primary text
    secondary: 'rgba(255, 255, 255, 0.7)', // Secondary text
    muted: 'rgba(255, 255, 255, 0.5)', // Muted text
  },
  
  // UI elements
  ui: {
    border: 'rgba(255, 255, 255, 0.1)', // Border
    glow: 'rgba(255, 255, 255, 0.05)',   // Glow effect
    overlay: 'rgba(0, 0, 0, 0.5)',       // Overlay
    divider: 'rgba(255, 255, 255, 0.05)', // Divider
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const glassmorphism = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(4px)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  medium: {
    backgroundColor: 'rgba(32, 32, 36, 0.75)',
    backdropFilter: 'blur(8px)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  heavy: {
    backgroundColor: 'rgba(10, 10, 12, 0.85)',
    backdropFilter: 'blur(12px)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
};

export const typography = {
  fontFamily: {
    sans: 'Inter',
    display: 'SF Pro Display',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Animation constants
export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 450,
  },
  easing: {
    easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
    easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
    easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
};

// Export all theme variables
export default {
  colors,
  spacing,
  borderRadius,
  shadow,
  glassmorphism,
  typography,
  animation,
};
