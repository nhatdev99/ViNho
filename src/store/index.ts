import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import expensesReducer, { ExpensesState } from './expensesSlice';
import settingsReducer, { SettingsState } from './settingsSlice';
import spendingLimitReducer from './spendingLimitSlice';
import type { SpendingLimitState } from './spendingLimitSlice';

export interface AppState {
  expenses: ExpensesState;
  settings: SettingsState;
  spendingLimit: SpendingLimitState;
}

export const store = configureStore<AppState>({
  reducer: {
    expenses: expensesReducer,
    settings: settingsReducer,
    spendingLimit: spendingLimitReducer,
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
