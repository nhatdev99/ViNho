import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecurrenceInterval = 'daily' | 'weekly' | 'monthly';

export interface Recurrence {
  id: string;
  amount: number;
  category: string;
  note?: string;
  interval: RecurrenceInterval;
  nextRunAt: string; // ISO date
  createdAt: string;
}

export interface RecurrencesState {
  items: Recurrence[];
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'vinho:recurrences';

const initialState: RecurrencesState = {
  items: [],
  loading: false,
  error: null,
};

async function loadFromStorage(): Promise<Recurrence[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveToStorage(items: Recurrence[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const fetchRecurrences = createAsyncThunk<
  Recurrence[],
  void,
  { rejectValue: string; state: RootState }
>('recurrences/fetch', async (_, { rejectWithValue }) => {
  try { return await loadFromStorage(); }
  catch { return rejectWithValue('Không thể tải giao dịch định kỳ'); }
});

export const upsertRecurrence = createAsyncThunk<
  Recurrence,
  Omit<Recurrence, 'id' | 'createdAt'> & { id?: string },
  { rejectValue: string; state: RootState }
>('recurrences/upsert', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const now = new Date().toISOString();
    const items = state.recurrences?.items || [];
    const id = payload.id || `${payload.category}-${payload.interval}-${now}`;
    const newItem: Recurrence = {
      id,
      createdAt: items.find(r => r.id === id)?.createdAt || now,
      amount: payload.amount,
      category: payload.category,
      note: payload.note,
      interval: payload.interval,
      nextRunAt: payload.nextRunAt,
    };
    const next = items.some(r => r.id === id)
      ? items.map(r => (r.id === id ? { ...r, ...newItem } : r))
      : [...items, newItem];
    await saveToStorage(next);
    return newItem;
  } catch {
    return rejectWithValue('Không thể lưu giao dịch định kỳ');
  }
});

export const deleteRecurrence = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('recurrences/delete', async (id, { getState, rejectWithValue }) => {
  try {
    const items = (getState() as RootState).recurrences.items;
    const next = items.filter(r => r.id !== id);
    await saveToStorage(next);
    return id;
  } catch {
    return rejectWithValue('Không thể xóa giao dịch định kỳ');
  }
});

const recurrencesSlice = createSlice({
  name: 'recurrences',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecurrences.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchRecurrences.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; })
      .addCase(fetchRecurrences.rejected, (s, { payload }) => { s.loading = false; s.error = payload || 'Lỗi'; })
      .addCase(upsertRecurrence.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(upsertRecurrence.fulfilled, (s, { payload }) => {
        s.loading = false;
        const idx = s.items.findIndex(r => r.id === payload.id);
        if (idx === -1) s.items.push(payload); else s.items[idx] = { ...s.items[idx], ...payload };
      })
      .addCase(upsertRecurrence.rejected, (s, { payload }) => { s.loading = false; s.error = payload || 'Lỗi'; })
      .addCase(deleteRecurrence.fulfilled, (s, { payload }) => { s.items = s.items.filter(r => r.id !== payload); });
  },
});

export default recurrencesSlice.reducer;
export type { Recurrence };

