/**
 * Daily Grocery Expense Tracker
 * Premium React Native App
 */

import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';

import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n';

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#0F0F1A"
            translucent={false}
          />
          <AppNavigator />
          <Toast />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
