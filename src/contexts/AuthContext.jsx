// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api'; // Make sure this path points to your api.js

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // When the app loads, check if they are already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('eventflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // --- LOGIN ---
  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      setUser(response.user);
      localStorage.setItem('eventflow_user', JSON.stringify(response.user)); 
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // --- REGISTER ---
  const register = async (name, email, password) => {
    try {
      const response = await api.register(name, email, password);
      setUser(response.user);
      localStorage.setItem('eventflow_user', JSON.stringify(response.user)); 
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventflow_user');
  };

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading EventFlow...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is the hook your other pages will use
export const useAuth = () => useContext(AuthContext);