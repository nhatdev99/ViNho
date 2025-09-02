// Định nghĩa các bảng màu khác nhau
export const colorPalettes = {
  blue: {
    light: {
      primary: '#4A90E2',
      secondary: '#F5A623',
    },
    dark: {
      primary: '#5B9CE6',
      secondary: '#FFB74D',
    },
  },
  green: {
    light: {
      primary: '#34C759',
      secondary: '#FF9500',
    },
    dark: {
      primary: '#30D158',
      secondary: '#FF9F0A',
    },
  },
  purple: {
    light: {
      primary: '#AF52DE',
      secondary: '#FF2D55',
    },
    dark: {
      primary: '#BF5AF2',
      secondary: '#FF375F',
    },
  },
  orange: {
    light: {
      primary: '#FF9500',
      secondary: '#FFC107',
    },
    dark: {
      primary: '#FF9F0A',
      secondary: '#FFC107',
    },
  },
  red: {
    light: {
      primary: '#FF3B30',
      secondary: '#FFC107',
    },
    dark: {
      primary: '#FF453A',
      secondary: '#FFC107',
    },
  },
  yellow: {
    light: {
      primary: '#FFC107',
      secondary: '#FFC107',
    },
    dark: {
      primary: '#FFC107',
      secondary: '#FFC107',
    },
  },
  gray: {
    light: {
      primary: '#607D8B',
      secondary: '#607D8B',
    },
    dark: {
      primary: '#607D8B',
      secondary: '#607D8B',
    },
  },
  black: {
    light: {
      primary: '#000000',
      secondary: '#000000',
    },
    dark: {
      primary: '#000000',
      secondary: '#000000',
    },
  },
  white: {
    light: {
      primary: '#FFFFFF',
      secondary: '#000000',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#aaaaa',
    },
  },
} as const;

export type ColorPalette = keyof typeof colorPalettes;

// Tạo theme với bảng màu mặc định là 'blue'
export const createTheme = (palette: ColorPalette = 'blue', mode: 'light' | 'dark' = 'light') => {
  const colors = {
    light: {
      ...colorPalettes[palette].light,
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#333333',
      textSecondary: '#666666',
      border: '#E0E0E0',
      error: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
      info: '#5856D6',
      theme: "light"
    },
    dark: {
      ...colorPalettes[palette].dark,
      background: '#121212',
      card: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      border: '#333333',
      error: '#FF453A',
      success: '#30D158',
      warning: '#FF9F0A',
      info: '#5E5CE6',
      theme: "dark"
    },
  };

  return {
    colors: colors[mode],
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 25,
    },
    typography: {
      h1: {
        fontSize: 28,
        fontWeight: 'bold' as const,
        lineHeight: 34,
      },
      h2: {
        fontSize: 22,
        fontWeight: '600' as const,
        lineHeight: 28,
      },
      h3: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 24,
      },
      body: {
        fontSize: 16,
        lineHeight: 22,
      },
      caption: {
        fontSize: 14,
        lineHeight: 20,
      },
    },
  };
};

export type Theme = ReturnType<typeof createTheme>;
export type ThemeColors = Theme['colors'];

// Xuất theme mặc định để sử dụng trong ứng dụng
export const defaultTheme = createTheme('blue', 'light');
