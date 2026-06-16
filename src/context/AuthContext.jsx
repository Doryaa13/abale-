import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { pushToCloud, pullFromCloud, applyCloudData, upsertProfile } from '../services/syncService';

/**
 * Single source of truth for "who is logged in", backed by Firebase Auth.
 * Public shape: { user, isLoggedIn, loading, login, register, loginWithGoogle, logout }.
 */

const AuthContext = createContext(null);

const normalize = (fbUser) =>
  fbUser
    ? { uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName || localStorage.getItem('abale_user_name') || '' }
    : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep React in sync with Firebase's persisted session.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(normalize(fbUser));
      setLoading(false);
    });
    return unsub;
  }, []);

  // When logged in, back up the local blob whenever the app is hidden/closed.
  useEffect(() => {
    if (!user) return;
    const flush = () => { pushToCloud(user.uid).catch(() => {}); };
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, [user]);

  // First sign-in handling: write the profile, then reconcile data.
  // - existing cloud data  → cloud wins: apply it locally and reload.
  // - no cloud data yet    → push the local (guest) data up.
  const handleSignIn = async (fbUser, { marketingConsent } = {}) => {
    const u = normalize(fbUser);
    try {
      await upsertProfile(u.uid, { email: u.email, name: u.name, marketingConsent });
      const cloud = await pullFromCloud(u.uid);
      if (cloud) {
        applyCloudData(cloud);
        window.location.reload();
      } else {
        await pushToCloud(u.uid);
      }
    } catch (e) {
      console.warn('Sync on sign-in failed', e);
    }
    return u;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    return handleSignIn(cred.user);
  };

  const register = async (email, password, marketingConsent) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Fire off a verification link so we can confirm the email is real/active.
    // Non-blocking: a failure here must not break a successful registration.
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Failed to send verification email', e);
    }
    return handleSignIn(cred.user, { marketingConsent });
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return handleSignIn(cred.user);
  };

  const logout = async () => {
    // Back up the latest local state to the cloud BEFORE clearing it, so nothing
    // is lost — it's restored on the next sign-in.
    try {
      if (user) await pushToCloud(user.uid);
    } catch (e) {
      console.warn('Backup before logout failed', e);
    }
    await signOut(auth);
    // Clear local data (safe — it's in the cloud) and return to the welcome screen.
    localStorage.clear();
    window.location.href = '/';
  };

  const value = { user, isLoggedIn: !!user, loading, login, register, loginWithGoogle, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
