'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, firebaseAuth } from '@/lib/firebaseAuth';

interface FirebaseAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ user: AuthUser | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null; error: string | null }>;
  signInWithGoogle: () => Promise<{ user: AuthUser | null; error: string | null }>;
  signInWithFacebook: () => Promise<{ user: AuthUser | null; error: string | null }>;
  signInWithTwitter: () => Promise<{ user: AuthUser | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<{ user: AuthUser | null; error: string | null }>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    const result = await firebaseAuth.signUp(email, password, displayName);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await firebaseAuth.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const result = await firebaseAuth.signInWithGoogle();
    setLoading(false);
    return result;
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    const result = await firebaseAuth.signInWithFacebook();
    setLoading(false);
    return result;
  };

  const signInWithTwitter = async () => {
    setLoading(true);
    const result = await firebaseAuth.signInWithTwitter();
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await firebaseAuth.signOut();
    setLoading(false);
    return result;
  };

  const resetPassword = async (email: string) => {
    return await firebaseAuth.resetPassword(email);
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    setLoading(true);
    const result = await firebaseAuth.updateUserProfile(updates);
    setLoading(false);
    return result;
  };

  const value: FirebaseAuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
