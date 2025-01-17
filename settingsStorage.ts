import * as FileSystem from 'expo-file-system';

const SETTINGS_FILE = `${FileSystem.documentDirectory}userSettings.json`;

export const saveSettings = async (settings: object) => {
  try {
    await FileSystem.writeAsStringAsync(SETTINGS_FILE, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = async () => {
    try {
      const settings = await FileSystem.readAsStringAsync(SETTINGS_FILE);
      return JSON.parse(settings);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('E_FILE_NOT_FOUND')) {
          console.warn('No settings file found. Using default settings.');
        } else {
          console.warn('Error loading settings:', error.message);
        }
      } else {
        console.warn('Unexpected error:', error);
      }
      return { message: 'No settings file, using default settings.' }; // Default response
    }
  };
  
  
