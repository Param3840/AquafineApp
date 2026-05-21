import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and verify session on load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("aquafine_admin_token");
      const savedUser = localStorage.getItem("aquafine_admin_user");

      if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);

          // Skip /me verification for static admin account
          if (parsed.id !== "admin") {
            const response = await authAPI.getMe();
            if (response.user) {
              setUser(response.user);
              localStorage.setItem("aquafine_admin_user", JSON.stringify(response.user));
            }
          }
        } catch (err) {
          console.error("Session verification failed, logging out:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authAPI.login(email, password);
      if (data.token && data.user) {
        localStorage.setItem("aquafine_admin_token", data.token);
        localStorage.setItem("aquafine_admin_user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("aquafine_admin_token");
    localStorage.removeItem("aquafine_admin_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
