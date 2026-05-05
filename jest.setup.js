jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Mock = ({ children }) => React.createElement(View, null, children);

  return {
    __esModule: true,
    default: Mock,
    Svg: Mock,
    Defs: Mock,
    LinearGradient: Mock,
    Path: Mock,
    Rect: Mock,
    Stop: Mock,
    Circle: Mock,
  };
});

jest.mock('react-native-toast-message', () => 'Toast');

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: ({ children }) => React.createElement(View, null, children),
    Swipeable: ({ children }) => React.createElement(View, null, children),
  };
});

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  useNetInfo: jest.fn(() => ({ isConnected: true, isInternetReachable: true })),
}));

jest.mock('react-native-chart-kit', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    LineChart: () => React.createElement(View),
    PieChart: () => React.createElement(View),
    BarChart: () => React.createElement(View),
  };
});

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
