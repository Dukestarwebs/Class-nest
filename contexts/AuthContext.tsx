
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { findUserByUsername, getAdminProfile, getUsers } from '../data';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        try {
            const storedUserStr = localStorage.getItem('classNestUser');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                
                if (storedUser.role === 'admin') {
                    // Ensure we have latest admin details
                    const adminProfile = getAdminProfile();
                    const updatedAdmin: User = {
                        ...storedUser,
                        name: adminProfile.name,
                        username: adminProfile.username,
                        email: adminProfile.email,
                        isApproved: true
                    };
                    setUser(updatedAdmin);
                } else {
                    // Verify user still exists in database and is approved
                    const allUsers = await getUsers();
                    const exists = allUsers.find(u => u.id === storedUser.id);
                    if (exists && exists.isApproved) {
                        setUser(exists);
                    } else {
                        // User deleted or unapproved
                        localStorage.removeItem('classNestUser');
                        setUser(null);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to restore session", error);
            localStorage.removeItem('classNestUser');
        } finally {
            setLoading(false);
        }
    };
    initAuth();
  }, []);

  const login = async (identifier: string, pass: string): Promise<User | null> => {
    const normalizedIdentifier = identifier.trim();
    const adminProfile = getAdminProfile();
    
    // Admin check (Username)
    if (normalizedIdentifier === adminProfile.username && pass === adminProfile.password) {
        const adminUser: User = {
            id: 'admin-user',
            name: adminProfile.name,
            username: adminProfile.username,
            email: adminProfile.email,
            role: 'admin',
            isApproved: true
        };
        localStorage.setItem('classNestUser', JSON.stringify(adminUser));
        setUser(adminUser);
        return adminUser;
    }

    // Student check (Username)
    const existingUser = await findUserByUsername(normalizedIdentifier);
    
    if (existingUser && existingUser.role === 'student' && existingUser.password === pass) {
        if (!existingUser.isApproved) {
             throw new Error("Your account is pending approval by the admin. Please wait for approval and try again later.");
        }
        localStorage.setItem('classNestUser', JSON.stringify(existingUser));
        setUser(existingUser);
        return existingUser;
    }

    throw new Error('Invalid credentials. Please check your username and password.');
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('classNestUser');
  };
  
  const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('classNestUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
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
