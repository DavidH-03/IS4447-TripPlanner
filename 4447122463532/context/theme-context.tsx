import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightColors;
};

export const lightColors = {
  background: '#ffffff',
  card: '#2c2c2e',
  text: '#000000',
  subtext: '#666666',
  border: '#3c3c3e',
  primary: '#000000',
  danger: '#ff3b30',
  success: '#34c759',
};

export const darkColors = {
  background: '#000000',
  card: '#1c1c1e',
  text: '#ffffff',
  subtext: '#999999',
  border: '#2c2c2e',
  primary: '#ffffff',
  danger: '#ff453a',
  success: '#30d158',
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    AsyncStorage.getItem('theme').then(t => {
      if (t === 'light' || t === 'dark') setTheme(t);
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await AsyncStorage.setItem('theme', next);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: theme === 'light' ? lightColors : darkColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}