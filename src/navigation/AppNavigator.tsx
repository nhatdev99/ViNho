import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type RootTabParamList = {
  HomeTab: undefined;
  AddExpense: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator = () => {
  const { theme, colorScheme } = useTheme();
  const Stack = createNativeStackNavigator();

  const HomeStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'AddExpense') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Stats') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
            shadowColor: 'transparent',
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            color: theme.colors.text,
          },
          tabBarShowLabel: true,
        })}
      >
        {/* <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'Trang chủ',
            tabBarLabel: 'Trang chủ',
          }} 
        /> */}
        <Tab.Screen
          name="HomeTab"

          component={HomeStack}
          options={{
            title: 'Thêm chi tiêu',
            tabBarLabel: 'Thêm',
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: 'Thống kê',
            tabBarLabel: 'Thống kê',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Cài đặt',
            tabBarLabel: 'Cài đặt',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
