import React, { createContext, useContext, useState, ReactNode } from 'react';

type SettingsContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
  weightFormat: string;
  setWeightFormat: (format: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<string>('English');
  const [dateFormat, setDateFormat] = useState<string>('dd-mm-yyyy');
  const [weightFormat, setWeightFormat] = useState<string>('kg');

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        dateFormat,
        setDateFormat,
        weightFormat,
        setWeightFormat,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
