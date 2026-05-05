import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store';
import { checkStoredAuth } from '../store/slices/authSlice';
import { loadSettings } from '../store/slices/settingsSlice';
import { darkColors, lightColors } from '../theme/colors';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import BootLoader from '../components/common/BootLoader';

const RootStack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, mode, isAuthChecked } = useAppSelector((state: RootState) => state.auth);
  const theme = useAppSelector((state: RootState) => state.settings.theme);
  const colors = theme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    dispatch(loadSettings());
    dispatch(checkStoredAuth());
  }, [dispatch]);

  if (!isAuthChecked) {
    return <BootLoader theme={theme} />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme === 'dark',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.danger,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {token || mode === 'guest' ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
