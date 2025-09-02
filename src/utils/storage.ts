import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, defaultUserSettings, ThemeMode } from '../types';

// Các khóa lưu trữ
export const EXPENSES_KEY = '@ViNho:expenses';
export const SETTINGS_KEY = '@ViNho:settings';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

// Sử dụng defaultUserSettings từ file types
const defaultSettings: UserSettings = { ...defaultUserSettings };

// Lưu danh sách chi tiêu
export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Lỗi khi lưu chi tiêu:', error);
    throw error;
  }
};

// Lấy danh sách chi tiêu
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const expensesJson = await AsyncStorage.getItem(EXPENSES_KEY);
    if (!expensesJson) return [];
    
    const parsedExpenses = JSON.parse(expensesJson);
    // Đảm bảo mỗi expense có đầy đủ các trường bắt buộc
    return parsedExpenses.map((expense: any) => ({
      id: expense.id || Date.now().toString(),
      amount: expense.amount || 0,
      category: expense.category || 'Khác',
      date: expense.date || new Date().toISOString(),
      note: expense.note || '',
      createdAt: expense.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Lỗi khi lấy chi tiêu:', error);
    return [];
  }
};

// Thêm chi tiêu mới
export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
  try {
    const expenses = await getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedExpenses = [newExpense, ...expenses];
    await saveExpenses(updatedExpenses);
    return newExpense;
  } catch (error) {
    console.error('Lỗi khi thêm chi tiêu:', error);
    throw error;
  }
};

// Cập nhật chi tiêu
export const updateExpense = async (expense: Expense): Promise<Expense | null> => {
  try {
    const expenses = await getExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    
    if (index === -1) return null;
    
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = {
      ...expense,
      updatedAt: new Date().toISOString(),
    };
    
    await saveExpenses(updatedExpenses);
    return updatedExpenses[index];
  } catch (error) {
    console.error('Lỗi khi cập nhật chi tiêu:', error);
    throw error;
  }
};

// Xóa chi tiêu
export const deleteExpense = async (expenseId: string): Promise<boolean> => {
  try {
    const expenses = await getExpenses();
    const updatedExpenses = expenses.filter(e => e.id !== expenseId);
    
    if (expenses.length === updatedExpenses.length) return false;
    
    await saveExpenses(updatedExpenses);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa chi tiêu:', error);
    throw error;
  }
};

// Lấy tổng chi tiêu theo danh mục
export const getExpensesByCategory = async (): Promise<{ [key: string]: number }> => {
  try {
    const expenses = await getExpenses();
    return expenses.reduce<Record<string, number>>((acc, expense) => {
      if (!expense.category) return acc;
      
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount || 0;
      return acc;
    }, {} as { [key: string]: number });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiêu theo danh mục:', error);
    return {};
  }
};

// Lấy cài đặt người dùng
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!settingsJson) return { ...defaultSettings };

    const settings = JSON.parse(settingsJson);
    
    // Đảm bảo tất cả các trường đều có giá trị hợp lệ
    const result: UserSettings = {
      ...defaultSettings,
      ...settings,
      notifications: {
        ...defaultSettings.notifications,
        ...(settings.notifications || {})
      },
      categories: Array.isArray(settings.categories) && settings.categories.length > 0
        ? settings.categories.filter((cat: any) => typeof cat === 'string')
        : [...defaultSettings.categories]
    };
    
    return result;
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt:', error);
    return { ...defaultSettings };
  }
};

// Lưu cài đặt người dùng
export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
  try {
    // Đảm bảo chỉ lưu các trường cần thiết
    const settingsToSave: UserSettings = {
      currency: settings.currency || defaultSettings.currency,
      theme: ['light', 'dark', 'system'].includes(settings.theme) 
        ? settings.theme as ThemeMode 
        : defaultSettings.theme,
      notifications: {
        daily: !!settings.notifications?.daily,
        weekly: !!settings.notifications?.weekly,
        monthly: !!settings.notifications?.monthly,
      },
      notificationTime: settings.notificationTime || defaultSettings.notificationTime,
      monthlyBudget: settings.monthlyBudget,
      dailyBudget: settings.dailyBudget,
      categories: Array.isArray(settings.categories) && settings.categories.length > 0
        ? settings.categories.filter(cat => typeof cat === 'string')
        : [...defaultSettings.categories]
    };
    
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
  } catch (error) {
    console.error('Lỗi khi lưu cài đặt người dùng:', error);
    throw error;
  }
};
