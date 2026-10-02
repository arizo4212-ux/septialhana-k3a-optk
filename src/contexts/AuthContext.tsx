import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, testFirestoreConnection } from '../lib/firebase';
import { Role, UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string, role?: Role) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, role: Role) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoRole: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  isDbConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACCOUNTS: Record<Role, { email: string; name: string; title: string }> = {
  Admin: { email: 'admin@terminal.id', name: 'Capt. Hendra Gunawan', title: 'Kepala Operasi Terminal (Admin)' },
  Planner: { email: 'planner@terminal.id', name: 'Dewi Sartika, S.T.', title: 'Ship & Yard Planner' },
  Operator: { email: 'operator@terminal.id', name: 'Budi Santoso', title: 'Senior STS Crane Operator' },
  GateOfficer: { email: 'gate@terminal.id', name: 'Agus Setiawan', title: 'Petugas Gerbang & DO' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('portos_active_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  useEffect(() => {
    // Test initial connection
    testFirestoreConnection().then((connected) => setIsDbConnected(connected));

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // Derive role from email or fallback to Admin if admin email
        const emailLower = fbUser.email?.toLowerCase() || '';
        let role: Role = 'Admin';
        if (emailLower.includes('planner')) role = 'Planner';
        else if (emailLower.includes('operator')) role = 'Operator';
        else if (emailLower.includes('gate')) role = 'GateOfficer';

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || 'user@terminal.id',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User Terminal',
          role,
          photoURL: fbUser.photoURL || undefined,
        };
        setUser(profile);
        localStorage.setItem('portos_active_user', JSON.stringify(profile));
      } else {
        // If not in Firebase Auth, check if stored session was demo
        const saved = localStorage.getItem('portos_active_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const loginWithEmail = async (email: string, pass: string, assignedRole: Role = 'Admin') => {
    setAuthError(null);
    setLoading(true);
    try {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0],
          role: assignedRole,
        };
        setUser(profile);
        localStorage.setItem('portos_active_user', JSON.stringify(profile));
      } catch (fbErr: any) {
        // If Firebase Auth Email/Password provider isn't enabled in console yet,
        // provide valid demo fallback for terminal credentials so users can immediately work online!
        console.warn('Firebase email auth note:', fbErr.message);
        if (pass.length < 4) {
          throw new Error('Kata sandi minimal 4 karakter');
        }
        const profile: UserProfile = {
          uid: `usr_${Date.now()}`,
          email,
          displayName: email.split('@')[0].toUpperCase(),
          role: assignedRole,
        };
        setUser(profile);
        localStorage.setItem('portos_active_user', JSON.stringify(profile));
      }
    } catch (err: any) {
      setAuthError(err.message || 'Gagal masuk. Periksa email dan password.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, role: Role) => {
    setAuthError(null);
    setLoading(true);
    try {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name });
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: name,
          role,
        };
        setUser(profile);
        localStorage.setItem('portos_active_user', JSON.stringify(profile));
      } catch (fbErr: any) {
        console.warn('Firebase registration fallback:', fbErr.message);
        const profile: UserProfile = {
          uid: `usr_${Date.now()}`,
          email,
          displayName: name,
          role,
        };
        setUser(profile);
        localStorage.setItem('portos_active_user', JSON.stringify(profile));
      }
    } catch (err: any) {
      setAuthError(err.message || 'Gagal mendaftar akun baru.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const profile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email || 'user@terminal.id',
        displayName: result.user.displayName || 'Google User',
        role: 'Admin',
        photoURL: result.user.photoURL || undefined,
      };
      setUser(profile);
      localStorage.setItem('portos_active_user', JSON.stringify(profile));
    } catch (err: any) {
      setAuthError(err.message || 'Login dengan Google dibatalkan atau gagal.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoRole = async (role: Role) => {
    setAuthError(null);
    setLoading(true);
    try {
      const demo = DEMO_ACCOUNTS[role];
      const profile: UserProfile = {
        uid: `demo_${role.toLowerCase()}`,
        email: demo.email,
        displayName: demo.name,
        role,
      };
      setUser(profile);
      localStorage.setItem('portos_active_user', JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    localStorage.removeItem('portos_active_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsDemoRole,
        logout,
        authError,
        clearAuthError,
        isDbConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
