import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightColors;
};

export const lightColors = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  subtext: '#6B7280',
  border: '#E5E7EB',
  primary: '#F4845F',
  danger: '#EF4444',
  success: '#10B981',
};

export const darkColors = {
  background: '#1A1A2E',
  card: '#2D2D44',
  text: '#FAFAFA',
  subtext: '#9CA3AF',
  border: '#3D3D5C',
  primary: '#F4845F',
  danger: '#EF4444',
  success: '#10B981',
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