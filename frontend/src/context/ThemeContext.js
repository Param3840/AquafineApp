import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("aquafine_theme_mode");
        if (saved !== null) {
          setIsDarkMode(saved === "dark");
        }
      } catch (e) {
        console.log("Failed to load theme mode", e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newVal = !isDarkMode;
      setIsDarkMode(newVal);
      await AsyncStorage.setItem("aquafine_theme_mode", newVal ? "dark" : "light");
    } catch (e) {
      console.log("Failed to save theme mode", e);
    }
  };

  const activeColors = isDarkMode
    ? {
        teal: "#14b8a6", // vibrant teal in dark mode for contrast
        tealDark: "#0f766e",
        gold: "#fbbf24", // brighter gold for dark mode
        slate: "#f8fafc", // bright text for dark mode
        muted: "#94a3b8", // softer muted color
        border: "#1f2937", // dark border
        bg: "#0b1315", // ultra-premium dark slate background
        white: "#121e21", // deep dark card background
        red: "#ef4444",
      }
    : {
        teal: "#0f766e",
        tealDark: "#083d4a",
        gold: "#c89b2c",
        slate: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        bg: "#f4f7f8",
        white: "#ffffff",
        red: "#dc2626",
      };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors: activeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
