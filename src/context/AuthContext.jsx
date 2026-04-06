import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for persisted user on app load
    const persistedUser = localStorage.getItem('currentUser');
    if (persistedUser) {
      try {
        const userData = JSON.parse(persistedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing persisted user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (rolePath, aadhaar, password) => {
    try {
      const response = await fetch(`http://localhost:8080/api/${rolePath}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.message) throw new Error(data.message);
        if (data.error) throw new Error(data.error);
        if (Object.keys(data).length > 0) throw new Error(Object.values(data).join(' | '));
        throw new Error('Login failed on server');
      }

      const userData = {
        id: data.id,
        name: data.name,
        aadhaar: data.aadhaar,
        roles: data.roles,
        role: data.roles && data.roles.length > 0 ? data.roles[0] : 'CITIZEN',
        token: data.token,
        authenticated: true
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('token', data.token);

      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (rolePath, registrationData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/${rolePath}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.message) throw new Error(data.message);
        if (data.error) throw new Error(data.error);
        if (Object.keys(data).length > 0) throw new Error(Object.values(data).join(' | '));
        throw new Error('Registration failed on server');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
