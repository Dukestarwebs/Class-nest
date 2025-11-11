
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<User | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = useCallback(() => {
    try {
      const storedUser = sessionStorage.getItem('classNestUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, pass: string): Promise<User | null> => {
    // This simulates an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === ADMIN_EMAIL && pass === 'classnest123') {
          const adminUser: User = { id: 'admin-01', name: 'Teacher Sylvia', email: ADMIN_EMAIL, role: 'admin' };
          sessionStorage.setItem('classNestUser', JSON.stringify(adminUser));
          setUser(adminUser);
          resolve(adminUser);
          return;
        }

        const users: User[] = JSON.parse(localStorage.getItem('classNestUsers') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === pass);

        if (foundUser) {
          const loggedInUser = { ...foundUser };
          delete loggedInUser.password;
          sessionStorage.setItem('classNestUser', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
          resolve(loggedInUser);
        } else {
          resolve(null);
        }
      }, 500);
    });
  };

  const register = async (name: string, email: string, pass: string): Promise<User | null> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            const users: User[] = JSON.parse(localStorage.getItem('classNestUsers') || '[]');
            if (users.some(u => u.email === email) || email === ADMIN_EMAIL) {
                resolve(null); // User already exists
                return;
            }

            const newUser: User = {
                id: `user-${Date.now()}`,
                name,
                email,
                password: pass,
                role: 'student',
            };
            users.push(newUser);
            localStorage.setItem('classNestUsers', JSON.stringify(users));
            
            const loggedInUser = {...newUser};
            delete loggedInUser.password;
            sessionStorage.setItem('classNestUser', JSON.stringify(loggedInUser));
            setUser(loggedInUser);

            resolve(loggedInUser);
        }, 500);
     });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('classNestUser');
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
