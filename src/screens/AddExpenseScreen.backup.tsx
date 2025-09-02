import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { addNewExpense } from '../store/expensesSlice';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/format';
import Message from '../components/Message';
import { AppDispatch } from '../store';

// Định nghĩa kiểu dữ liệu cho tin nhắn
interface MessageType {
  id: string;
  text: string;
  isUser: boolean;
  type: 'text' | 'amount' | 'reason' | 'confirm' | 'budget';
}

type ExpenseData = {
  amount: string;
  reason: string;
  budget: string;
};

type RootStackParamList = {
  Home: undefined;
  AddExpense: undefined;
};

const AddExpenseScreen: React.FC = () => {
  // Khởi tạo các hook và ref
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList<MessageType>>(null);
  
  // State quản lý danh sách tin nhắn
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: 'Xin chào! Bạn muốn thêm khoản chi tiêu mới chứ?',
      isUser: false,
      type: 'text'
    },
    {
      id: '2',
      text: 'Bạn đã chi bao nhiêu tiền?',
      isUser: false,
      type: 'amount'
    },
  ]);
  
  // State quản lý giá trị input hiện tại
  const [inputValue, setInputValue] = useState('');
  
  // State quản lý bước hiện tại
  const [currentStep, setCurrentStep] = useState<'amount' | 'reason' | 'confirm'>('amount');
  
  // State lưu trữ thông tin chi tiêu
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    amount: '',
    reason: '',
    budget: ''
  });
  
  // State kiểm soát việc hiển thị input nhập hạn mức
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  
  // State kiểm soát trạng thái đang gửi dữ liệu
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sử dụng navigation với kiểu đã định nghĩa
  
  // Hàm kiểm tra số tiền hợp lệ
  const isValidAmount = (amount: string): boolean => {
    const amountNumber = Number(amount.replace(/[^0-9]/g, ''));
    return !isNaN(amountNumber) && amountNumber > 0;
  };
  
  // Hàm xử lý khi người dùng nhập số tiền
  const handleAmountInput = (text: string) => {
    const cleanedText = text.replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setInputValue(cleanedText);
  };

  // Xử lý bước nhập số tiền
  const handleAmountStep = useCallback(() => {
    if (!isValidAmount(inputValue)) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Số tiền không hợp lệ. Vui lòng nhập lại số tiền lớn hơn 0.',
          isUser: false,
          type: 'amount'
        }
      ]);
      return;
    }

    const amount = inputValue;
    setExpenseData(prev => ({ ...prev, amount }));
    
    // Kiểm tra nếu số tiền lớn hơn 1 triệu thì hỏi về hạn mức
    const amountNumber = Number(amount.replace(/[^0-9]/g, ''));
    if (amountNumber > 1000000) {
      setShowBudgetInput(true);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Bạn đã nhập số tiền ${formatCurrency(amountNumber)}. Bạn có muốn đặt hạn mức không?`,
          isUser: false,
          type: 'budget'
        }
      ]);
    } else {
      setCurrentStep('reason');
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Bạn chi vào việc gì vậy?',
          isUser: false,
          type: 'reason'
        }
      ]);
    }
    
    setInputValue('');
  }, [inputValue]);

  // Xử lý bước nhập lý do chi tiêu
  const handleReasonStep = useCallback(() => {
    if (!inputValue.trim()) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Vui lòng nhập lý do chi tiêu.',
          isUser: false,
          type: 'reason'
        }
      ]);
      return;
    }

    const reason = inputValue.trim();
    setExpenseData(prev => ({ ...prev, reason }));
    
    setCurrentStep('confirm');
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text: `Xác nhận thêm khoản chi ${formatCurrency(Number(expenseData.amount))} cho "${reason}"?`,
        isUser: false,
        type: 'confirm'
      }
    ]);
    
    setInputValue('');
  }, [inputValue, expenseData.amount]);

  // Xử lý xác nhận thêm chi tiêu
  const handleConfirmStep = useCallback(() => {
    const userInput = inputValue.trim().toLowerCase();
    if (userInput === 'có' || userInput === 'co' || userInput === 'ok' || userInput === 'yes' || userInput === 'y') {
      handleAddExpense();
    } else if (userInput === 'không' || userInput === 'khong' || userInput === 'no' || userInput === 'n') {
      resetState();
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Vui lòng nhập "Có" hoặc "Không" để xác nhận.',
          isUser: false,
          type: 'confirm'
        }
      ]);
    }
  }, [inputValue]);

  // Xử lý thêm chi tiêu mới
  const handleAddExpense = useCallback(async () => {
    if (!expenseData.amount || !expenseData.reason) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin chi tiêu.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const amount = Number(expenseData.amount.replace(/[^0-9]/g, ''));
      const budget = expenseData.budget ? Number(expenseData.budget.replace(/[^0-9]/g, '')) : 0;
      
      await dispatch(addNewExpense({
        id: Date.now().toString(),
        amount,
        reason: expenseData.reason,
        date: new Date().toISOString(),
        budget
      }));
      
      // Thông báo thành công
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Đã thêm khoản chi ${formatCurrency(amount)} cho "${expenseData.reason}" thành công!`,
          isUser: false,
          type: 'text'
        }
      ]);
      
      // Reset form sau 2 giây
      setTimeout(() => {
        resetState();
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi thêm chi tiêu:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi thêm chi tiêu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [expenseData, dispatch, navigation]);

  // Reset trạng thái về ban đầu
  const resetState = useCallback(() => {
    setInputValue('');
    setCurrentStep('amount');
    setExpenseData({ amount: '', reason: '', budget: '' });
    setShowBudgetInput(false);
    setMessages([
      {
        id: '1',
        text: 'Xin chào! Bạn muốn thêm khoản chi tiêu mới chứ?',
        isUser: false,
        type: 'text'
      },
      {
        id: '2',
        text: 'Bạn đã chi bao nhiêu tiền?',
        isUser: false,
        type: 'amount'
      },
    ]);
  }, []);

  // Xử lý khi nhấn nút quay lại
  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home' as never);
    }
  }, [navigation]);

  // Render mỗi tin nhắn trong danh sách
  const renderMessageItem = useCallback(({ item }: { item: MessageType }) => (
    <Message
      key={item.id}
      text={item.text}
      isUser={item.isUser}
      type={item.type}
    />
  ), []);

  // Render phần input phù hợp với từng bước
  const renderInput = useCallback(() => {
    if (showBudgetInput) {
      return (
        <View style={styles.budgetInputContainer}>
          <TextInput
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            value={inputValue}
            onChangeText={handleAmountInput}
            placeholder="Nhập hạn mức"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSend}
            disabled={!inputValue.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    if (currentStep === 'confirm') {
      return (
        <View style={styles.confirmButtonsContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.colors.success }]}
            onPress={() => {
              setInputValue('Có');
              handleSend();
            }}
          >
            <Text style={styles.confirmButtonText}>Có</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.colors.error }]}
            onPress={() => {
              setInputValue('Không');
              handleSend();
            }}
          >
            <Text style={styles.confirmButtonText}>Không</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
          value={inputValue}
          onChangeText={(text) => setInputValue(text)}
          placeholder={
            currentStep === 'amount' ? 'Nhập số tiền...' :
            currentStep === 'reason' ? 'Nhập lý do chi tiêu...' :
            'Nhập tin nhắn...'
          }
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: inputValue.trim() ? theme.colors.primary : theme.colors.disabled 
          }]}
          onPress={handleSend}
          disabled={!inputValue.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  }, [inputValue, currentStep, showBudgetInput, theme]);

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        Thêm chi tiêu mới
      </Text>
      <View style={styles.headerRight} />
    </View>
  );

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  /**
   * Xử lý khi người dùng gửi tin nhắn hoặc nhập thông tin
   */
  const handleSend = useCallback(() => {
    if (!inputValue.trim() && !showBudgetInput) return;
    
    // Tạo tin nhắn từ người dùng
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      type: currentStep
    };

    // Thêm tin nhắn vào danh sách
    setMessages(prev => [...prev, userMessage]);
    
    // Xử lý khi đang nhập hạn mức
    if (showBudgetInput) {
      handleBudgetInput();
      return;
    }
    
    // Xử lý theo từng bước
    switch (currentStep) {
      case 'amount':
        handleAmountStep();
        break;
      case 'reason':
        handleReasonStep();
        break;
      case 'confirm':
        handleConfirmStep();
        break;
    }
  }, [inputValue, currentStep, showBudgetInput, expenseData]);

  /**
   * Xử lý khi người dùng nhập hạn mức
   */
  const handleBudgetInput = useCallback(() => {
    const budget = inputValue.trim();
    
    // Cập nhật hạn mức nếu có
    if (budget) {
      setExpenseData(prev => ({ ...prev, budget }));
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Đã đặt hạn mức ${formatCurrency(Number(budget))}. Bạn chi vào việc gì vậy?`,
          isUser: false,
          type: 'reason'
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Bạn chi vào việc gì vậy?',
          isUser: false,
          type: 'reason'
        }
      ]);
    }
    
    // Reset trạng thái
    setShowBudgetInput(false);
    setCurrentStep('reason');
    setInputValue('');
  }, [inputValue]);

  /**
   * Xử lý bước nhập số tiền
   */
  const handleAmountStep = useCallback(() => {
    const amount = inputValue.replace(/[^0-9]/g, '');
    
    // Kiểm tra số tiền hợp lệ
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Số tiền không hợp lệ. Vui lòng nhập số tiền lớn hơn 0.',
          isUser: false,
          type: 'amount'
        }
      ]);
      return;
    }
    
    // Lưu số tiền
    setExpenseData(prev => ({ ...prev, amount }));
    
    // Kiểm tra nếu số tiền > 1 triệu thì hỏi về hạn mức
    if (Number(amount) > 1000000) {
      setShowBudgetInput(true);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: 'Bạn có muốn đặt hạn mức cho khoản chi này không? (Ví dụ: 2,000,000đ)',
          isUser: false,
          type: 'budget'
        }
      ]);
      setInputValue('');
      return;
    }
    
    // Chuyển sang bước tiếp theo nếu không cần đặt hạn mức
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 2).toString(),
        text: 'Bạn chi vào việc gì vậy?',
        isUser: false,
        type: 'reason'
      }
    ]);
    setCurrentStep('reason');
    setInputValue('');
  }, [inputValue]);

  /**
   * Xử lý bước nhập lý do
   */
  const handleReasonStep = useCallback(() => {
    const reason = inputValue.trim();
    
    // Kiểm tra lý do hợp lệ
    if (!reason) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Vui lòng nhập lý do chi tiêu.',
          isUser: false,
          type: 'reason'
        }
      ]);
      return;
    }
    
    // Lưu lý do và chuyển sang bước xác nhận
    setExpenseData(prev => ({ ...prev, reason }));
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 2).toString(),
        text: `Bạn chắc chắn muốn thêm khoản chi ${formatCurrency(Number(expenseData.amount))} cho "${reason}"${expenseData.budget ? ` với hạn mức ${formatCurrency(Number(expenseData.budget))}` : ''} chứ?`,
        isUser: false,
        type: 'confirm'
      }
    ]);
    setCurrentStep('confirm');
    setInputValue('');
  }, [inputValue, expenseData.amount, expenseData.budget]);

  /**
   * Xử lý bước xác nhận
   */
  const handleConfirmStep = useCallback(() => {
    if (inputValue.trim().toLowerCase() !== 'có') {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Vui lòng nhập "Có" để xác nhận hoặc nhập lại thông tin.',
          isUser: false,
          type: 'confirm'
        }
      ]);
      return;
    }
    
    // Gọi hàm xác nhận
    handleConfirm();
  }, [inputValue]);

  /**
   * Xác nhận và lưu chi tiêu
   */
  const handleConfirm = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // Tạo đối tượng chi tiêu mới
      const newExpense = {
        amount: Number(expenseData.amount),
        category: 'Khác',
        note: expenseData.reason,
        budget: expenseData.budget ? Number(expenseData.budget) : null,
        date: new Date().toISOString().slice(0, 10)
      };
      
      // Gọi API lưu chi tiêu
      await dispatch(addNewExpense(newExpense)).unwrap();
      
      // Thêm tin nhắn xác nhận
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `✅ Đã thêm khoản chi ${formatCurrency(Number(expenseData.amount))} cho "${expenseData.reason}" thành công!`,
          isUser: false,
          type: 'text'
        }
      ]);
      
      // Reset form sau 2 giây
      setTimeout(() => {
        resetState();
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi thêm chi tiêu:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: '❌ Có lỗi xảy ra khi lưu khoản chi. Vui lòng thử lại!',
          isUser: false,
          type: 'text'
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }, [expenseData, dispatch, navigation]);

  /**
   * Reset trạng thái về mặc định
   */
  const resetState = useCallback(() => {
    setInputValue('');
    setCurrentStep('amount');
    setExpenseData({ amount: '', reason: '', budget: '' });
    setMessages([
      {
        id: '1',
        text: 'Xin chào! Bạn muốn thêm khoản chi tiêu mới chứ?',
        isUser: false,
        type: 'text'
      },
      {
        id: '2',
        text: 'Bạn đã chi bao nhiêu tiền?',
        isUser: false,
        type: 'amount'

/**
 * Xác nhận và lưu chi tiêu
 */
const handleConfirm = useCallback(async () => {
try {
  setIsSubmitting(true);
  
  // Tạo đối tượng chi tiêu mới
  const newExpense = {
    amount: Number(expenseData.amount),
    category: 'Khác',
    note: expenseData.reason,
    budget: expenseData.budget ? Number(expenseData.budget) : null,
    date: new Date().toISOString().slice(0, 10)
  };
  
  // Gọi API lưu chi tiêu
  await dispatch(addNewExpense(newExpense)).unwrap();
  
  // Thêm tin nhắn xác nhận
  setMessages(prev => [
    ...prev,
    {
      id: (Date.now() + 1).toString(),
      text: `✅ Đã thêm khoản chi ${formatCurrency(Number(expenseData.amount))} cho "${expenseData.reason}" thành công!`,
      isUser: false,
      type: 'text'
    }
  ]);
  
  // Reset form sau 2 giây
  setTimeout(() => {
    resetState();
    navigation.goBack();
  }, 2000);
  
} catch (error) {
  console.error('Lỗi khi thêm chi tiêu:', error);
  setMessages(prev => [
    ...prev,
    {
      id: (Date.now() + 1).toString(),
      text: '❌ Có lỗi xảy ra khi lưu khoản chi. Vui lòng thử lại!',
      isUser: false,
      type: 'text'
    }
  ]);
} finally {
  setIsSubmitting(false);
}
}, [expenseData, dispatch, navigation]);

/**
 * Reset trạng thái về mặc định
 */
const resetState = useCallback(() => {
setInputValue('');
setCurrentStep('amount');
setExpenseData({ amount: '', reason: '', budget: '' });
setMessages([
  {
    id: '1',
    text: 'Xin chào! Bạn muốn thêm khoản chi tiêu mới chứ?',
    isUser: false,
    type: 'text'
  },
  {
    id: '2',
    text: 'Bạn đã chi bao nhiêu tiền?',
    isUser: false,
    type: 'amount'
  }
]);
}, []);

/**
 * Xử lý khi nhấn nút quay lại
 */
const handleBack = useCallback(() => {
resetState();
navigation.goBack();
}, [navigation, resetState]);

/**
 * Render mỗi tin nhắn trong danh sách
 */
const renderMessageItem = useCallback(({ item }: { item: MessageType }) => (
<Message 
  text={item.text} 
  isUser={item.isUser}
  style={{
    marginBottom: 8,
    marginTop: item.isUser ? 8 : 4,
  }}
/>
), []);

/**
 * Render ô nhập liệu
 */
const renderInput = useCallback(() => {
let placeholder = '';
let keyboardType: 'default' | 'numeric' = 'default';
  
if (showBudgetInput) {
  placeholder = 'Nhập hạn mức (để trống nếu không đặt)';
  keyboardType = 'numeric';
} else {
  switch (currentStep) {
    case 'amount':
      placeholder = 'Nhập số tiền...';
  /**
   * Render ô nhập liệu
   */
  const renderInput = useCallback(() => {
    let placeholder = '';
    let keyboardType: 'default' | 'numeric' = 'default';
    
    if (showBudgetInput) {
      placeholder = 'Nhập hạn mức (để trống nếu không đặt)';
      keyboardType = 'numeric';
    } else {
      switch (currentStep) {
        case 'amount':
          placeholder = 'Nhập số tiền...';
          keyboardType = 'numeric';
          break;
        case 'reason':
          placeholder = 'Nhập lý do chi tiêu...';
          break;
        case 'confirm':
          placeholder = 'Nhập "Có" để xác nhận...';
          break;
      }
    }
    
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border
            }
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          onSubmitEditing={handleSend}
          editable={!isSubmitting}
          keyboardType={keyboardType}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { 
              backgroundColor: (isSubmitting || !inputValue.trim()) ? '#ccc' : theme.colors.primary,
              opacity: (isSubmitting || !inputValue.trim()) ? 0.6 : 1
            }
          ]} 
          onPress={handleSend}
          disabled={isSubmitting || !inputValue.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
    );
  }, [
    showBudgetInput, 
    currentStep, 
    inputValue, 
    isSubmitting, 
    theme.colors.text, 
    theme.colors.background, 
    theme.colors.border, 
    theme.colors.textSecondary,
    theme.colors.primary,
    handleSend
  ]);

  // Xử lý khi người dùng nhấn nút gửi
  const handleSend = useCallback(() => {
    if (!inputValue.trim() && !showBudgetInput) return;
    
    // Thêm tin nhắn của người dùng
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      type: currentStep
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Xử lý theo từng bước
    if (showBudgetInput) {
      handleBudgetInput();
    } else {
      switch (currentStep) {
        case 'amount':
          handleAmountStep();
          break;
        case 'reason':
          handleReasonStep();
          break;
        case 'confirm':
          handleConfirmStep();
          break;
      }
    }
  }, [
    inputValue, 
    currentStep, 
    showBudgetInput, 
    handleBudgetInput, 
    handleAmountStep, 
    handleReasonStep, 
    handleConfirmStep
  ]);

  // Render giao diện chính
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Thêm chi tiêu
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Ô nhập liệu */}
      <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background }]}>
        {renderInput()}
      </View>
    </SafeAreaView>
  );
};

};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
  },
  inputWrapper: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddExpenseScreen;
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: 'Bạn chi vào việc gì vậy?',
            isUser: false,
            type: 'reason'
          }
        ]);
      }
      setShowBudgetInput(false);
      setCurrentStep('reason');
      setInputValue('');
      return;
    }
    
    // Xử lý các bước thông thường
    if (currentStep === 'amount') {
      const amount = inputValue.replace(/[^0-9]/g, '');
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: 'Số tiền không hợp lệ. Vui lòng nhập số tiền lớn hơn 0.',
            isUser: false,
            type: 'amount'
          }
        ]);
        return;
      }
      
      setExpenseData(prev => ({ ...prev, amount }));
      
      // Kiểm tra nếu số tiền > 1 triệu thì hỏi về hạn mức
      if (Number(amount) > 1000000) {
        setShowBudgetInput(true);
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            text: 'Bạn có muốn đặt hạn mức cho khoản chi này không? (Ví dụ: 2,000,000đ)',
            isUser: false,
            type: 'budget'
          }
        ]);
        setInputValue('');
        return;
      }
      
      // Nếu không cần đặt hạn mức, chuyển sang bước tiếp theo
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: 'Bạn chi vào việc gì vậy?',
          isUser: false,
          type: 'reason'
        }
      ]);
      setCurrentStep('reason');
      
    } else if (currentStep === 'reason') {
      if (!inputValue.trim()) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: 'Vui lòng nhập lý do chi tiêu.',
            isUser: false,
            type: 'reason'
          }
        ]);
        return;
      }
      
      setExpenseData(prev => ({ ...prev, reason: inputValue }));
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: `Bạn chắc chắn muốn thêm khoản chi ${formatCurrency(Number(expenseData.amount))} cho "${inputValue}"${expenseData.budget ? ` với hạn mức ${formatCurrency(Number(expenseData.budget))}` : ''} chứ?`,
          isUser: false,
          type: 'confirm'
        }
      ]);
      setCurrentStep('confirm');
      
    } else if (currentStep === 'confirm') {
      if (inputValue.trim().toLowerCase() !== 'có') {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: 'Vui lòng nhập "Có" để xác nhận hoặc nhập lại thông tin.',
            isUser: false,
            type: 'confirm'
          }
        ]);
        return;
      }
      
      handleConfirm();
      return;
    }
    
    setInputValue('');
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      
      const newExpense = {
        amount: Number(expenseData.amount),
        category: 'Khác',
        note: expenseData.reason,
        budget: expenseData.budget ? Number(expenseData.budget) : null,
        date: new Date().toISOString().slice(0, 10)
      };
      
      await dispatch(addNewExpense(newExpense)).unwrap();
      
      // Thêm tin nhắn xác nhận
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `✅ Đã thêm khoản chi ${formatCurrency(Number(expenseData.amount))} cho "${expenseData.reason}" thành công!`,
          isUser: false,
          type: 'text'
        }
      ]);
      
      // Reset form sau 2 giây
      setTimeout(() => {
        resetState();
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error('Error adding expense:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: '❌ Có lỗi xảy ra khi lưu khoản chi. Vui lòng thử lại!',
          isUser: false,
          type: 'text'
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setInputValue('');
    setCurrentStep('amount');
    setExpenseData({ amount: '', reason: '', budget: '' });
    setMessages([
      {
        id: '1',
        text: 'Xin chào! Bạn muốn thêm khoản chi tiêu mới chứ?',
        isUser: false,
        type: 'text'
      },
      {
        id: '2',
        text: 'Bạn đã chi bao nhiêu tiền?',
        isUser: false,
        type: 'amount'
      }
    ]);
  };

  const handleBack = () => {
    resetState();
    navigation.goBack();
  };

  const renderMessageItem = ({ item }: { item: MessageType }) => (
    <Message 
      text={item.text} 
      isUser={item.isUser}
      style={{
        marginBottom: 8,
        marginTop: item.isUser ? 8 : 4,
      }}
    />
  );

  const renderInput = () => {
    let placeholder = '';
    let keyboardType: 'default' | 'numeric' = 'default';
    
    if (showBudgetInput) {
      placeholder = 'Nhập hạn mức (để trống nếu không đặt)';
      keyboardType = 'numeric';
    } else {
      switch (currentStep) {
        case 'amount':
          placeholder = 'Nhập số tiền...';
          keyboardType = 'numeric';
          break;
        case 'reason':
          placeholder = 'Nhập lý do chi tiêu...';
          break;
        case 'confirm':
          placeholder = 'Nhập "Có" để xác nhận...';
          break;
      }
    }
    
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border
            }
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          onSubmitEditing={handleSend}
          editable={!isSubmitting}
          keyboardType={keyboardType}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { 
              backgroundColor: (isSubmitting || !inputValue.trim()) ? '#ccc' : theme.colors.primary,
              opacity: (isSubmitting || !inputValue.trim()) ? 0.6 : 1
            }
          ]} 
          onPress={handleSend}
          disabled={isSubmitting || !inputValue.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {/* Ô nhập liệu */}
      <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card }]}>
        {renderInput()}
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddExpenseScreen;
