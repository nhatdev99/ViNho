import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchBudgets, upsertBudget } from '../store/budgetsSlice';
import { formatCurrency } from '../utils/format';

const BudgetScreen = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const budgets = useAppSelector((s) => s.budgets.items);
  const [limit, setLimit] = useState('');
  const monthKey = new Date().toISOString().slice(0, 7);
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(fetchBudgets());
  }, [dispatch]);

  useEffect(() => {
    const current = budgets.find((b: any) => b.monthKey === monthKey);
    current?.totalLimit && setLimit(String(current.totalLimit));
  }, [budgets, monthKey]);

  const handleSave = async () => {
    const numeric = Number(limit.replace(/[^0-9]/g, ''));
    if (!numeric || Number.isNaN(numeric) || numeric <= 0) return;
    await dispatch(upsertBudget({ monthKey, totalLimit: numeric })).unwrap();
    // Refresh budgets để HomeScreen nhận bản mới nhất khi back
    await dispatch(fetchBudgets()).unwrap();
    Keyboard.dismiss();
    // Tự đóng modal sau khi lưu
    // @ts-ignore
    (navigation as any).goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.title, { color: theme.colors.text }]}>Ngân sách tháng {monthKey}</Text>
      <TextInput
        value={limit}
        onChangeText={(t) => setLimit(t.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        placeholder="Nhập hạn mức tháng"
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />
      <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>
        {limit ? `Xem trước: ${formatCurrency(Number(limit))}` : ''}
      </Text>
      <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.buttonText}>Lưu ngân sách</Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default BudgetScreen;


