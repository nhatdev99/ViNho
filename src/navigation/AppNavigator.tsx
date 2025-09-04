import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import StatsScreen from '../screens/StatsScreen';
import ToolsScreen from '../screens/ToolsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecurringScreen from '../screens/RecurringScreen';
import BudgetScreen from '../screens/BudgetScreen';

export type RootStackParamList = {
  Home: undefined;
  AddExpense: undefined;
  Budget: undefined;
  Recurring: undefined;
  ToolsHome: undefined;
};
export type RootTabParamList = {
  HomeTab: undefined;
  Stats: undefined;
  Tools: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{
    headerShown: false
  }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen 
      name="Budget" 
      component={BudgetScreen} 
      options={{
        presentation: 'modal',
        headerShown: false,
      }}
    />
    <Stack.Screen 
      name="AddExpense" 
      component={AddExpenseScreen} 
      options={{
        presentation: 'modal',
        headerShown: false
      }}
    />
  </Stack.Navigator>
);

const ToolsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ToolsHome" component={ToolsScreen} />
    <Stack.Screen
      name="Recurring"
      component={RecurringScreen}
      options={{ presentation: 'modal', headerShown: false }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Stats') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Tools') {
              iconName = focused ? 'construct' : 'construct-outline';
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
          tabBarShowLabel: true,
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            title: 'Trang chủ',
            tabBarLabel: 'Trang chủ',
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
          name="Tools"
          component={ToolsStack}
          options={{
            title: 'Công cụ',
            tabBarLabel: 'Công cụ',
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
