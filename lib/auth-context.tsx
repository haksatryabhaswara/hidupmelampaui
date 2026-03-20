"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "general" | "admin";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  /** Whether the global auth modal is currently open */
  authModalOpen: boolean;
  /** Optional URL to redirect to after successful login */
  authModalRedirect: string | null;
  openAuthModal: (redirect?: string) => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUserRole(uid: string): Promise<UserRole> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) return (snap.data().role as UserRole) ?? "general";
  } catch {
    // Firestore unavailable during build or first load — default to general
  }
  return "general";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRedirect, setAuthModalRedirect] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const r = await fetchUserRole(currentUser.uid);
        setRole(r);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const openAuthModal = useCallback((redirect?: string) => {
    setAuthModalRedirect(redirect ?? null);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalRedirect(null);
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName: displayName ?? "",
        role: "general" as UserRole,
        createdAt: new Date().toISOString(),
      });
    } catch { /* rules not yet set — role defaults to general */ }
    setRole("general");
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userRef = doc(db, "users", cred.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      try {
        await setDoc(userRef, {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName ?? "",
          role: "general" as UserRole,
          createdAt: new Date().toISOString(),
        });
      } catch { /* rules not yet set — role defaults to general */ }
      setRole("general");
    } else {
      setRole((snap.data().role as UserRole) ?? "general");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setRole(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user, role, loading,
        authModalOpen, authModalRedirect,
        openAuthModal, closeAuthModal,
        loginWithEmail, registerWithEmail, loginWithGoogle, logout, resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
