import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Appearance } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Define the themes
const LightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  card: '#F7F7F7',
  border: 'rgba(0, 0, 0, 0.2)',
  buttonBackground: '#000000',
  buttonText: '#FFFFFF',
};

const DarkTheme = {
  background: '#121212',
  text: '#E0E0E0',
  card: '#1E1E1E',
  border: 'rgba(255, 255, 255, 0.2)',
  buttonBackground: '#505050',
  buttonText: '#FFFFFF',
};

// Context for theme management
const ThemeContext = createContext({
  theme: LightTheme, // Default theme
  toggleTheme: () => {}, // Default placeholder function
});

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState(LightTheme);

  const themeFilePath = `${FileSystem.documentDirectory}theme.json`;

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await FileSystem.readAsStringAsync(themeFilePath);
        setTheme(storedTheme === 'dark' ? DarkTheme : LightTheme);
      } catch {
        const colorScheme = Appearance.getColorScheme();
        setTheme(colorScheme === 'dark' ? DarkTheme : LightTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === LightTheme ? DarkTheme : LightTheme;
    setTheme(newTheme);
    await FileSystem.writeAsStringAsync(themeFilePath, theme === LightTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
