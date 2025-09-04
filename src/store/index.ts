import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import expensesReducer, { ExpensesState } from './expensesSlice';
import settingsReducer, { SettingsState } from './settingsSlice';
import budgetsReducer from './budgetsSlice';
import recurrencesReducer from './recurrencesSlice';
import goalsReducer from './goalsSlice';

export interface AppState {
  expenses: ExpensesState;
  settings: SettingsState;
  budgets: any;
  recurrences: any;
  goals: any;
}

export const store = configureStore<AppState>({
  reducer: {
    expenses: expensesReducer,
    settings: settingsReducer,
    budgets: budgetsReducer,
    recurrences: recurrencesReducer,
    goals: goalsReducer,
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
