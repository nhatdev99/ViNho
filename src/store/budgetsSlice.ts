import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CategoryBudget {
  categoryId: string;
  limit: number;
}

export interface Budget {
  id: string;
  monthKey: string; // YYYY-MM
  totalLimit?: number;
  perCategory?: CategoryBudget[];
  createdAt: string;
}

export interface BudgetsState {
  items: Budget[];
  loading: boolean;
  error: string | null;
}

const BUDGETS_KEY = 'vinho:budgets';

const initialState: BudgetsState = {
  items: [],
  loading: false,
  error: null,
};

async function loadBudgetsFromStorage(): Promise<Budget[]> {
  const raw = await AsyncStorage.getItem(BUDGETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveBudgetsToStorage(items: Budget[]): Promise<void> {
  await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(items));
}

export const fetchBudgets = createAsyncThunk<
  Budget[],
  void,
  { rejectValue: string; state: RootState }
>('budgets/fetchBudgets', async (_, { rejectWithValue }) => {
  try {
    return await loadBudgetsFromStorage();
  } catch (err) {
    return rejectWithValue('Không thể tải ngân sách');
  }
});

export const upsertBudget = createAsyncThunk<
  Budget,
  Omit<Budget, 'id' | 'createdAt'> & { id?: string },
  { rejectValue: string; state: RootState }
>('budgets/upsertBudget', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const existing = state.budgets.items;
    const now = new Date().toISOString();
    const sameMonthIdx = existing.findIndex(b => b.monthKey === payload.monthKey);
    const baseId = sameMonthIdx !== -1 ? existing[sameMonthIdx].id : (payload.id || `${payload.monthKey}-${now}`);
    const newBudget: Budget = {
      id: baseId,
      createdAt: sameMonthIdx !== -1 ? existing[sameMonthIdx].createdAt : now,
      monthKey: payload.monthKey,
      totalLimit: payload.totalLimit,
      perCategory: payload.perCategory,
    };
    const next = sameMonthIdx === -1
      ? [...existing, newBudget]
      : existing.map(b => (b.monthKey === payload.monthKey ? { ...b, ...newBudget } : b));
    await saveBudgetsToStorage(next);
    return newBudget;
  } catch (err) {
    return rejectWithValue('Không thể lưu ngân sách');
  }
});

export const deleteBudget = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('budgets/deleteBudget', async (budgetId, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const next = state.budgets.items.filter(b => b.id !== budgetId);
    await saveBudgetsToStorage(next);
    return budgetId;
  } catch (err) {
    return rejectWithValue('Không thể xóa ngân sách');
  }
});

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchBudgets.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Lỗi tải ngân sách';
      })
      .addCase(upsertBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upsertBudget.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.items.findIndex(b => b.id === payload.id);
        if (idx === -1) state.items.push(payload);
        else state.items[idx] = { ...state.items[idx], ...payload };
      })
      .addCase(upsertBudget.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Lỗi lưu ngân sách';
      })
      .addCase(deleteBudget.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(b => b.id !== payload);
      });
  },
});

export default budgetsSlice.reducer;
export type { Budget as BudgetModel };

