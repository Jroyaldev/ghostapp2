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
    
    // Check if user is already signed in
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('User already signed in:', { 
        uid: currentUser.uid, 
        email: currentUser.email || 'No email available' 
      });
      
      // Display additional user info
      if (!currentUser.email) {
        console.log('Note: This appears to be an anonymous auth session or missing email');
      }
      
      return true;
    }
    
    // If not signed in, try to sign in
    console.log('Attempting to sign in...');
    const signInResult = await signIn(email, password);
    
    if (signInResult.error) {
      // If sign in fails, try to create the user
      if (signInResult.error.includes('user-not-found')) {
        console.log('User not found, creating test user...');
        const signUpResult = await signUp(email, password, displayName);
        
        if (signUpResult.error) {
          console.error('Sign up failed:', signUpResult.error);
          return false;
        }
      } else {
        console.error('Sign in failed:', signInResult.error);
        return false;
      }
    }
    
    // Verify user is now signed in
    const userAfterAuth = auth.currentUser;
    if (!userAfterAuth) {
      console.error('Authentication completed but no user is signed in');
      return false;
    }
    
    console.log('Current user after auth:', { 
      uid: userAfterAuth.uid, 
      email: userAfterAuth.email || 'No email available'
    });
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
    // Ensure user is logged in before testing Firestore
    if (!auth.currentUser) {
      console.error('Cannot test Firestore: No user is signed in');
      return false;
    }
    
    // Use a public test collection that doesn't require specific permissions
    // This is more reliable during development than using user-specific collections
    const testCollection = firestore.collection('public_test');
    
    console.log('Adding test document to public_test collection...');
    const testData = {
      message: 'Hello from GhostMode!',
      timestamp: firestore.FieldValue.serverTimestamp(),
      // Don't include user ID in test data for public collection
      testId: `test_${Date.now()}`
    };
    
    const docRef = await testCollection.add(testData);
    console.log('Added document with ID:', docRef.id);
    
    // Read the test document
    const docSnapshot = await testCollection.doc(docRef.id).get();
    if (!docSnapshot.exists) {
      console.error('Document was created but could not be retrieved');
      return false;
    }
    
    console.log('Retrieved document data:', docSnapshot.data());
    console.log('Firestore test completed successfully!');
    return true;
  } catch (error) {
    console.error('Firestore test error:', error);
    
    // If we get a permission error, suggest to check Firestore rules
    if (error.message && error.message.includes('permission')) {
      console.log('This appears to be a Firestore security rules issue.');
      console.log('For development purposes, you may want to update your Firestore security rules to:');
      console.log(`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /public_test/{document=**} {\n      allow read, write;\n    }\n  }\n}`); 
    }
    
    return false;
  }
};
