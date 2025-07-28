import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, AuthResponse } from '../api/auth';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User| null;
  token: string | null;
  login: (email: string, password:string) => Promise<void>;
  register: (username:string, email: string, password:string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an authProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          setToken(storedToken);
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            setUser({
              id: payload.userId,
              username: payload.username,
              email: payload.email || ''
            });
          } catch (decodeError) {
            console.log('Error decoding token:', decodeError);
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.log('Error initializing auth:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authAPI.login({ email, password });
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('token', response.token);
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response: AuthResponse = await authAPI.register({ username, email, password });
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('token', response.token);
    } catch (error) {
      console.log('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 