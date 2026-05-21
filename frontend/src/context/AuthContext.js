import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("aquafine_token");
        const savedUser = await AsyncStorage.getItem("aquafine_user");
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const saveSession = async (data) => {
    setToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem("aquafine_token", data.token);
    await AsyncStorage.setItem("aquafine_user", JSON.stringify(data.user));
  };

  const login = async (payload) => {
    const data = await authService.login(payload);
    await saveSession(data);
  };

  const signup = async (payload) => {
    const data = await authService.register(payload);
    if (data.token && data.user) {
      await saveSession(data);
    }
    return data;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(["aquafine_token", "aquafine_user"]);
  };

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: !!token, login, signup, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
