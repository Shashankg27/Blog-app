import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from '../utils/axios';

export interface User {
  _id: string;
  username: string;
}

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (newToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Check for token on initial load and set auth state
  useEffect(() => {
    const checkAuthState = async (): Promise<void> => {
      if (token) {
        try {
          const res = await axios.get<User>('/api/auth/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Token verification failed', err);
          localStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuthState();
  }, [token]); // Re-run when token changes

  // Set token in local storage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (newToken: string): Promise<void> => {
    setToken(newToken);
    try {
      const res = await axios.get<User>('/api/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to fetch user data after login', err);
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = (): void => {
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated, loading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

