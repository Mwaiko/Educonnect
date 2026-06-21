// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const THEMES = {
  light: {
    primary: "#4F46E5", primaryLight: "#EEF2FF", primaryMid: "#818CF8", primaryDark: "#312E81",
    accent: "#06B6D4", accentLight: "#ECFEFF",
    success: "#10B981", successLight: "#ECFDF5",
    warning: "#F59E0B", warningLight: "#FFFBEB",
    danger: "#EF4444", dangerLight: "#FEF2F2",
    surface: "#F8FAFC", surfaceElevated: "#FFFFFF",
    border: "rgba(79,70,229,0.15)",
    text: "#1E1B4B", textSecondary: "#6B7280", white: "#FFFFFF",
    bg: "#F0F2FA",
    sidebarBg: "linear-gradient(180deg, #312E81 0%, #1e1b4b 100%)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.04)",
    hoverShadow: "0 12px 24px rgba(79,70,229,0.15), 0 4px 8px rgba(0,0,0,0.04)",
    modalOverlay: "rgba(0,0,0,0.5)",
    inputBg: "#FFFFFF",
    scrollbarThumb: "rgba(79,70,229,0.2)",
    scrollbarThumbHover: "rgba(79,70,229,0.3)",
    gradientHero: "linear-gradient(135deg, #312E81 0%, #1e1b4b 100%)",
  },
  dark: {
    primary: "#818CF8", primaryLight: "rgba(129,140,248,0.15)", primaryMid: "#A5B4FC", primaryDark: "#C7D2FE",
    accent: "#22D3EE", accentLight: "rgba(34,211,238,0.15)",
    success: "#34D399", successLight: "rgba(52,211,153,0.15)",
    warning: "#FBBF24", warningLight: "rgba(251,191,36,0.15)",
    danger: "#F87171", dangerLight: "rgba(248,113,113,0.15)",
    surface: "#1E1B4B", surfaceElevated: "#2D2A5E",
    border: "rgba(129,140,248,0.2)",
    text: "#F1F5F9", textSecondary: "#94A3B8", white: "#0F172A",
    bg: "#0B0F2A",
    sidebarBg: "linear-gradient(180deg, #0F0A3C 0%, #1a1647 100%)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.3)",
    hoverShadow: "0 12px 24px rgba(129,140,248,0.15), 0 4px 8px rgba(0,0,0,0.2)",
    modalOverlay: "rgba(0,0,0,0.7)",
    inputBg: "#1E1B4B",
    scrollbarThumb: "rgba(129,140,248,0.3)",
    scrollbarThumbHover: "rgba(129,140,248,0.5)",
    gradientHero: "linear-gradient(135deg, #1a1647 0%, #0F0A3C 100%)",
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const item = window.localStorage.getItem('educonnect-theme');
      return item ? JSON.parse(item) : 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      window.localStorage.setItem('educonnect-theme', JSON.stringify(next));
      return next;
    });
  };

  const C = THEMES[themeMode];

  return (
    <ThemeContext.Provider value={{ C, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};