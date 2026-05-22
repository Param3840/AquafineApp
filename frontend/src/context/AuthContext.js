import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forceLoggedOut, setForceLoggedOut] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("aquafine_token");
        const savedUser = await AsyncStorage.getItem("aquafine_user");
        if (savedToken && savedUser) {
          try {
            console.log("[AUTH] Validating session on startup...");
            const validation = await authService.validateSession(savedToken);
            if (validation && validation.valid) {
              console.log("[AUTH] Session is valid.");
              setToken(savedToken);
              setUser(JSON.parse(savedUser));
            } else {
              console.log("[AUTH] Session invalid (User deleted/not found). Purging local session data...");
              await AsyncStorage.multiRemove([
                "aquafine_token",
                "aquafine_user",
                "aquafine_cart",
                "aquafine_wishlist"
              ]);
              setForceLoggedOut(true);
            }
          } catch (err) {
            const errMsg = err.message || "";
            if (errMsg.includes("session") || errMsg.includes("Unauthorized") || errMsg.includes("401") || errMsg.includes("not found")) {
              console.log("[AUTH] Session validation authentication error. Purging local data:", errMsg);
              await AsyncStorage.multiRemove([
                "aquafine_token",
                "aquafine_user",
                "aquafine_cart",
                "aquafine_wishlist"
              ]);
              setForceLoggedOut(true);
            } else {
              console.log("[AUTH] Server/Network issue during startup validation. Preserving offline session.");
              setToken(savedToken);
              setUser(JSON.parse(savedUser));
            }
          }
        }
      } catch (err) {
        console.error("[AUTH] Error restoring session:", err);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const saveSession = async (data) => {
    setForceLoggedOut(false);
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
    // Clear any stale session first
    setToken(null);
    setUser(null);
    setForceLoggedOut(false);
    await AsyncStorage.multiRemove(["aquafine_token", "aquafine_user"]);

    const data = await authService.register(payload);
    return data;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setForceLoggedOut(false);
    await AsyncStorage.multiRemove(["aquafine_token", "aquafine_user"]);
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem("aquafine_user", JSON.stringify(updatedUser));
  };

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: !!token, forceLoggedOut, login, signup, logout, updateUser, setForceLoggedOut }),
    [user, token, loading, forceLoggedOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
