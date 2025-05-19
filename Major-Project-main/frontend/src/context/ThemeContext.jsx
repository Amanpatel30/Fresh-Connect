import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

const themes = {
  light: {
    primary: '#22c55e',
    background: '#ffffff',
    text: '#111827',
    secondary: '#4b5563',
    accent: '#dcfce7'
  },
  dark: {
    primary: '#22c55e',
    background: '#111827',
    text: '#ffffff',
    secondary: '#9ca3af',
    accent: '#064e3b'
  },
  purple: {
    primary: '#9333ea',
    background: '#ffffff',
    text: '#111827',
    secondary: '#4b5563',
    accent: '#f3e8ff'
  },
  forest: {
    primary: '#059669',
    background: '#ffffff',
    text: '#111827',
    secondary: '#4b5563',
    accent: '#d1fae5'
  }
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;