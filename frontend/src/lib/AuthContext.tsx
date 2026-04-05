// =============================================================================
// Auth Context — JWT Authentication State Management
// =============================================================================
// Provides a React context that stores the authentication state (token, role,
// user_id, student_id) in localStorage. Wraps the entire application.
// =============================================================================

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Type for user data stored in context
interface AuthUser {
  token: string;
  role: 'student' | 'admin';
  user_id: number;
  student_id: number | null;
  email: string;
}

// Context type
interface AuthContextType {
  user: AuthUser | null;
  login: (data: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider wraps the app and manages authentication state.
 * On mount, it reads stored data from localStorage.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, check localStorage for existing session
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as 'student' | 'admin' | null;
    const user_id = localStorage.getItem('user_id');
    const student_id = localStorage.getItem('student_id');
    const email = localStorage.getItem('email');

    if (token && role && user_id) {
      setUser({
        token,
        role,
        user_id: parseInt(user_id),
        student_id: student_id ? parseInt(student_id) : null,
        email: email || '',
      });
    }
    setIsLoading(false);
  }, []);

  /**
   * Save login data to state and localStorage
   */
  const login = (data: AuthUser) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user_id', String(data.user_id));
    localStorage.setItem('email', data.email);
    if (data.student_id) {
      localStorage.setItem('student_id', String(data.student_id));
    }
    setUser(data);
  };

  /**
   * Clear session data and redirect to login
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('student_id');
    localStorage.removeItem('email');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
