import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { findUserByUsername, getAdminProfile, getUsers, updateUser as updateUserData, getSystemSettings } from '../data';

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
                    const settings = await getSystemSettings();
                    let exists = allUsers.find(u => u.id === storedUser.id);
                    if (exists && exists.isApproved) {
                        // Enforce exactly 2 days from now if they currently have more (One-time reset for current users)
                        const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
                        if (settings.subscriptionsEnabled && exists.plan !== 'developer' && exists.role === 'student' && (!exists.subscription_expiry || new Date(exists.subscription_expiry) > twoDaysFromNow)) {
                            const newExpiry = twoDaysFromNow.toISOString();
                            await updateUserData(exists.id, { subscription_expiry: newExpiry });
                            exists.subscription_expiry = newExpiry;
                        }
                        setUser(exists);
                        localStorage.setItem('classNestUser', JSON.stringify(exists));
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
    
    console.log(`Attempting login for: ${normalizedIdentifier}`);

    // Admin check (Username)
    if (normalizedIdentifier === adminProfile.username && pass === adminProfile.password) {
        console.log("Matched admin credentials");
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

    // Student, Teacher & School Admin check (Username)
    try {
        const existingUser = await findUserByUsername(normalizedIdentifier);
        
        if (!existingUser) {
            console.log("User not found in DB");
            throw new Error('Invalid credentials. Please check your username and password.');
        }

        console.log("User found:", existingUser.username, "Role:", existingUser.role);

        if ((existingUser.role === 'student' || existingUser.role === 'teacher' || existingUser.role === 'admin') && existingUser.password === pass) {
            if (!existingUser.isApproved) {
                 console.log("User not approved");
                 throw new Error("Your account is pending approval by the admin. Please wait for approval and try again later.");
            }
            
            // Enforce exactly 2 days from now if they currently have more (One-time reset for current users)
            const settings = await getSystemSettings();
            const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
            if (settings.subscriptionsEnabled && existingUser.plan !== 'developer' && existingUser.role === 'student' && (!existingUser.subscription_expiry || new Date(existingUser.subscription_expiry) > twoDaysFromNow)) {
                const newExpiry = twoDaysFromNow.toISOString();
                await updateUserData(existingUser.id, { subscription_expiry: newExpiry });
                existingUser.subscription_expiry = newExpiry;
            }

            console.log("Login successful");
            localStorage.setItem('classNestUser', JSON.stringify(existingUser));
            setUser(existingUser);
            return existingUser;
        } else {
            console.log("Password mismatch or role issue. Input pass length:", pass.length, "DB pass length:", existingUser.password?.length);
        }
    } catch (e) {
        console.error("Login lookup error:", e);
        throw e;
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