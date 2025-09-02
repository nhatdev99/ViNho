import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Xin chào đến với Vi Nhỏ!</Text>
      <Link href="/add-expense" style={{ marginTop: 20, color: 'blue' }}>
        Thêm chi tiêu mới
      </Link>
    </View>
  );
}
