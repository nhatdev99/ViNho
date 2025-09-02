import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';
type ColorPalette = 'blue' | 'green' | 'purple';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  // Thêm các màu khác nếu cần
}

interface Theme {
  colors: ThemeColors;
  mode: ThemeMode;
  colorPalette: ColorPalette;
  setColorScheme: (mode: ThemeMode) => void;
  setColorPalette: (palette: ColorPalette) => void;
}

const lightColors = {
  primary: '#007AFF', // Màu chủ đạo
  background: '#F8F9FA', // Màu nền
  card: '#FFFFFF', // Màu thẻ
  text: '#000000', // Màu chữ chính
  textSecondary: '#6C757D', // Màu chữ phụ
  border: '#E9ECEF', // Màu viền
};

const darkColors = {
  primary: '#0A84FF',
  background: '#1A1A1A',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
};

// Tạo context
const ThemeContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
  initialPalette?: ColorPalette;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'system',
  initialPalette = 'blue',
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialTheme);
  const [colorPalette, setColorPalette] = useState<ColorPalette>(initialPalette);

  // Xác định theme hiện tại dựa trên chế độ đã chọn
  const currentTheme = mode === 'system' ? systemColorScheme || 'light' : mode;

  // Tạo theme dựa trên chế độ hiện tại
  const theme: Theme = {
    colors: currentTheme === 'dark' ? darkColors : lightColors,
    mode,
    colorPalette,
    setColorScheme: (newMode: ThemeMode) => setMode(newMode),
    setColorPalette: (palette: ColorPalette) => setColorPalette(palette),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme phải được sử dụng bên trong ThemeProvider');
  }
  return context;
};

export default ThemeContext;
