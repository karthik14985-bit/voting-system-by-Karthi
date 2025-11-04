import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import type { User } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, passwordHash: string) => Promise<void>;
  // Fix: Add adminLogin to the context type to fix error in AdminLogin component.
  adminLogin: (email: string, passwordHash: string) => Promise<void>;
  logout: () => void;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs on initial load to check for a persisted session
    const validateSession = () => {
        setIsLoading(true);
        const savedToken = sessionStorage.getItem('authToken');
        const savedUser = sessionStorage.getItem('user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    };
    validateSession();
  }, []);

  const login = async (email: string, passwordHash: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call to Flask backend: POST /api/voter/login
    await new Promise(res => setTimeout(res, 1000));

    // The backend would query the database. We simulate that by checking localStorage.
    const users: (User & { passwordHash: string })[] = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.email === email && u.passwordHash === passwordHash);

    if (foundUser) {
      const { passwordHash, ...userToStore } = foundUser;
      const fakeToken = `fake-voter-jwt.${btoa(JSON.stringify({ sub: foundUser.id, role: 'voter' }))}`;
      
      setUser(userToStore);
      setToken(fakeToken);

      sessionStorage.setItem('authToken', fakeToken);
      sessionStorage.setItem('user', JSON.stringify(userToStore));
    } else {
      setIsLoading(false);
      throw new Error("Invalid email or password.");
    }
    setIsLoading(false);
  };

  // Fix: Implement adminLogin function to handle admin authentication.
  const adminLogin = async (email: string, passwordHash: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 500));

    if (email === ADMIN_CREDENTIALS.email && passwordHash === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
            id: 'admin001',
            fullName: 'Administrator',
            email: email,
            votedCandidateId: null
        };
        const fakeToken = `fake-admin-jwt.${btoa(JSON.stringify({ sub: adminUser.id, role: 'admin' }))}`;

        setUser(adminUser);
        setToken(fakeToken);

        sessionStorage.setItem('authToken', fakeToken);
        sessionStorage.setItem('user', JSON.stringify(adminUser));
    } else {
        setIsLoading(false);
        throw new Error("Invalid admin credentials.");
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, adminLogin, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
