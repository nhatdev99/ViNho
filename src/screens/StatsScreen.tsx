import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SectionList, Platform, Image, Alert, TextInput, Dimensions } from 'react-native';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { formatCurrency } from '../utils/format';
import { Expense } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../utils/dateUtils';
import Ionicons from '@expo/vector-icons/Ionicons';
import { deleteExpense } from '../store/expensesSlice';
// Đã bỏ biểu đồ vì đã có trong màn Công cụ

type CategoryIconMap = {
  [key: string]: keyof typeof Ionicons.glyphMap;
};

// Định nghĩa các icon tương ứng với từng danh mục
const categoryIcons: CategoryIconMap = {
  'Ăn uống': 'fast-food-outline',
  'Di chuyển': 'car-outline',
  'Giải trí': 'game-controller-outline',
  'Nhà ở': 'home-outline',
  'Tiện ích': 'build-outline',
  'Mua sắm': 'cart-outline',
  'Y tế': 'medkit-outline',
  'Giáo dục': 'school-outline',
  'Khác': 'ellipsis-horizontal-outline'
};

const StatsScreen = () => {
  const { theme } = useTheme();
  const { expenses } = useAppSelector((state) => state.expenses);
  const dispatch = useAppDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});
  const [expensesByDate, setExpensesByDate] = useState<Record<string, Expense[]>>({});

  // Lọc nâng cao
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  useEffect(() => {
    if (selectedPeriod === 'day') {
      // Lọc chi tiêu theo ngày đã chọn
      const dailyExpenses = expenses.filter(expense => expense.date === selectedDate);
      setFilteredExpenses(dailyExpenses);

      // Tính tổng chi tiêu
      const total = dailyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      setTotalExpenses(total);

      // Nhóm chi tiêu theo danh mục
      const byCategory = dailyExpenses.reduce((acc, expense) => {
        if (!expense.category) return acc;

        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount || 0;
        return acc;
      }, {} as Record<string, number>);

      setExpensesByCategory(byCategory);
      return;
    }

    // Phần xử lý cho tuần và tháng (giữ nguyên)
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

    // Lọc nâng cao sau khi lọc theo khoảng thời gian
    const advancedFiltered = filtered.filter(exp => {
      const inCategory = filterCategory ? exp.category === filterCategory : true;
      const amount = Number(exp.amount || 0);
      const geMin = minAmount ? amount >= Number(minAmount) : true;
      const leMax = maxAmount ? amount <= Number(maxAmount) : true;
      const hasKeyword = keyword
        ? `${exp.note || ''} ${exp.category || ''}`
            .toLowerCase()
            .includes(keyword.toLowerCase())
        : true;
      return inCategory && geMin && leMax && hasKeyword;
    });

    setFilteredExpenses(advancedFiltered);
    const total = advancedFiltered.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    setTotalExpenses(total);

    const byCategory = advancedFiltered.reduce((acc, expense) => {
      if (!expense.category) return acc;

      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    setExpensesByCategory(byCategory);
  }, [expenses, selectedPeriod, selectedDate, filterCategory, minAmount, maxAmount, keyword]);

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach(e => e.category && set.add(e.category));
    return Array.from(set);
  }, [expenses]);

  // Chuẩn bị dữ liệu cho SectionList
  const prepareSectionData = () => {
    const sections: { title: string; data: Expense[] }[] = [];

    if (selectedPeriod === 'day') {
      // Nhóm theo danh mục nếu xem theo ngày
      const groupedByCategory: Record<string, Expense[]> = {};

      filteredExpenses.forEach(expense => {
        if (!expense.category) return;

        if (!groupedByCategory[expense.category]) {
          groupedByCategory[expense.category] = [];
        }
        groupedByCategory[expense.category].push(expense);
      });

      // Chuyển đổi thành mảng sections
      Object.entries(groupedByCategory).forEach(([category, items]) => {
        sections.push({
          title: category,
          data: items,
        });
      });
    } else {
      // Nhóm theo ngày nếu xem theo tuần/tháng
      const groupedByDate: Record<string, Expense[]> = {};

      filteredExpenses.forEach(expense => {
        if (!groupedByDate[expense.date]) {
          groupedByDate[expense.date] = [];
        }
        groupedByDate[expense.date].push(expense);
      });

      // Sắp xếp các ngày từ mới đến cũ
      const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
      );

      sortedDates.forEach(date => {
        sections.push({
          title: formatDate(date),
          data: groupedByDate[date],
        });
      });
    }

    return sections;
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xóa khoản chi',
      'Bạn có chắc muốn xóa khoản chi này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => dispatch(deleteExpense(id)),
        },
      ]
    );
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={[styles.expenseItem, { backgroundColor: theme.colors.background }]}> 
      <View style={{
        padding: 15,
        backgroundColor: item.category ? getCategoryColor(item.category) : theme.colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderRadius: 10
      }}>
        <Ionicons
          name={item.category && categoryIcons[item.category]
            ? categoryIcons[item.category]
            : 'ellipsis-horizontal-outline'}
          size={20}
          color={theme.colors.text}
        />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={[styles.expenseCategory, { color: theme.colors.text }]}>
          Tiêu dùng cho <Text style={[styles.expenseCategory, { color: theme.colors.primary }]}>{item.category}</Text>
        </Text>
        {item.createdAt ? (
          <Text style={[styles.expenseNote, { color: theme.colors.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        ) : null}
      </View>
      <View style={[styles.expenseInfo, { alignItems: 'flex-end' }]}> 
        <Text style={{ color: theme.colors.text }}>
          Số tiền
        </Text>
        <Text style={[styles.expenseAmount, { color: item.amount < 0 ? "#e63746" : "#02c59b" }]}> 
          {formatCurrency(item.amount)}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityLabel="Xóa khoản chi"
        onPress={() => handleDelete(item.id)}
        style={{ padding: 8, marginLeft: 8 }}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.error || '#e63746'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Thống kê chi tiêu</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'day' && styles.periodButtonActive,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedPeriod('day')}>
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'day' ? { color: theme.colors.primary } : { color: theme.colors.text },
              ]}>
              Ngày
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'week' && styles.periodButtonActive,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedPeriod('week')}>
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'week' ? { color: theme.colors.primary } : { color: theme.colors.text },
              ]}>
              Tuần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.periodButtonActive,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedPeriod('month')}>
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'month' ? { color: theme.colors.primary } : { color: theme.colors.text },
              ]}>
              Tháng
            </Text>
          </TouchableOpacity>
        </View>


        {selectedPeriod === 'day' && (
          <>
            <TouchableOpacity
              style={[styles.dateSelector, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}
              onPress={() => setShowDatePicker(!showDatePicker)}
              activeOpacity={0.8}
            >
              <Text style={{ color: theme.colors.primary }}>
                {formatDate(selectedDate)} ▼
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={[styles.datePickerContainer, { backgroundColor: theme.colors.card }]}>
                <DateTimePicker
                  value={new Date(selectedDate)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setSelectedDate(selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                  themeVariant={theme.colors.theme === 'dark' ? 'dark' : 'light'}
                />
              </View>
            )}
          </>
        )}

        {/* Bộ lọc nâng cao */}
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.filterChip, { borderColor: theme.colors.primary }]}>
              <TextInput
                placeholder="Danh mục"
                placeholderTextColor={theme.colors.textSecondary}
                value={filterCategory}
                onChangeText={setFilterCategory}
                style={{ color: theme.colors.text, minWidth: 90 }}
              />
            </View>
            <View style={[styles.filterChip, { borderColor: theme.colors.primary }]}>
              <TextInput
                placeholder="Min"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                value={minAmount}
                onChangeText={(t) => setMinAmount(t.replace(/[^0-9]/g, ''))}
                style={{ color: theme.colors.text, minWidth: 70 }}
              />
            </View>
            <View style={[styles.filterChip, { borderColor: theme.colors.primary }]}>
              <TextInput
                placeholder="Max"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                value={maxAmount}
                onChangeText={(t) => setMaxAmount(t.replace(/[^0-9]/g, ''))}
                style={{ color: theme.colors.text, minWidth: 70 }}
              />
            </View>
            <View style={[styles.filterChip, { borderColor: theme.colors.primary }]}>
              <TextInput
                placeholder="Từ khóa"
                placeholderTextColor={theme.colors.textSecondary}
                value={keyword}
                onChangeText={setKeyword}
                style={{ color: theme.colors.text, minWidth: 120 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>


      <View style={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            {selectedPeriod === 'day'
              ? `Tổng chi tiêu ngày ${formatDate(selectedDate)}`
              : `Tổng chi tiêu ${selectedPeriod === 'week' ? 'tuần này' : 'tháng này'}`}
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
            {formatCurrency(totalExpenses)}
          </Text>

        </View>

        {/* Đã bỏ biểu đồ tổng quan (đã có ở màn Công cụ) */}

        <SectionList
          sections={prepareSectionData()}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderExpenseItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {title}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Không có dữ liệu chi tiêu
            </Text>
          }
          contentContainerStyle={styles.sectionList}
          stickySectionHeadersEnabled={false}
        />
      </View>
    </View>
  );
};

// Hàm phụ trợ để lấy màu cho từng danh mục
const getCategoryColor = (category: string): string => {
  if (!category) return '#607D8B'; // Màu mặc định nếu không có danh mục

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
    paddingTop: 50,
    paddingBottom: 20,
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
    marginBottom: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  periodButtonActive: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateSelector: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerContainer: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  doneButton: {
    padding: 10,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  summaryCard: {

    position: 'relative',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  filtersRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingVertical: 10,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 4,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  expenseNote: {
    fontSize: 14,
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#757575',
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
});

export default StatsScreen;
