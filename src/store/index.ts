import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import expensesReducer, { ExpensesState } from './expensesSlice';
import settingsReducer, { SettingsState } from './settingsSlice';

export interface AppState {
  expenses: ExpensesState;
  settings: SettingsState;
}

export const store = configureStore<AppState>({
  reducer: {
    expenses: expensesReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
