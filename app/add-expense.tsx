import { View, Text, TextInput, Button } from 'react-native';
import { Link } from 'expo-router';

export default function AddExpenseScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Thêm khoản chi</Text>
      
      <TextInput
        placeholder="Số tiền"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        keyboardType="numeric"
      />
      
      <TextInput
        placeholder="Danh mục"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Ghi chú"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, minHeight: 100 }}
        multiline
      />
      
      <Button title="Lưu" onPress={() => {}} />
      
      <Link href="/" style={{ marginTop: 20, color: 'blue', textAlign: 'center' }}>
        Quay lại trang chủ
      </Link>
    </View>
  );
}
