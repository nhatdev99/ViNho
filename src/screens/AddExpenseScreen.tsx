// Màn hình thêm giao dịch dưới dạng hội thoại.
// Quản lý các bước: chọn loại, nhập số tiền, lý do,
// xác nhận và hỗ trợ thiết lập hạn mức tháng.
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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useAppDispatch } from '../store';
import { addNewExpense } from '../store/expensesSlice';
import { useAppSelector } from '../store';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/format';
import Message from '../components/Message';

type TransactionType = 'expense' | 'income';

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  type: 'text' | 'transactionType' | 'amount' | 'reason' | 'confirm';
};

const categories = [
  'Ăn uống', 'Di chuyển', 'Nhà ở', 'Tiện ích',
  'Mua sắm', 'Giải trí', 'Y tế', 'Giáo dục', 'Khác'
];

// Component chính của màn hình thêm giao dịch
const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  // Destructure để code gọn hơn, dễ đọc
  const { colors } = theme;
  const budgets = useAppSelector((state) => state.budgets.items);
  const { settings } = useAppSelector((state) => state.settings);
  const flatListRef = useRef<FlatList>(null);
  // Sinh id tăng dần, đảm bảo duy nhất và ổn định cho FlatList
  const idCounter = useRef<number>(0);
  const nextId = () => `${++idCounter.current}`;

  // State quản lý loại giao dịch (chi/thu)
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense');
  // Danh sách tin nhắn hội thoại hiển thị trong FlatList
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      text: 'Xin chào! Bạn muốn thêm giao dịch mới chứ?',
      isUser: false,
      type: 'text',
    },
    {
      id: nextId(),
      text: 'Đây là khoản thu hay chi?',
      isUser: false,
      type: 'transactionType',
    },
  ]);

  // Giá trị người dùng nhập (số tiền / lý do / hạn mức)
  const [inputValue, setInputValue] = useState('');
  // Bước hiện tại của hội thoại
  const [currentStep, setCurrentStep] = useState<
    'transactionType' | 'amount' | 'reason' | 'confirm'
  >('transactionType');
  const [expenseData, setExpenseData] = useState({
    amount: '',
    reason: ''
  });
  // Trạng thái gửi/xử lý để disable nút, tránh double submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tự động cuộn xuống khi có tin nhắn mới xuất hiện
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Chọn loại giao dịch: 'expense' hoặc 'income'
  const handleTransactionTypeSelect = (type: TransactionType) => {
    setTransactionType(type);
    const typeText = type === 'expense' ? 'chi' : 'thu';

    setMessages(prev => [
      ...prev,
      {
        id: nextId(),
        text: type === 'expense' ? 'Chi' : 'Thu',
        isUser: true,
        type: 'transactionType',
      },
      {
        id: nextId(),
        text: `Bạn đã ${typeText} bao nhiêu tiền?`,
        isUser: false,
        type: 'amount',
      },
    ]);
    setCurrentStep('amount');
  };

  // Đã bỏ thiết lập hạn mức khỏi màn hình này

  // Xử lý gửi tin nhắn theo bước hiện tại
  const handleSend = () => {
    if (!inputValue.trim() && currentStep !== 'transactionType') return;

    const userMessage: ChatMessage = {
      id: nextId(),
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
            id: nextId(),
            text: '❌ Số tiền không hợp lệ. Vui lòng nhập lại số tiền lớn hơn 0.',
            isUser: false,
            type: 'amount',
          },
        ]);
        setInputValue('');
        return;
      }
      setExpenseData(prev => ({ ...prev, amount }));
      // Cảnh báo nhanh theo tổng ngân sách tháng
      const monthKey = new Date().toISOString().slice(0, 7);
      const monthBudget = budgets.find((b: any) => b.monthKey === monthKey);
      if (monthBudget?.totalLimit) {
        const projected = Number(amount); // chỉ dựa vào khoản hiện tại
        if (projected >= monthBudget.totalLimit * 0.9) {
          setMessages(prev => [
            ...prev,
            {
              id: nextId(),
              text: '⚠️ Khoản này có thể khiến bạn vượt ngân sách tháng.',
              isUser: false,
              type: 'text',
            },
          ]);
        }
      }
      setMessages(prev => [
        ...prev,
        {
          id: nextId(),
          text: `Đã ghi nhận số tiền ${formatCurrency(
            Number(amount), settings.currency
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
          id: nextId(),
          text: `Bạn chắc chắn muốn thêm khoản chi ${formatCurrency(
            Number(expenseData.amount), settings.currency
          )} cho "${inputValue}" chứ?`,
          isUser: false,
          type: 'confirm',
        },
      ]);
      setCurrentStep('confirm');
    }

    setInputValue('');
  };

  // Reset về trạng thái ban đầu của hội thoại
  const resetState = () => {
    setInputValue('');
    setTransactionType('expense');
    setCurrentStep('transactionType');
    setExpenseData(prev => ({ ...prev, amount: '', reason: '' }));
    setMessages([
      {
        id: nextId(),
        text: 'Xin chào! Bạn muốn thêm giao dịch mới chứ?',
        isUser: false,
        type: 'text',
      },
      {
        id: nextId(),
        text: 'Đây là khoản thu hay chi?',
        isUser: false,
        type: 'transactionType',
      },
    ]);
  };

  // Quay lại màn trước và reset hội thoại
  const handleBack = () => {
    resetState();
    navigation.goBack();
  };

  // Xác nhận và lưu giao dịch vào store
  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);

      // Tạo payload đúng kiểu: Omit<Expense, 'id' | 'createdAt'>
      const categoryFromReason = categories.includes(expenseData.reason)
        ? expenseData.reason
        : 'Khác';
      
      // Số tiền âm cho chi tiêu, dương cho thu nhập
      const finalAmount = transactionType === 'expense' 
        ? -Math.abs(Number(expenseData.amount))
        : Math.abs(Number(expenseData.amount));
        
      const newExpensePayload = {
        amount: finalAmount,
        category: categoryFromReason,
        note: expenseData.reason || '',
        date: new Date().toISOString(),
        currency: settings.currency,
      };

      await dispatch(addNewExpense(newExpensePayload)).unwrap();

      console.log('addedExpensePayload', newExpensePayload);

      setMessages(prev => [
        ...prev,
        {
          id: nextId(),
          text: `✅ Đã thêm khoản ${transactionType === 'expense' ? 'chi' : 'thu'} ${formatCurrency(
            Math.abs(finalAmount), settings.currency
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
          id: nextId(),
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

  // Render từng dòng tin nhắn trong FlatList
  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'transactionType' && !item.isUser) {
      return (
        <View style={styles.transactionTypeContainer}>
          <TouchableOpacity
            style={[
              styles.transactionTypeButton,
              transactionType === 'expense' && styles.transactionTypeButtonActive,

            ]}
            onPress={() => handleTransactionTypeSelect('expense')}
          >
            <Text style={[
              styles.transactionTypeText,
              transactionType === 'expense' && styles.transactionTypeTextActive
            ]}>
              Chi tiêu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.transactionTypeButton,
              transactionType === 'income' && styles.transactionTypeButtonActive
            ]}
            onPress={() => handleTransactionTypeSelect('income')}
          >
            <Text style={[
              styles.transactionTypeText,
              transactionType === 'income' && styles.transactionTypeTextActive
            ]}>
              Thu nhập
            </Text>
          </TouchableOpacity>
          {/* Đã chuyển tính năng hạn mức sang BudgetScreen */}
        </View>
      );
    }

    return <Message text={item.text} isUser={item.isUser} />;
  }

  // Khu vực input dưới cùng: hiển thị theo từng bước
  const renderInput = () => {
    if (currentStep === 'reason') {
      return (
        <View style={styles.categoriesContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, { backgroundColor: '#f0f0f0' }]}
              onPress={() => {
                setExpenseData(prev => ({ ...prev, reason: cat }));
                setMessages(prev => [
                  ...prev,
                  {
                    id: nextId(),
                    text: cat,
                    isUser: true,
                    type: 'reason',
                  },
                  {
                    id: nextId(),
                    text: `Bạn chắc chắn muốn thêm khoản chi ${formatCurrency(
                      Number(expenseData.amount), settings.currency
                    )} cho "${cat}" chứ?`,
                    isUser: false,
                    type: 'confirm',
                  },
                ]);
                setCurrentStep('confirm');
              }}
            >
              <Text style={{ color: '#000' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (currentStep === 'confirm') {
      return (
        <View style={styles.confirmButtonsContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: '#34C759' }]}
            onPress={handleConfirm}
            disabled={isSubmitting}
          >
            <Text style={styles.confirmButtonText}>Có</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: '#FF3B30' }]}
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
      <View style={[styles.inputContainer, { backgroundColor: '#f0f0f0' }]}>
        <TextInput
          style={[
            styles.input,
            {
              color: '#000',
              backgroundColor: '#fff',
              borderColor: '#ccc',
            },
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Nhập số tiền..."
          placeholderTextColor="#ccc"
          onSubmitEditing={handleSend}
          editable={!isSubmitting}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputValue.trim() ? '#007AFF' : '#ccc',
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





  // Đã bỏ cảnh báo theo hạn mức tại đây, chuyển sang BudgetScreen/Home

  // Giao diện chính: header, danh sách tin nhắn và input
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Thêm giao dịch mới
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
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
      </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Styles tách riêng giúp tái sử dụng và dễ bảo trì
const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16 },
  transactionTypeContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  transactionTypeButton: {
    paddingHorizontal: 20,
    marginTop: 5,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  transactionTypeButtonActive: {
    backgroundColor: '#02c59b',
  },
  transactionTypeText: {
    fontSize: 16,
    color: '#666',
  },
  transactionTypeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
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
  title: { fontSize: 18, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
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
