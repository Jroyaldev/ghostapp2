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
