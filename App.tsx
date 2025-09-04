import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from './src/store';
import { loadSettings } from './src/store/settingsSlice';
import { fetchExpenses } from './src/store/expensesSlice';
import { ThemeProvider, useTheme } from './src/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import AuthWrapper from './src/components/AuthWrapper';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <AppContent />
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { colorScheme } = useTheme();
  
  useEffect(() => {
    // Load dữ liệu ban đầu
    dispatch(loadSettings());
    dispatch(fetchExpenses());
  }, [dispatch]);

  return (
    <AuthWrapper>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </AuthWrapper>
  );
}
