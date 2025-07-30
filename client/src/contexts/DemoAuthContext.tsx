import React, { createContext, useContext, useState } from 'react';

interface DemoAuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: () => void;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user] = useState({
    id: 'demo-user',
    email: 'demo@toit.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'super_admin'
  });

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <DemoAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within DemoAuthProvider');
  }
  return context;
}