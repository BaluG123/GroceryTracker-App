import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Rect, Stop, Circle } from 'react-native-svg';

import { typography } from '../../theme/typography';

interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  color?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 88,
  showWordmark = true,
  subtitle,
  color = '#F8FAFC',
}) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 88 88">
        <Defs>
          <SvgGradient id="brandGradient" x1="10%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF7A59" />
            <Stop offset="55%" stopColor="#FFB703" />
            <Stop offset="100%" stopColor="#3A86FF" />
          </SvgGradient>
        </Defs>
        <Rect x="6" y="6" width="76" height="76" rx="26" fill="#111827" />
        <Rect x="10" y="10" width="68" height="68" rx="22" fill="url(#brandGradient)" />
        <Path
          d="M24 52c0-10.493 8.507-19 19-19h11.5"
          stroke="#FFF7ED"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M56 27.5c5.799 0 10.5 4.701 10.5 10.5S61.799 48.5 56 48.5H43.5"
          stroke="#0F172A"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx="58.5" cy="28" r="7.5" fill="#FFF7ED" />
        <Path
          d="M56 24.5v7M52.5 28h7"
          stroke="#F97316"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </Svg>

      {showWordmark ? (
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color }]}>Piko</Text>
          {subtitle ? <Text style={[styles.subtitle, { color }]}>{subtitle}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  textWrap: {
    alignItems: 'center',
    marginTop: 14,
  },
  title: {
    ...typography.hero,
    letterSpacing: 1.4,
  },
  subtitle: {
    ...typography.captionBold,
    opacity: 0.72,
    marginTop: 4,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});

export default BrandLogo;
