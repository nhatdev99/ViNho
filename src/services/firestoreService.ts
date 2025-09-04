import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Expense } from '../types';

const COLLECTIONS = {
  EXPENSES: 'expenses',
  SETTINGS: 'settings',
} as const;

export class FirestoreService {
  // Expense operations
  static async addExpense(userId: string, expense: Omit<Expense, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.EXPENSES), {
        ...expense,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  static async updateExpense(userId: string, expenseId: string, updates: Partial<Expense>) {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  static async deleteExpense(userId: string, expenseId: string) {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  static async getExpenses(userId: string): Promise<Expense[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.EXPENSES),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const expenses: Expense[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expenses.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate?.() || new Date(data.date),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        } as Expense);
      });
      
      return expenses;
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  }

  static subscribeToExpenses(userId: string, callback: (expenses: Expense[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.EXPENSES),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const expenses: Expense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expenses.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate?.() || new Date(data.date),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        } as Expense);
      });
      callback(expenses);
    });
  }

  // Settings operations
  static async saveSettings(userId: string, settings: any) {
    try {
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        await addDoc(collection(db, COLLECTIONS.SETTINGS), {
          userId,
          ...settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        console.error('Error saving settings:', error);
        throw error;
      }
    }
  }

  static async getSettings(userId: string) {
    try {
      const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  // Sync operations
  static async syncExpensesToFirestore(userId: string, localExpenses: Expense[]) {
    try {
      const firestoreExpenses = await this.getExpenses(userId);
      const firestoreExpenseIds = new Set(firestoreExpenses.map(e => e.id));
      
      // Add local expenses that don't exist in Firestore
      for (const expense of localExpenses) {
        if (!firestoreExpenseIds.has(expense.id)) {
          await this.addExpense(userId, expense);
        }
      }
      
      return firestoreExpenses;
    } catch (error) {
      console.error('Error syncing expenses:', error);
      throw error;
    }
  }

  static async syncSettingsToFirestore(userId: string, localSettings: any) {
    try {
      await this.saveSettings(userId, localSettings);
      return await this.getSettings(userId);
    } catch (error) {
      console.error('Error syncing settings:', error);
      throw error;
    }
  }
}
