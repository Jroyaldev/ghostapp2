/**
 * Helper utilities for GhostMode
 */

/**
 * Generate a random ID string
 * Used for message IDs, etc.
 */
export const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Format a timestamp for display
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time (e.g., "10:30 AM")
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date for display
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date (e.g., "Today", "Yesterday", or "Apr 12")
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Otherwise return formatted date
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a timestamp as a relative time ago string
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted relative time (e.g., "just now", "5m ago", "2h ago")
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);
  
  // Less than a minute
  if (secondsAgo < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes}m ago`;
  }
  
  // Less than a day
  if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours}h ago`;
  }
  
  // Less than a week
  if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days}d ago`;
  }
  
  // Otherwise return formatted date
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};
