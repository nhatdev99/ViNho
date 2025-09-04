import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import type { Expense } from '../types';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchExpenses, addNewExpense } from '../store/expensesSlice';
import { fetchBudgets } from '../store/budgetsSlice';
import { fetchRecurrences, upsertRecurrence } from '../store/recurrencesSlice';
import { formatCurrency } from '../utils/format';
import { Asset } from 'expo-asset';
import type { BudgetModel } from '../store/budgetsSlice';

// Hàm chuyển định dạng ngày về 'ngày dd tháng MM năm yyyy'
// Hỗ trợ cả ISO (yyyy-mm-ddTHH:mm:ssZ) và yyyy-mm-dd
const formatDate = (dateString: string) => {
  const dateOnly = dateString.includes('T')
    ? dateString.split('T')[0]
    : dateString;
  const [year, month, day] = dateOnly.split('-');
  const monthNames = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ];
  const monthName = monthNames[parseInt(month, 10) - 1];
  return `ngày ${parseInt(day, 10)} tháng ${monthName} năm ${year}`;
};

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { expenses, loading } = useAppSelector((state) => state.expenses);
  const budgets = useAppSelector((state) => state.budgets.items);
  const recurrences = useAppSelector((state) => state.recurrences.items);
  const { settings } = useAppSelector((state) => state.settings);
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchBudgets());
    dispatch(fetchRecurrences());
  }, [dispatch]);

  // Auto-tạo giao dịch từ định kỳ khi đến hạn
  useEffect(() => {
    const checkRecurringTransactions = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        let hasNewTransactions = false;
        
        for (const recurrence of recurrences) {
          if (recurrence.nextRunAt <= today) {
            // Tạo giao dịch mới
            await dispatch(addNewExpense({
              amount: recurrence.amount,
              category: recurrence.category,
              note: `${recurrence.note || ''} (Định kỳ)`,
              date: new Date().toISOString(),
            })).unwrap();

            // Cập nhật ngày chạy tiếp theo
            const nextDate = new Date(recurrence.nextRunAt);
            switch (recurrence.interval) {
              case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
              case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            }
            
            await dispatch(upsertRecurrence({
              ...recurrence,
              nextRunAt: nextDate.toISOString().split('T')[0],
            })).unwrap();
            
            hasNewTransactions = true;
          }
        }
        
        // Thông báo cho người dùng nếu có giao dịch mới được tạo
        if (hasNewTransactions) {
          Alert.alert(
            '✅ Giao dịch định kỳ',
            'Đã tự động tạo các giao dịch định kỳ đến hạn!',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Lỗi khi xử lý giao dịch định kỳ:', error);
        Alert.alert(
          '⚠️ Lỗi',
          'Có lỗi xảy ra khi xử lý giao dịch định kỳ',
          [{ text: 'OK' }]
        );
      }
    };

    if (recurrences.length > 0) {
      checkRecurringTransactions();
    }
  }, [recurrences, dispatch]);

  useEffect(() => {
    const preload = async () => {
      try {
        const monster = Asset.fromModule(
          require('../assets/images/monster2.png')
        );
        const header = Asset.fromModule(
          require('../assets/images/headerimage.png')
        );
        await Promise.all([
          monster.downloadAsync(),
          header.downloadAsync(),
        ]);
      } catch (_) {
      } finally {
        setAssetsReady(true);
      }
    };
    preload();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const todayExpenses = expenses.filter((expense) => {
    const expenseDate = (expense.date || '').split('T')[0];
    return expenseDate === today;
  });
  const totalToday = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Tổng chi tiêu tháng hiện tại
  const monthExpenses = expenses.filter((expense) => {
    const iso = expense.date || '';
    return iso.startsWith(monthKey);
  });
  const totalThisMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currentMonthBudget = budgets.find((b: BudgetModel) => b.monthKey === monthKey);
  const totalLimit = currentMonthBudget?.totalLimit || 0;
  const usageRatio = totalLimit > 0 ? totalThisMonth / totalLimit : 0;

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={[styles.expenseItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.expenseInfo}>
        <Text style={[styles.expenseCategory, { color: theme.colors.primary }]}>
          {item.category}
        </Text>
        {item.note ? (
          <Text style={[styles.expenseNote, { color: theme.colors.textSecondary }]}>
            {item.note}
          </Text>
        ) : null}
        <Text style={[styles.expenseDate, { color: theme.colors.textSecondary }]}>
          Vào {formatDate(item.date)}
        </Text>
      </View>
      <Text style={[styles.expenseAmount, { color: theme.colors.text }]}>
        {formatCurrency(item.amount, settings.currency)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.primary, borderRadius: 20 }
        ]}
      >
        <View style={[styles.headerContent]}>

          <Text style={[styles.headerTitle, { color: theme.colors.card }]}>Hôm nay</Text>
          <Text style={[styles.headerAmount, { color: theme.colors.card, zIndex: 1 }]}>{formatCurrency(totalToday, settings.currency)}</Text>
          {totalLimit > 0 && (
            <Text style={{ color: theme.colors.primary, marginTop: 6, backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 10, borderRadius: 10 }}>
              Tháng này: {formatCurrency(totalThisMonth, settings.currency)} / {formatCurrency(totalLimit, settings.currency)}
              {usageRatio >= 1 ? ' (Vượt ngân sách!)' : usageRatio >= 0.8 ? ' (Gần chạm ngân sách)' : ''}
            </Text>
          )}
        </View>
        <View style={styles.headerBudget}>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Budget')}
            style={styles.headerBudgetButton}
          >
            <Text style={{ color: theme.colors.card }}>
              Ngân sách
            </Text>
          </TouchableOpacity>
        </View>

        {assetsReady && (
          <>
            <Image
              source={require('../assets/images/monster2.png')}
              style={styles.treeImage}
              resizeMethod="resize"
              fadeDuration={0}
            />
            <Image
              source={require('../assets/images/headerimage.png')}
              style={styles.monsterImage}
              resizeMethod="resize"
              fadeDuration={0}
            />
          </>
        )}
      </View>

      <FlatList
        data={todayExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Chưa có khoản chi nào hôm nay
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => (navigation as any).navigate('AddExpense')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50
  },
  header: {
    position: 'relative',
    overflow: 'hidden',
    height: 200,
    padding: 20,
    paddingVertical: 40,
    borderRadius: 20,
    justifyContent: 'center',
    marginHorizontal: 15
  },
  monsterImage: {
    position: 'absolute',
    right: -90,
    bottom: 0,
    height: 150,
    width: '100%',
    resizeMode: 'contain',
    zIndex: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  treeImage: {
    position: 'absolute',
    left: -70,
    bottom: -10,
    height: 170,
    width: '100%',
    resizeMode: 'contain',
    zIndex: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  backgroundblur: {
    position: 'absolute',
    flex: 1,
    top: "50%",
    left: "30%",
    width: 200,
    height: 100,
    borderRadius: "50%",
    zIndex: -1,
  },
  headerContent: {
    zIndex: 1,
    position: 'absolute',
    top: 10,
    left: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 5,
  },
  headerAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerBudget: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  headerBudgetButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
  },
  listContent: {
    flex: 1,
    padding: 15,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
  },
  expenseNote: {
    fontSize: 14,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 30,
    marginTop: -2,
  },
});

export default HomeScreen;
