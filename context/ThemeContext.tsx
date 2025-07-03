import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Appearance } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Define the themes
const LightTheme = {
  type: 'light',
  background: '#FFFFFF',
  text: '#000000',
  card: '#F7F7F7',
  border: 'rgba(0, 0, 0, 0.2)',
  buttonBackground: '#000000',
  buttonText: '#FFFFFF',
  homeCardColor1: '#000000',
  homeCardColor2:'#D3D3D3',
  homeCardColor3:'#808080',
  homeButtonColor1:'#FFFFFF',
  homeButtonColor2:'#505050',
  homeButtonColor3:'#000000',
  homeButtonText1: '#000000',
  homeButtonText2:'#FFFFFF',
  homeButtonText3:'#FFFFFF',
  homeCardText1: 'white',
  homeCardText2: 'white',
  inactivetint: 'rgba(0, 0, 0, 0.2)',
  logborder:'rgba(0, 0, 0, 0.2)',
};

const CatppuccinLatteLightTheme = {
  type: 'light',
  background: '#EFF1F5', // Latte Base
  text: '#4C4F69',       // Latte Text
  card: '#E6E9EF',       // Latte Surface0
  border: '#CCD0DA',     // Latte Overlay0
  buttonBackground: '#8839EF', // Latte Mauve
  buttonText: '#EFF1F5', // Latte Base for contrast
  homeCardColor1: '#E6E9EF', // Latte Surface0
  homeCardColor2:'#E6E9EF', // Latte Surface0
  homeCardColor3:'#E6E9EF', // Latte Surface0
  homeButtonColor1:'#8839EF', // Latte Mauve
  homeButtonColor2:'#8839EF', // Latte Mauve
  homeButtonColor3:'#8839EF', // Latte Mauve
  homeButtonText1: '#EFF1F5', // Latte Base
  homeButtonText2:'#EFF1F5', // Latte Base
  homeButtonText3:'#EFF1F5', // Latte Base
  homeCardText1: '#4C4F69', // Latte Text
  homeCardText2: '#4C4F69', // Latte Text
  inactivetint: '#CCD0DA', // Latte Overlay0
  logborder:'#CCD0DA'     // Latte Overlay0
};


const DarkTheme = {
  type: 'dark',
  background: '#121212',
  text: 'white',
  card: '#1E1E1E',
  border: 'rgba(125, 125, 125, 0.1)',
  buttonBackground: 'white',
  buttonText: 'black',
  homeCardColor1: '#1E1E1E',
  homeCardColor2:'#1E1E1E',
  homeCardColor3:'#1E1E1E',
  homeButtonColor1:'#FFFFFF',
  homeButtonColor2:'#FFFFFF',
  homeButtonColor3:'#FFFFFF',
  homeButtonText1: '#000000',
  homeButtonText2:'#000000',
  homeButtonText3:'#000000',
  homeCardText1: 'white',
  homeCardText2: 'white',
  inactivetint: 'rgba(245, 245, 245, 0.1)',
  logborder:'rgba(245, 245, 245, 0.1)'
};

const CatppuccinFrappeDarkTheme = {
  type: 'dark',
  background: '#303446', // Frappe Base
  text: '#C6D0F5',       // Frappe Text
  card: '#414559',       // Frappe Surface0
  border: '#626880',     // Frappe Overlay0
  buttonBackground: '#DDB6F2', // Frappe Mauve
  buttonText: '#303446', // Frappe Base for contrast
  homeCardColor1: '#414559', // Frappe Surface0
  homeCardColor2:'#414559', // Frappe Surface0
  homeCardColor3:'#414559', // Frappe Surface0
  homeButtonColor1:'#DDB6F2', // Frappe Mauve
  homeButtonColor2:'#DDB6F2', // Frappe Mauve
  homeButtonColor3:'#DDB6F2', // Frappe Mauve
  homeButtonText1: '#303446', // Frappe Base
  homeButtonText2:'#303446', // Frappe Base
  homeButtonText3:'#303446', // Frappe Base
  homeCardText1: '#C6D0F5', // Frappe Text
  homeCardText2: '#C6D0F5', // Frappe Text
  inactivetint: '#626880', // Frappe Overlay0
  logborder:'#626880'     // Frappe Overlay0
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
        if (storedTheme === 'dark') {
          setTheme(DarkTheme);
        } else if (storedTheme === 'catppuccin-latte') {
          setTheme(CatppuccinLatteLightTheme);
        } else if (storedTheme === 'catppuccin-frappe') {
          setTheme(CatppuccinFrappeDarkTheme);
        } else {
          setTheme(LightTheme);
        }
      } catch {
        const colorScheme = Appearance.getColorScheme();
        setTheme(colorScheme === 'dark' ? DarkTheme : LightTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
   const newTheme =
      theme === LightTheme
        ? DarkTheme
        : theme === DarkTheme
        ? CatppuccinLatteLightTheme
        : theme === CatppuccinLatteLightTheme
        ? CatppuccinFrappeDarkTheme
        : LightTheme; // Default back to LightTheme if none of the above

    const newThemeTypeString =
      theme === LightTheme
        ? 'dark'
        : theme === DarkTheme
        ? 'catppuccin-latte'
        : theme === CatppuccinLatteLightTheme
        ? 'catppuccin-frappe'
        : 'light'; // Default back to 'light'
        
    setTheme(newTheme);
    await FileSystem.writeAsStringAsync(themeFilePath, newThemeTypeString);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
