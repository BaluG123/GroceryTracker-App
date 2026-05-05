import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store';
import { checkStoredAuth } from '../store/slices/authSlice';
import { loadSettings } from '../store/slices/settingsSlice';
import i18n from '../i18n';
import { darkColors, lightColors } from '../theme/colors';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import BootLoader from '../components/common/BootLoader';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

const RootStack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, mode, isAuthChecked } = useAppSelector((state: RootState) => state.auth);
  const { theme, language, isLoaded: isSettingsLoaded, hasSelectedLanguage } = useAppSelector((state: RootState) => state.settings);
  const colors = theme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    dispatch(loadSettings());
    dispatch(checkStoredAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isSettingsLoaded) {
      i18n.changeLanguage(language);
    }
  }, [isSettingsLoaded, language]);

  if (!isAuthChecked || !isSettingsLoaded) {
    return <BootLoader theme={theme} />;
  }

  if (!hasSelectedLanguage) {
    return <LanguageSelectionScreen />;
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
