import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Vi Nhỏ' }} />
      <Stack.Screen name="add-expense" options={{ title: 'Thêm chi tiêu' }} />
    </Stack>
  );
}
