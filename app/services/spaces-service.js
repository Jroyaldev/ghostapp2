/**
 * Spaces Service for GhostMode
 * Handles creation and management of group spaces for conversations
 * Inspired by Discord's community structure with Apple's aesthetic
 */

import { 
  auth, 
  firestore, 
  FieldValue, 
  addDocument, 
  setDocument,
  updateDocument,
  getDocument,
  queryCollection,
  docRef
} from './firebase';
import { orderBy, limit } from 'firebase/firestore';
import { generateRandomId } from '../utils/helpers';
import { calculateConversationVibe, VIBE_TYPES } from './vibe-service';
import config from '../config/environment';

// Configure logging
const logSafely = (message, data) => {
  if (data === undefined) {
    console.log(`[Spaces Service] ${message}`);
  } else if (typeof data !== 'object') {
    console.log(`[Spaces Service] ${message}:`, data);
  } else {
    console.log(`[Spaces Service] ${message}: [Object]`);
  }
};

/**
 * Create a new space
 * @param {Object} spaceData - Data for the new space
 * @returns {Promise<Object>} - Result of the operation
 */
export const createSpace = async (spaceData) => {
  try {
    logSafely('Creating new space', spaceData.name);
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const spaceId = generateRandomId();
    
    // Set up basic space data
    const newSpace = {
      id: spaceId,
      name: spaceData.name,
      description: spaceData.description || '',
      imageUrl: spaceData.imageUrl || null,
      ownerId: user.uid,
      ownerName: user.displayName || 'Anonymous',
      ownerPhotoURL: user.photoURL || null,
      members: [user.uid],
      memberCount: 1,
      isPrivate: spaceData.isPrivate || false,
      currentVibe: VIBE_TYPES.NEUTRAL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Get the collection path from environment config
    const spacesCollectionPath = config.firestorePaths.spaces;
    
    // Create the space document
    await setDocument(spacesCollectionPath, spaceId, newSpace);
    
    // Also add this space to the user's spaces collection for quick lookup
    await setDocument(`users/${user.uid}/spaces`, spaceId, {
      id: spaceId,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    });
    
    return { success: true, spaceId };
  } catch (error) {
    logSafely('Error creating space', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get spaces for the current user
 * @returns {Promise<Object>} - The user's spaces
 */
export const getUserSpaces = async () => {
  try {
    logSafely('Getting spaces for user');
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      return { spaces: [], error: 'User not authenticated' };
    }
    
    // Get spaces this user is a member of
    const { results: userSpacesData, error: userSpacesError } = await queryCollection(`users/${user.uid}/spaces`);
    
    if (userSpacesError) {
      return { spaces: [], error: userSpacesError };
    }
    
    // If no spaces, return empty array
    if (userSpacesData.length === 0) {
      return { spaces: [], error: null };
    }
    
    // Get space IDs
    const spaceIds = userSpacesData.map(doc => doc.id);
    
    // Get space details
    const spacesCollectionPath = config.firestorePaths.spaces;
    const spaces = [];
    
    await Promise.all(spaceIds.map(async (spaceId) => {
      const { data: spaceData, error: spaceError, exists } = await getDocument(spacesCollectionPath, spaceId);
      
      if (exists && spaceData) {
        spaces.push(spaceData);
      }
    }));
    
    return { spaces, error: null };
  } catch (error) {
    logSafely('Error getting user spaces', error.message);
    return { spaces: [], error: error.message };
  }
};

/**
 * Get messages for a space
 * @param {string} spaceId - ID of the space
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<Object>} - The space messages
 */
export const getSpaceMessages = async (spaceId, limit = 30) => {
  try {
    logSafely('Getting messages for space:', spaceId);
    
    // Get the collection path from environment config
    const spacesCollectionPath = config.firestorePaths.spaces;
    
    // Query for messages in the space, ordered by timestamp
    const { results: messages, error } = await queryCollection(
      `${spacesCollectionPath}/${spaceId}/messages`, 
      [orderBy('timestamp', 'asc')],
      limit
    );
    
    if (error) {
      return { messages: [], error };
    }
    
    return { messages, error: null };
  } catch (error) {
    logSafely('Error getting space messages', error.message);
    return { messages: [], error: error.message };
  }
};

/**
 * Send a message to a space
 * @param {string} spaceId - ID of the space
 * @param {Object} message - Message object with text content
 * @returns {Promise<Object>} - Result of the operation
 */
export const sendMessageToSpace = async (spaceId, message) => {
  try {
    logSafely('Sending message to space:', spaceId);
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Make a copy of the message with additional metadata
    const messageToSend = {
      ...message,
      spaceId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhotoURL: user.photoURL,
      timestamp: new Date().toISOString(),
    };
    
    // Get the collection path from environment config
    const spacesCollectionPath = config.firestorePaths.spaces;
    
    // Add the message to the space's messages collection
    const { id: messageId, error: addError } = await addDocument(
      `${spacesCollectionPath}/${spaceId}/messages`, 
      messageToSend
    );
    
    if (addError) {
      return { success: false, error: addError };
    }
    
    // Update the space's lastMessage and updatedAt
    const { success: updateSuccess, error: updateError } = await updateDocument(
      spacesCollectionPath,
      spaceId,
      {
        lastMessage: {
          text: message.text,
          userName: user.displayName || 'Anonymous',
          timestamp: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
        messageCount: FieldValue.increment(1),
        currentVibe: message.vibe ? message.vibe : undefined,
      }
    );
    
    if (updateError) {
      logSafely('Warning: Updated message but failed to update space metadata', updateError);
    }
    
    return { success: true, messageId: messageId || message.id };
  } catch (error) {
    logSafely('Error sending message to space', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Join a space (by invitation code or direct invitation)
 * @param {string} spaceId - ID of the space to join
 * @returns {Promise<Object>} - Result of the operation
 */
export const joinSpace = async (spaceId) => {
  try {
    logSafely('Joining space:', spaceId);
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Get the collection path from environment config
    const spacesCollectionPath = config.firestorePaths.spaces;
    
    // Check if space exists
    const { data: spaceData, error: spaceError, exists } = await getDocument(spacesCollectionPath, spaceId);
    
    if (spaceError) {
      return { success: false, error: spaceError };
    }
    
    if (!exists) {
      return { success: false, error: 'Space not found' };
    }
    
    // Check if user is already a member
    if (spaceData.members.includes(user.uid)) {
      return { success: false, error: 'You are already a member of this space' };
    }
    
    // Add user to space
    const { success: updateSpaceSuccess, error: updateSpaceError } = await updateDocument(
      spacesCollectionPath,
      spaceId,
      {
        members: FieldValue.arrayUnion(user.uid),
        memberCount: FieldValue.increment(1),
      }
    );
    
    if (updateSpaceError) {
      return { success: false, error: updateSpaceError };
    }
    
    // Add space to user's spaces
    const { success: addUserSpaceSuccess, error: addUserSpaceError } = await setDocument(
      `users/${user.uid}/spaces`,
      spaceId,
      {
        id: spaceId,
        role: 'member',
        joinedAt: new Date().toISOString(),
      }
    );
    
    if (addUserSpaceError) {
      logSafely('Warning: Added user to space but failed to add space to user', addUserSpaceError);
    }
    
    return { success: true, spaceId };
  } catch (error) {
    logSafely('Error joining space', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Create an invitation to a space
 * @param {string} spaceId - ID of the space
 * @param {string} email - Email of the user to invite
 * @returns {Promise<Object>} - Result of the operation
 */
export const inviteUserToSpace = async (spaceId, email) => {
  try {
    logSafely('Inviting user to space', { spaceId, email });
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Get the collection path from environment config
    const spacesCollectionPath = config.firestorePaths.spaces;
    
    // Check if space exists and if user is owner or admin
    const { data: userSpaceData, error: userSpaceError, exists: userSpaceExists } = 
      await getDocument(`users/${user.uid}/spaces`, spaceId);
    
    if (userSpaceError) {
      return { success: false, error: userSpaceError };
    }
    
    if (!userSpaceExists) {
      return { success: false, error: 'You are not a member of this space' };
    }
    
    const userRole = userSpaceData.role;
    if (userRole !== 'owner' && userRole !== 'admin') {
      return { success: false, error: 'You do not have permission to invite users' };
    }
    
    // Create invitation
    const invitationCode = generateRandomId().substring(0, 8);
    
    const { id: invitationId, error: addInvitationError } = await addDocument(
      `${spacesCollectionPath}/${spaceId}/invitedUsers`,
      {
        email,
        invitedBy: user.uid,
        invitedByName: user.displayName || 'Anonymous',
        invitationCode,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }
    );
    
    if (addInvitationError) {
      return { success: false, error: addInvitationError };
    }
    
    // In a real app, you would also send an email here
    
    return { success: true, invitationCode };
  } catch (error) {
    logSafely('Error inviting user to space', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Add a reaction to a message in a space
 * @param {string} spaceId - ID of the space
 * @param {string} messageId - ID of the message
 * @param {string} reaction - Emoji reaction
 * @returns {Promise<Object>} - Result of the operation
 */
export const addReactionToMessage = async (spaceId, messageId, reaction) => {
  try {
    logSafely('Adding reaction to message', { spaceId, messageId, reaction });
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Get the collection path from environment config
    const spacesCollectionPath = config.firestorePaths.spaces;
    
    // Check if user is a member of the space
    const { data: userSpaceData, error: userSpaceError, exists: userSpaceExists } = 
      await getDocument(`users/${user.uid}/spaces`, spaceId);
    
    if (userSpaceError) {
      return { success: false, error: userSpaceError };
    }
    
    if (!userSpaceExists) {
      return { success: false, error: 'You are not a member of this space' };
    }
    
    // Get the message
    const { data: messageData, error: messageError, exists: messageExists } = 
      await getDocument(`${spacesCollectionPath}/${spaceId}/messages`, messageId);
    
    if (messageError) {
      return { success: false, error: messageError };
    }
    
    if (!messageExists) {
      return { success: false, error: 'Message not found' };
    }
    
    // Get current reactions or create empty object if none exist
    const reactions = messageData.reactions || {};
    
    // Add user's reaction if not already added, or remove if already exists (toggle behavior)
    let updatedReactions;
    
    if (!reactions[reaction] || !reactions[reaction].includes(user.uid)) {
      // Add the reaction
      updatedReactions = {
        reactions: {
          ...reactions,
          [reaction]: FieldValue.arrayUnion(user.uid)
        }
      };
    } else {
      // Remove the reaction
      updatedReactions = {
        reactions: {
          ...reactions,
          [reaction]: FieldValue.arrayRemove(user.uid)
        }
      };
      
      // If this will result in an empty array, we'll clean it up in a subsequent update
    }
    
    // Update the message
    const { success: updateSuccess, error: updateError } = await updateDocument(
      `${spacesCollectionPath}/${spaceId}/messages`,
      messageId,
      updatedReactions
    );
    
    if (updateError) {
      return { success: false, error: updateError };
    }
    
    // Get the updated message to return accurate reactions
    const { data: updatedMessageData } = await getDocument(
      `${spacesCollectionPath}/${spaceId}/messages`, 
      messageId
    );
    
    return { 
      success: true, 
      reactions: updatedMessageData?.reactions || reactions 
    };
  } catch (error) {
    logSafely('Error adding reaction to message', error.message);
    return { success: false, error: error.message };
  }
};
