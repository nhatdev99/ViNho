import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { useAppSelector } from '../store';
import { formatCurrency } from '../utils/format';
import { Expense } from '../types';

const StatsScreen = () => {
  const { theme } = useTheme();
  const { expenses } = useAppSelector((state) => state.expenses);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});

  useEffect(() => {
    // Lọc chi tiêu theo khoảng thời gian đã chọn
    const now = new Date();
    let startDate = new Date();
    
    if (selectedPeriod === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });

    setFilteredExpenses(filtered);

    // Tính tổng chi tiêu
    const total = filtered.reduce((sum: number, expense: Expense) => sum + (expense.amount || 0), 0);
    setTotalExpenses(total);

    // Nhóm chi tiêu theo danh mục
    const byCategory = filtered.reduce((acc: Record<string, number>, expense: Expense) => {
      if (!expense.category) return acc;
      
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    setExpensesByCategory(byCategory);
  }, [expenses, selectedPeriod]);

  // Sắp xếp các danh mục theo số tiền giảm dần
  const sortedCategories = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Thống kê chi tiêu
        </Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              { 
                borderColor: theme.colors.border,
                backgroundColor: selectedPeriod === 'week' ? theme.colors.primary : 'transparent',
              },
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text
              style={[
                styles.periodButtonText,
                { 
                  color: selectedPeriod === 'week' ? theme.colors.card : theme.colors.text,
                },
              ]}
            >
              Tuần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              { 
                borderColor: theme.colors.border,
                backgroundColor: selectedPeriod === 'month' ? theme.colors.primary : 'transparent',
              },
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text
              style={[
                styles.periodButtonText,
                { 
                  color: selectedPeriod === 'month' ? theme.colors.card : theme.colors.text,
                },
              ]}
            >
              Tháng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Tổng chi tiêu {selectedPeriod === 'week' ? 'tuần này' : 'tháng này'}
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Chi tiêu theo danh mục
          </Text>
          
          {Object.entries(expensesByCategory).length > 0 ? (
            Object.entries(expensesByCategory).map(([category, amount]) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryColor,
                        { backgroundColor: getCategoryColor(category) },
                      ]}
                    />
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                      {category}
                    </Text>
                  </View>
                  <View style={styles.categoryAmountContainer}>
                    <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                      {formatCurrency(amount)}
                    </Text>
                    <Text style={[styles.categoryPercentage, { color: theme.colors.textSecondary }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Không có dữ liệu chi tiêu
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Hàm phụ trợ để lấy màu cho từng danh mục
const getCategoryColor = (category: string): string => {
  const colors = [
    '#4CAF50', // Xanh lá
    '#2196F3', // Xanh dương
    '#FF5722', // Cam
    '#9C27B0', // Tím
    '#FFC107', // Vàng
    '#607D8B', // Xám
  ];
  
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginTop: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryPercentage: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
  },
});

export default StatsScreen;
