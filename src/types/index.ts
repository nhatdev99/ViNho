// Định nghĩa kiểu dữ liệu cho khoản chi
export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

// Định nghĩa danh mục chi tiêu
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Định nghĩa thống kê
export interface Stats {
  total: number;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  period: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// Định nghĩa cài đặt người dùng
export interface UserSettings {
  currency: string;
  theme: ThemeMode;
  notifications: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  notificationTime: string;
  monthlyBudget?: number;
  dailyBudget?: number;
  categories: string[];
}

// Giá trị mặc định cho cài đặt
export const defaultUserSettings: UserSettings = {
  currency: 'VND',
  theme: 'system',
  notifications: {
    daily: true,
    weekly: true,
    monthly: true
  },
  notificationTime: '20:00',
  categories: [
    'Ăn uống', 'Di chuyển', 'Nhà ở', 'Tiện ích', 
    'Mua sắm', 'Giải trí', 'Y tế', 'Giáo dục', 'Khác'
  ]
};

// Định nghĩa navigation
export type RootStackParamList = {
  Home: undefined;
  AddExpense: { expenseId?: string };
  Stats: { period?: 'week' | 'month' };
  Settings: undefined;
};

// Định nghĩa state của Redux
export interface AppState {
  expenses: {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
  };
  settings: {
    settings: UserSettings;
    loading: boolean;
    error: string | null;
  };
}

// Định nghĩa props cho các component
export interface ThemeProps {
  theme: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      card: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      success: string;
      warning: string;
      info: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      round: number;
    };
    typography: {
      h1: {
        fontSize: number;
        fontWeight: string;
        lineHeight: number;
      };
      h2: {
        fontSize: number;
        fontWeight: string;
        lineHeight: number;
      };
      h3: {
        fontSize: number;
        fontWeight: string;
        lineHeight: number;
      };
      body: {
        fontSize: number;
        lineHeight: number;
      };
      caption: {
        fontSize: number;
        lineHeight: number;
        color: string;
      };
    };
  };
}
