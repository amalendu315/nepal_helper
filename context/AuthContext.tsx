"use client";

import { createContext, useState } from "react";

// Create a context for authentication
const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
});

// Create a provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
