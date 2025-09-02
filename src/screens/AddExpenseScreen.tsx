import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useAppDispatch } from '../store';
import { addNewExpense } from '../store/expensesSlice';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/format';
import Message from '../components/Message';

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  type: 'text' | 'amount' | 'reason' | 'confirm';
};

const categories = [
  'Ăn uống', 'Di chuyển', 'Nhà ở', 'Tiện ích',
  'Mua sắm', 'Giải trí', 'Y tế', 'Giáo dục', 'Khác'
];


const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Xin chào! Bạn muốn thêm khoản chi tiêu mới chứ?',
      isUser: false,
      type: 'text',
    },
    {
      id: '2',
      text: 'Bạn đã chi bao nhiêu tiền?',
      isUser: false,
      type: 'amount',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState<'amount' | 'reason' | 'confirm'>('amount');
  const [expenseData, setExpenseData] = useState({ amount: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      type: currentStep,
    };

    setMessages(prev => [...prev, userMessage]);

    if (currentStep === 'amount') {
      const amount = inputValue.replace(/[^0-9]/g, '');
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: '❌ Số tiền không hợp lệ. Vui lòng nhập lại số tiền lớn hơn 0.',
            isUser: false,
            type: 'amount',
          },
        ]);
        setInputValue('');
        return;
      }
      setExpenseData(prev => ({ ...prev, amount }));
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: `Đã ghi nhận số tiền ${formatCurrency(
            Number(amount)
          )}. Bạn chi vào việc gì vậy?`,
          isUser: false,
          type: 'reason',
        },
      ]);
      setCurrentStep('reason');
    } else if (currentStep === 'reason') {
      setExpenseData(prev => ({ ...prev, reason: inputValue }));
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: `Bạn chắc chắn muốn thêm khoản chi ${formatCurrency(
            Number(expenseData.amount)
          )} cho "${inputValue}" chứ?`,
          isUser: false,
          type: 'confirm',
        },
      ]);
      setCurrentStep('confirm');
    }

    setInputValue('');
  };

  const resetState = () => {
    setInputValue('');
    setCurrentStep('amount');
    setExpenseData({ amount: '', reason: '' });
    setMessages([
      {
        id: '1',
        text: 'Xin chào! Bạn muốn thêm khoản chi tiêu mới chứ?',
        isUser: false,
        type: 'text',
      },
      {
        id: '2',
        text: 'Bạn đã chi bao nhiêu tiền?',
        isUser: false,
        type: 'amount',
      },
    ]);
  };

  const handleBack = () => {
    resetState();
    navigation.goBack();
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);

      const newExpense = {
        amount: Number(expenseData.amount),
        category: 'Khác',
        note: expenseData.reason,
        date: new Date().toISOString().slice(0, 10),
      };

      await dispatch(addNewExpense(newExpense)).unwrap();

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `✅ Đã thêm khoản chi ${formatCurrency(
            Number(expenseData.amount)
          )} cho "${expenseData.reason}" thành công!`,
          isUser: false,
          type: 'text',
        },
      ]);

      // Reset ngay lập tức thay vì chờ 2 giây
      resetState();
      navigation.goBack();
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: '❌ Có lỗi xảy ra khi lưu khoản chi. Vui lòng thử lại!',
          isUser: false,
          type: 'text',
        },
      ]);
      console.error('Lỗi khi lưu khoản chi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderMessageItem = ({ item }: { item: ChatMessage }) => (
    <Message text={item.text} isUser={item.isUser} />
  );

  const renderInput = () => {
    if (currentStep === 'reason') {
      return (
        <View style={styles.categoriesContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                setExpenseData(prev => ({ ...prev, reason: cat }));
                setMessages(prev => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    text: cat,
                    isUser: true,
                    type: 'reason',
                  },
                  {
                    id: (Date.now() + 1).toString(),
                    text: `Bạn chắc chắn muốn thêm khoản chi ${formatCurrency(
                      Number(expenseData.amount)
                    )} cho "${cat}" chứ?`,
                    isUser: false,
                    type: 'confirm',
                  },
                ]);
                setCurrentStep('confirm');
              }}
            >
              <Text style={{ color: theme.colors.text }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (currentStep === 'confirm') {
      return (
        <View style={styles.confirmButtonsContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.colors.success }]}
            onPress={handleConfirm}
            disabled={isSubmitting}
          >
            <Text style={styles.confirmButtonText}>Có</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.colors.error }]}
            onPress={() => {
              resetState();
              navigation.goBack();
            }}
            disabled={isSubmitting}
          >
            <Text style={styles.confirmButtonText}>Không</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // amount step
    return (
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Nhập số tiền..."
          placeholderTextColor={theme.colors.textSecondary}
          onSubmitEditing={handleSend}
          editable={!isSubmitting}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputValue.trim() ? theme.colors.primary : '#ccc',
              opacity: isSubmitting ? 0.5 : 1,
            },
          ]}
          onPress={handleSend}
          disabled={isSubmitting || !inputValue.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Thêm chi tiêu</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {renderInput()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  title: { fontSize: 18, fontWeight: '600' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 80 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 6,
  },
  
});

export default AddExpenseScreen;
