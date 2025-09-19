import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth';
import { auth } from './firebase';

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
}

// Convert Firebase User to our AuthUser interface
const mapFirebaseUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
  };
};

// Authentication functions
export const firebaseAuth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile if displayName is provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
      
      return {
        user: mapFirebaseUser(userCredential.user),
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        error: error.message,
      };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        user: mapFirebaseUser(userCredential.user),
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        error: error.message,
      };
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        user: mapFirebaseUser(result.user),
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        error: error.message,
      };
    }
  },

  // Sign in with Facebook
  signInWithFacebook: async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return {
        user: mapFirebaseUser(result.user),
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        error: error.message,
      };
    }
  },

  // Sign in with Twitter
  signInWithTwitter: async () => {
    try {
      const result = await signInWithPopup(auth, twitterProvider);
      return {
        user: mapFirebaseUser(result.user),
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        error: error.message,
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Update user profile
  updateUserProfile: async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        return {
          user: mapFirebaseUser(auth.currentUser),
          error: null,
        };
      }
      return {
        user: null,
        error: 'No user is currently signed in',
      };
    } catch (error: any) {
      return {
        user: null,
        error: error.message,
      };
    }
  },

  // Get current user
  getCurrentUser: (): AuthUser | null => {
    return mapFirebaseUser(auth.currentUser);
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      callback(mapFirebaseUser(user));
    });
  },
};

export default firebaseAuth;
