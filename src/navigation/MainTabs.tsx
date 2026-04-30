import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { MainTabParamList } from './types';
import { useAppSelector } from '../store/hooks';
import { darkColors, lightColors } from '../theme/colors';
import { typography } from '../theme/typography';

import DashboardScreen from '../screens/DashboardScreen';
import ItemsScreen from '../screens/ItemsScreen';
import AddPurchaseScreen from '../screens/AddPurchaseScreen';
import ReportsScreen from '../screens/ReportsScreen';
import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ReportsStack = createStackNavigator();

const ReportsStackScreen: React.FC = () => (
  <ReportsStack.Navigator screenOptions={{ headerShown: false }}>
    <ReportsStack.Screen name="ReportsMain" component={ReportsScreen} />
    <ReportsStack.Screen name="PurchaseHistoryDetail" component={PurchaseHistoryScreen} />
  </ReportsStack.Navigator>
);

const TAB_ICONS: Record<string, string> = {
  Dashboard: '🏠',
  Items: '📦',
  AddPurchase: '➕',
  Reports: '📊',
  Profile: '👤',
};

const CenterTabButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.centerButton}>
    <LinearGradient
      colors={['#6C63FF', '#3B82F6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.centerGradient}
    >
      <Text style={styles.centerIcon}>+</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppSelector(state => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          ...typography.small,
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => {
          const iconSize = route.name === 'AddPurchase' ? 0 : 22;
          return (
            <Text style={{ fontSize: iconSize, opacity: focused ? 1 : 0.6 }}>
              {TAB_ICONS[route.name]}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: t('home') }}
      />
      <Tab.Screen
        name="Items"
        component={ItemsScreen}
        options={{ tabBarLabel: t('items') }}
      />
      <Tab.Screen
        name="AddPurchase"
        component={AddPurchaseScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => (
            <CenterTabButton onPress={() => props.onPress?.(undefined as any)} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStackScreen}
        options={{ tabBarLabel: t('reports') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centerButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
});

export default MainTabs;
