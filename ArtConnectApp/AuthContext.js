import React, { createContext, useState } from 'react';

// Create a context for authentication
export const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userType, setUserType] = useState(null);

  const login = (id, type) => {
    setIsLoggedIn(true);
    setUserId(id);
    setUserType(type);
    console.log(`User logged in: ${id}, Type: ${type}`);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};