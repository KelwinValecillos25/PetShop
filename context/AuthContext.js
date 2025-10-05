import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Comprobar si hay un usuario logueado al iniciar la app
    const checkUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('loggedInUser');
        if (userString) {
          setUser(JSON.parse(userString));
        }
      } catch (e) {
        console.error("Error al cargar el usuario:", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('loggedInUser', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('loggedInUser');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
