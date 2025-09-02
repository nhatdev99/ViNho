import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import type { Expense } from '../types';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchExpenses } from '../store/expensesSlice';
import { formatCurrency } from '../utils/format';
import { BlurView } from 'expo-blur';


const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { expenses, loading } = useAppSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter((expense) => expense.date === today);
  const totalToday = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
      </View>
      <Text style={[styles.expenseAmount, { color: theme.colors.text }]}>
        {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary, borderRadius: 20 }]}>
        <View style={[styles.headerContent]}>
          <Text style={[styles.headerTitle, { color: "#781242", zIndex: 1 }]}>Hôm nay</Text>
          <Text style={[styles.headerAmount, { color: theme.colors.card, zIndex: 1 }]}>{formatCurrency(totalToday)}</Text>
        </View>

        <Image source={require('../assets/images/monster2.png')} style={styles.treeImage} />
        <Image source={require('../assets/images/headerimage.png')} style={styles.monsterImage} />
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
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
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
    left:15,
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
  listContent: {
    flexGrow: 1,
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
