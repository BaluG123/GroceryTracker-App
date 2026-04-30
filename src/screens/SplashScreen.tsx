import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

type Nav = StackNavigationProp<AuthStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, logoScale, logoOpacity, taglineOpacity, taglineTranslate]);

  return (
    <LinearGradient
      colors={['#0F0F1A', '#1A1A3E', '#0F0F1A']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={['#6C63FF', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <Text style={styles.logoIcon}>🛒</Text>
        </LinearGradient>
        <Text style={styles.appName}>Grocery{'\n'}Tracker</Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineTranslate }],
        }}
      >
        <Text style={styles.tagline}>Track Every Rupee. Save Smarter.</Text>
      </Animated.View>

      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: logoOpacity,
                backgroundColor: i === 1 ? '#6C63FF' : '#3B3B5E',
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    ...typography.hero,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    ...typography.body,
    color: '#8B8BA7',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 60,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SplashScreen;
