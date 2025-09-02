import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { UserSettings, defaultUserSettings } from '../types';
import { saveUserSettings, getUserSettings } from '@/utils/storage';

interface SettingsState {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: { ...defaultUserSettings },
  loading: false,
  error: null,
};

export const loadSettings = createAsyncThunk<
  UserSettings,
  void,
  { rejectValue: string; state: RootState }
>('settings/loadSettings', async (_, { rejectWithValue }) => {
  try {
    const settings = await getUserSettings();
    
    return {
      ...defaultUserSettings,
      ...settings,
      notifications: {
        ...defaultUserSettings.notifications,
        ...(settings.notifications || {})
      },
      categories: settings.categories?.length 
        ? Array.from(new Set([...defaultUserSettings.categories, ...settings.categories])) 
        : [...defaultUserSettings.categories]
    };
  } catch (error) {
    console.error('Lỗi khi tải cài đặt:', error);
    return rejectWithValue('Không thể tải cài đặt');
  }
});

interface UpdateSettingsParams {
  settings: Partial<UserSettings>;
  getState: () => any;
  rejectWithValue: (value: string) => any;
}

export const updateSettings = createAsyncThunk<
  UserSettings,
  Partial<UserSettings>,
  { rejectValue: string; state: RootState }
>('settings/updateSettings', async (updates, { getState, rejectWithValue }) => {
  try {
    const { settings: { settings: currentSettings } } = getState();
    
    // Tạo đối tượng mới với các giá trị cập nhật
    const newSettings: UserSettings = {
      ...currentSettings,
      ...updates,
      notifications: {
        ...currentSettings.notifications,
        ...(updates.notifications || {})
      },
categories: updates.categories?.length 
        ? updates.categories.filter((cat, index, self) => 
            index === self.findIndex(c => c === cat)
          )
        : [...currentSettings.categories]
    };
    
    await saveUserSettings(newSettings);
    return newSettings;
  } catch (error) {
    console.error('Lỗi khi cập nhật cài đặt:', error);
    return rejectWithValue('Không thể cập nhật cài đặt');
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetSettings: (state) => {
      state.settings = { ...defaultUserSettings };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Xử lý loadSettings
    builder.addCase(loadSettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      state.loading = false;
      state.settings = action.payload;
    });
    
    builder.addCase(loadSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Xử lý updateSettings
    builder
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.settings = payload;
      })
      .addCase(updateSettings.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Có lỗi xảy ra khi cập nhật cài đặt';
      });
  },
});

export const { resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
