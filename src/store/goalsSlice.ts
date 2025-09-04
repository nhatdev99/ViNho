import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string; // ISO
  createdAt: string;
}

export interface GoalsState {
  items: Goal[];
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'vinho:goals';

const initialState: GoalsState = {
  items: [],
  loading: false,
  error: null,
};

async function loadGoals(): Promise<Goal[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveGoals(items: Goal[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const fetchGoals = createAsyncThunk<Goal[], void, { rejectValue: string; state: RootState }>(
  'goals/fetch',
  async (_, { rejectWithValue }) => {
    try { return await loadGoals(); }
    catch { return rejectWithValue('Không thể tải mục tiêu'); }
  }
);

export const upsertGoal = createAsyncThunk<
  Goal,
  Omit<Goal, 'id' | 'createdAt'> & { id?: string },
  { rejectValue: string; state: RootState }
>('goals/upsert', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const items = state.goals?.items || [];
    const now = new Date().toISOString();
    const id = payload.id || `${payload.name}-${now}`;
    const newItem: Goal = {
      id,
      createdAt: items.find(g => g.id === id)?.createdAt || now,
      name: payload.name,
      targetAmount: payload.targetAmount,
      savedAmount: payload.savedAmount,
      deadline: payload.deadline,
    };
    const next = items.some(g => g.id === id)
      ? items.map(g => (g.id === id ? { ...g, ...newItem } : g))
      : [...items, newItem];
    await saveGoals(next);
    return newItem;
  } catch {
    return rejectWithValue('Không thể lưu mục tiêu');
  }
});

export const deleteGoal = createAsyncThunk<string, string, { rejectValue: string; state: RootState }>(
  'goals/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const items = (getState() as RootState).goals.items;
      const next = items.filter(g => g.id !== id);
      await saveGoals(next);
      return id;
    } catch {
      return rejectWithValue('Không thể xóa mục tiêu');
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchGoals.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; })
      .addCase(fetchGoals.rejected, (s, { payload }) => { s.loading = false; s.error = payload || 'Lỗi'; })
      .addCase(upsertGoal.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(upsertGoal.fulfilled, (s, { payload }) => {
        s.loading = false;
        const idx = s.items.findIndex(g => g.id === payload.id);
        if (idx === -1) s.items.push(payload); else s.items[idx] = { ...s.items[idx], ...payload };
      })
      .addCase(upsertGoal.rejected, (s, { payload }) => { s.loading = false; s.error = payload || 'Lỗi'; })
      .addCase(deleteGoal.fulfilled, (s, { payload }) => { s.items = s.items.filter(g => g.id !== payload); });
  },
});

export default goalsSlice.reducer;
export type { Goal };


