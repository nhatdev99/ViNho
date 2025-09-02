import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme, defaultTheme, colorPalettes, type ColorPalette } from './colors';

type ThemeContextType = {
  theme: ReturnType<typeof createTheme>;
  colorScheme: 'light' | 'dark';
  colorPalette: ColorPalette;
  toggleColorScheme: () => void;
  setColorPalette: (palette: ColorPalette) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() || 'light';
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemColorScheme);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>('blue');

  // Load saved theme preferences
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const [savedScheme, savedPalette] = await Promise.all([
          AsyncStorage.getItem('colorScheme'),
          AsyncStorage.getItem('colorPalette'),
        ]);

        if (savedScheme === 'light' || savedScheme === 'dark') {
          setColorScheme(savedScheme);
        }

        if (savedPalette && Object.keys(colorPalettes).includes(savedPalette)) {
          setCurrentPalette(savedPalette as ColorPalette);
        }
      } catch (error) {
        console.error('Failed to load theme preferences', error);
      } finally {
        setIsReady(true);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preferences when they change
  useEffect(() => {
    if (!isReady) return;
    
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.multiSet([
          ['colorScheme', colorScheme],
          ['colorPalette', currentPalette],
        ]);
      } catch (error) {
        console.error('Failed to save theme preferences', error);
      }
    };

    saveThemePreference();
  }, [colorScheme, currentPalette, isReady]);

  const toggleColorScheme = useCallback(() => {
    setColorScheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setColorPalette = useCallback((palette: ColorPalette) => {
    setCurrentPalette(palette);
  }, []);

  const theme = useMemo(() => {
    return createTheme(currentPalette, colorScheme);
  }, [currentPalette, colorScheme]);

  const contextValue = useMemo(() => ({
    theme,
    colorScheme,
    colorPalette: currentPalette,
    toggleColorScheme,
    setColorPalette,
  }), [theme, colorScheme, currentPalette, toggleColorScheme, setColorPalette]);

  if (!isReady) {
    // Return a default theme while loading
    const defaultValue: ThemeContextType = {
      theme: defaultTheme,
      colorScheme: 'light',
      colorPalette: 'blue',
      toggleColorScheme: () => {},
      setColorPalette: () => {},
    };

    return (
      <ThemeContext.Provider value={defaultValue}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
