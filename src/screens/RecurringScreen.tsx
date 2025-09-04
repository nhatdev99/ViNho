import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Platform, FlatList, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useTheme } from '../theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchRecurrences, upsertRecurrence, deleteRecurrence } from '../store/recurrencesSlice';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatCurrency, formatDate } from '../utils/format';

type Interval = 'daily' | 'weekly' | 'monthly';

const intervals: Interval[] = ['daily', 'weekly', 'monthly'];
const categories = [
  'Ăn uống', 'Di chuyển', 'Nhà ở', 'Tiện ích',
  'Mua sắm', 'Giải trí', 'Y tế', 'Giáo dục', 'Khác'
];

const RecurringScreen = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const items = useAppSelector(s => s.recurrences.items);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [interval, setInterval] = useState<Interval>('monthly');
  const [nextRunAt, setNextRunAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    dispatch(fetchRecurrences());
  }, [dispatch]);

  const handleSave = async () => {
    const amt = Number(amount.replace(/[^0-9]/g, ''));
    if (!amt || !category) return;
    await dispatch(upsertRecurrence({ amount: amt, category, note, interval, nextRunAt })).unwrap();
    (navigation as any).goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Giao dịch định kỳ</Text>
        <View style={{ width: 40 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <View style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.text, marginBottom: 6 }}>
              Số tiền
            </Text>

            <TextInput
              placeholder="Số tiền"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <Text style={{ color: theme.colors.text, marginBottom: 6 }}>
              Danh mục
            </Text>
            <View style={styles.categoriesContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.categoryChip, {
                    borderColor: theme.colors.border,
                    backgroundColor: category === cat ? 'rgba(33,150,243,0.12)' : 'transparent'
                  }]}
                >
                  <Text style={{ color: category === cat ? theme.colors.primary : theme.colors.text }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Ghi chú (tuỳ chọn)"
              placeholderTextColor={theme.colors.textSecondary}
              value={note}
              onChangeText={setNote}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />

            <View style={[styles.row, { marginVertical: 10 }]}>
              {intervals.map(intv => (
                <TouchableOpacity
                  key={intv}
                  onPress={() => setInterval(intv)}
                  style={[styles.chip, {
                    borderColor: theme.colors.primary,
                    backgroundColor: interval === intv ? 'rgba(33,150,243,0.12)' : 'transparent'
                  }]}
                >
                  <Text style={{ color: interval === intv ? theme.colors.primary : theme.colors.text }}>
                    {intv === 'daily' ? 'Hàng ngày' : intv === 'weekly' ? 'Hàng tuần' : 'Hàng tháng'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowPicker(!showPicker)}
              activeOpacity={0.8}
              style={[styles.button, {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.border,
                justifyContent: 'center',
              }]}
            >
              <Text style={{ color: theme.colors.text }}>
                Ngày bắt đầu: {formatDate(nextRunAt)}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={new Date(nextRunAt)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (Platform.OS !== 'ios') setShowPicker(false);
                  if (date) {
                    const iso = date.toISOString().split('T')[0];
                    setNextRunAt(iso);
                  }
                }}
                themeVariant={theme.colors.theme === 'dark' ? 'dark' : 'light'}
              />
            )}

            {!!amount && (
              <View style={{ marginTop: 4 }}>
                <Text style={{ color: theme.colors.textSecondary }}>
                  Sẽ tạo: {formatCurrency(Number(amount || '0'))} / {interval === 'daily' ? 'ngày' : interval === 'weekly' ? 'tuần' : 'tháng'}
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.buttonText}>Lưu</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Danh sách</Text>
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <View style={[styles.item, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{item.category} • {item.interval}</Text>
                  <Text style={{ color: theme.colors.textSecondary, marginTop: 2 }}>Số tiền: {formatCurrency(item.amount)}</Text>
                  <Text style={{ color: theme.colors.textSecondary }}>Tiếp theo: {item.nextRunAt}</Text>
                </View>
                <TouchableOpacity onPress={() => dispatch(deleteRecurrence(item.id))} style={{ padding: 8 }}>
                  <Ionicons name="trash-outline" size={20} color={'#e63746'} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 12 }}>Chưa có giao dịch định kỳ</Text>}
            contentContainerStyle={{ paddingBottom: 24 }}
            style={{ marginBottom: 8 }}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 15,
    marginBottom: 8,
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  button: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '600' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
});

export default RecurringScreen;


