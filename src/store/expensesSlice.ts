import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { Expense } from '../types';
import { 
  getExpenses as getExpensesFromStorage,
  addExpense as addExpenseToStorage,
  updateExpense as updateExpenseInStorage,
  deleteExpense as deleteExpenseFromStorage,
  EXPENSES_KEY
} from '../utils/storage';

export interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
};

// Lấy danh sách chi tiêu
export const fetchExpenses = createAsyncThunk<
  Expense[],
  void,
  { rejectValue: string; state: RootState }
>('expenses/fetchExpenses', async (_, { rejectWithValue }) => {
  try {
    const expenses = await getExpensesFromStorage();
    return expenses;
  } catch (error) {
    console.error('Lỗi khi tải chi tiêu:', error);
    return rejectWithValue('Không thể tải danh sách chi tiêu');
  }
});

export const addNewExpense = createAsyncThunk<
  Expense,
  Omit<Expense, 'id' | 'createdAt'>,
  { rejectValue: string; state: RootState }
>(
  'expenses/addNewExpense',
  async (expense, { rejectWithValue }) => {
    try {
      const newExpense = await addExpenseToStorage(expense);
      return newExpense;
    } catch (error) {
      console.error('Lỗi khi thêm chi tiêu:', error);
      return rejectWithValue('Không thể thêm chi tiêu mới');
    }
  }
);

export const updateExpense = createAsyncThunk<
  Expense,
  Expense,
  { rejectValue: string; state: RootState }
>(
  'expenses/updateExpense',
  async (expense, { rejectWithValue }) => {
    try {
      const updatedExpense = await updateExpenseInStorage(expense);
      if (!updatedExpense) {
        throw new Error('Không tìm thấy chi tiêu để cập nhật');
      }
      return updatedExpense;
    } catch (error) {
      console.error('Lỗi khi cập nhật chi tiêu:', error);
      return rejectWithValue('Không thể cập nhật chi tiêu');
    }
  }
);

export const deleteExpense = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>(
  'expenses/deleteExpense',
  async (expenseId, { rejectWithValue }) => {
    try {
      await deleteExpenseFromStorage(expenseId);
      return expenseId;
    } catch (error) {
      console.error('Lỗi khi xóa chi tiêu:', error);
      return rejectWithValue('Không thể xóa chi tiêu');
    }
  }
);

export const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenses: (state) => {
      state.expenses = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Xử lý các trường hợp của fetchExpenses
    builder.addCase(fetchExpenses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(fetchExpenses.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = action.payload;
    });
    
    builder.addCase(fetchExpenses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Lỗi khi tải chi tiêu';
    });
    
    // Xử lý các trường hợp của addNewExpense
    builder.addCase(addNewExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(addNewExpense.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses.push(action.payload);
    });
    
    builder.addCase(addNewExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Lỗi khi thêm chi tiêu mới';
    });
    
    // Xử lý các trường hợp của updateExpense
    builder.addCase(updateExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(updateExpense.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    });
    
    builder.addCase(updateExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Lỗi khi cập nhật chi tiêu';
    });
    
    // Xử lý các trường hợp của deleteExpense
    builder.addCase(deleteExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(deleteExpense.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
    });
    
    builder.addCase(deleteExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Lỗi khi xóa chi tiêu';
    });
  },
});

export const { clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;
