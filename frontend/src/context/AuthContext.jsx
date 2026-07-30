import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedUser = localStorage.getItem('tvds_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          
          // Send request to verify token validity
          const response = await fetch('http://localhost:5000/api/users/verify', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${parsed.token}`
            }
          });

          if (response.ok) {
            if (parsed.fullName && !parsed.name) parsed.name = parsed.fullName;
            setUser(parsed);
          } else {
            // Token invalid or expired
            localStorage.removeItem('tvds_user');
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('tvds_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = (userData) => {
    // Normalize 'fullName' to 'name' for backward compatibility
    const normalizedData = { 
      ...userData, 
      name: userData.fullName || userData.name 
    };
    setUser(normalizedData);
    localStorage.setItem('tvds_user', JSON.stringify(normalizedData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tvds_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
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
