/**
 * Test utility for Firebase
 * Use this to verify Firebase setup is working correctly
 */

import {
  auth,
  firestore,
  signUp,
  signIn,
  signOutUser,
  getUserProfile
} from '../services/firebase';

// Test function to check Firebase auth
export const testFirebaseAuth = async () => {
  console.log('Testing Firebase Auth...');
  try {
    // Test user credentials
    const email = 'test@ghostmode.com';
    const password = 'Test123!';
    const displayName = 'Test User';
    
    // 1. Create a test user
    console.log('Attempting to create test user...');
    const signUpResult = await signUp(email, password, displayName);
    console.log('Sign up result:', signUpResult);
    
    // If sign up failed due to email already in use, try to sign in
    if (signUpResult.error && signUpResult.error.includes('email address is already in use')) {
      console.log('User already exists, trying sign in...');
      const signInResult = await signIn(email, password);
      console.log('Sign in result:', signInResult);
      
      if (signInResult.error) {
        console.error('Sign in failed:', signInResult.error);
        return false;
      }
    } else if (signUpResult.error) {
      console.error('Sign up failed:', signUpResult.error);
      return false;
    }
    
    // 3. Get current user
    const currentUser = auth.currentUser;
    console.log('Current user:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : null);
    
    // 4. Get user profile from Firestore
    if (currentUser) {
      const profileResult = await getUserProfile(currentUser.uid);
      console.log('User profile:', profileResult);
    }
    
    console.log('Firebase Auth test completed successfully!');
    return true;
  } catch (error) {
    console.error('Firebase Auth test error:', error);
    return false;
  }
};

// Test function to check Firestore
export const testFirestore = async () => {
  console.log('Testing Firestore...');
  try {
    // 1. Write a test document
    const testCollection = firestore.collection('test');
    console.log('Adding test document...');
    const docRef = await testCollection.add({
      message: 'Hello from GhostMode!',
      timestamp: firestore.FieldValue.serverTimestamp()
    });
    console.log('Added document with ID:', docRef.id);
    
    // 2. Read the test document
    const docSnapshot = await testCollection.doc(docRef.id).get();
    console.log('Retrieved document:', docSnapshot.data());
    
    console.log('Firestore test completed successfully!');
    return true;
  } catch (error) {
    console.error('Firestore test error:', error);
    return false;
  }
};
