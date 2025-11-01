'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip Firebase auth if not configured
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // 🔑 로그인 시 저장된 API 키 자동 로드
      if (user) {
        try {
          console.log('🔑 사용자 로그인 감지, API 키 로드 시작:', user.uid);
          await useAPIKeysStore.getState().loadKeysFromFirestore(user.uid);
          console.log('✅ API 키 로드 완료');
        } catch (error) {
          console.error('⚠️ API 키 로드 실패:', error);
          // 로드 실패해도 로그인은 유지
        }
      } else {
        // 로그아웃 시 API 키 클리어
        console.log('🔓 로그아웃 감지, API 키 클리어');
        useAPIKeysStore.getState().clearKeys();
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      console.error('Firebase not configured');
      throw new Error('Firebase authentication is not configured');
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      console.error('Firebase not configured');
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}