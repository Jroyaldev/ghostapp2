/**
 * Authentication Context Provider for GhostMode
 * Simplified to avoid circular dependencies and stack overflows
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { Alert } from 'react-native';
// Import directly from firebase-core to avoid circular dependencies
import { auth, firestore } from '../services/firebase-core';
import { firebaseConfig } from '../services/firebaseConfig';
import { PhoneAuthProvider, signInWithCredential, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Create a context with a default value
const AuthContext = createContext(null);

// Custom hook for accessing the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Safe logging utility - NEVER logs objects directly
const log = (message) => {
  console.log(`[Auth] ${message}`);
};

/**
 * Format phone number to E.164 standard required by Firebase
 * E.164 format: +[country code][phone number]
 * For US numbers: +1XXXXXXXXXX (no spaces or dashes)
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');
  
  // For US numbers, add the country code if missing
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  } else if (phoneNumber.startsWith('+')) {
    // Already in E.164 format, return as is
    return phoneNumber;
  }
  
  // If none of the above, assume it's already properly formatted or incomplete
  throw new Error('Invalid phone number format. Please enter a 10-digit US number');
};

// The AuthProvider component
export const AuthProvider = React.memo(({ children }) => {
  // Ref to track mounted state for cleanup
  const isMounted = useRef(true);
  const recaptchaVerifier = useRef(null);
  
  // State - kept minimal and flat
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationId, setVerificationId] = useState(null);
  // Track phone verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationPhoneNumber, setVerificationPhoneNumber] = useState('');

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe setState functions that won't update if unmounted
  const safeSetUser = (data) => {
    if (isMounted.current) setUser(data);
  };

  const safeSetProfile = (data) => {
    if (isMounted.current) setProfile(data);
  };

  const safeSetLoading = (value) => {
    if (isMounted.current) setLoading(value);
  };

  const safeSetVerificationId = (id) => {
    if (isMounted.current) setVerificationId(id);
  };
  
  const safeSetPendingVerification = (isPending) => {
    if (isMounted.current) setPendingVerification(isPending);
  };

  const safeSetVerificationPhoneNumber = (phone) => {
    if (isMounted.current) setVerificationPhoneNumber(phone);
  };

  // Profile helpers
  const fetchProfile = async (uid) => {
    try {
      const docRef = doc(firestore, 'users', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        safeSetProfile(data);
        return data;
      }
      return null;
    } catch (error) {
      log(`Error fetching profile: ${error.message}`);
      return null;
    }
  };

  const createProfile = async (uid, data) => {
    try {
      const docRef = doc(firestore, 'users', uid);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      log(`Error creating profile: ${error.message}`);
      return false;
    }
  };

  // Auth methods
  const phoneSignIn = async (phoneNumber, onSuccess, onError) => {
    try {
      log(`Starting verification for ${phoneNumber}`);
      safeSetLoading(true);

      // Format phone number to E.164 standard
      const formattedPhone = formatPhoneNumber(phoneNumber);
      log(`Formatted phone number: ${formattedPhone}`);
      
      // Save the phone number being verified
      safeSetVerificationPhoneNumber(formattedPhone);

      // Check reCAPTCHA
      if (!recaptchaVerifier.current) {
        throw new Error('reCAPTCHA not initialized');
      }

      // Get verification ID
      const provider = new PhoneAuthProvider(auth);
      const verId = await provider.verifyPhoneNumber(
        formattedPhone,
        recaptchaVerifier.current
      );

      log(`Verification ID received: ${verId.substring(0, 5)}...`);
      safeSetVerificationId(verId);
      safeSetPendingVerification(true); // Set pending verification to true after sending code
      safeSetLoading(false);

      // Show confirmation that code was sent
      Alert.alert(
        'Verification Code Sent',
        `We've sent a verification code to ${formattedPhone}. Please enter it to complete sign-in.`,
        [{ text: 'OK' }]
      );

      if (onSuccess) onSuccess(verId);
      return true;
    } catch (error) {
      log(`Phone sign-in error: ${error.message}`);
      safeSetLoading(false);
      if (onError) onError(error);
      return false;
    }
  };

  const verifyCode = async (phoneNumber, code, displayName = null) => {
    try {
      // Early validation
      if (!verificationId) {
        throw new Error('Missing verification ID');
      }

      // Use the stored verification phone number if available
      const phoneToUse = verificationPhoneNumber || phoneNumber;
      log(`Verifying code for ${phoneToUse}`);
      safeSetLoading(true);

      // Create credential and sign in
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      log(`User authenticated: ${firebaseUser.uid}`);

      // Create profile if needed
      const userProfile = await fetchProfile(firebaseUser.uid);
      if (!userProfile) {
        let formattedPhone;
        try {
          formattedPhone = formatPhoneNumber(phoneToUse);
        } catch (error) {
          // If formatting fails, use the raw phone number
          formattedPhone = phoneToUse;
        }

        const newProfile = {
          displayName: displayName || 'Ghost User',
          phoneNumber: formattedPhone,
          theme: 'dark',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${phoneToUse}`
        };

        await createProfile(firebaseUser.uid, newProfile);
        safeSetProfile(newProfile);
      }

      // Reset verification state
      safeSetVerificationId(null);
      safeSetPendingVerification(false);
      safeSetVerificationPhoneNumber('');
      safeSetLoading(false);

      return true;
    } catch (error) {
      log(`Verification error: ${error.message}`);
      safeSetLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      log('Signing out');
      safeSetLoading(true);

      await auth.signOut();
      safeSetUser(null);
      safeSetProfile(null);
      safeSetVerificationId(null);
      safeSetPendingVerification(false);
      safeSetVerificationPhoneNumber('');
      safeSetLoading(false);

      return true;
    } catch (error) {
      log(`Sign out error: ${error.message}`);
      safeSetLoading(false);
      return false;
    }
  };

  // Auth state listener
  useEffect(() => {
    log('Setting up auth state listener');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted.current) return;

      if (firebaseUser) {
        log(`Auth state changed: User ${firebaseUser.uid} logged in`);
        
        // Only set the user if we're not in pending verification state
        // or if we already have a verified user (from previous session)
        if (!pendingVerification || user) {
          safeSetUser(firebaseUser);
          
          // Fetch profile if needed
          if (!profile) {
            fetchProfile(firebaseUser.uid).catch(() => {});
          }
        } else {
          // If we're in pending verification state and a new user auth happened,
          // we need to make sure the code verification completes before setting user
          log('Auth state change detected during pending verification - waiting for code verification');
        }
      } else {
        log('Auth state changed: No user logged in');
        safeSetUser(null);
        safeSetProfile(null);
      }

      safeSetLoading(false);
    });

    return () => {
      log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [profile, pendingVerification, user]);

  // Memoize the context value to prevent unnecessary renders
  const contextValue = React.useMemo(() => ({
    user,
    userProfile: profile,
    loading,
    initialized: !loading,
    pendingVerification,
    verificationPhoneNumber,
    phoneSignIn,
    verifyCode,
    signOut,
    recaptchaVerifier
  }), [user, profile, loading, pendingVerification, verificationPhoneNumber]);

  return (
    <AuthContext.Provider value={contextValue}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={false}
      />
      {children}
    </AuthContext.Provider>
  );
});

// Add a display name for debugging
AuthProvider.displayName = 'AuthProvider';
