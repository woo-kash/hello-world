/**
 * StarGameView — animated 5-star night sky for the "Light Up the Stars" mission.
 * Stars light up one by one on success, stay dark on failure.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// Classic 5-pointed star (100×100 viewBox)
const STAR_PATH = 'M 50 5 L 61.8 35.5 L 95.1 35.5 L 67.6 54.9 L 79.4 85.4 L 50 66 L 20.6 85.4 L 32.4 54.9 L 4.9 35.5 L 38.2 35.5 Z';

// Slight arc: middle star sits highest
const ARC_OFFSETS = [18, 7, 0, 7, 18];

// Small background twinkles to make the sky feel alive
const TWINKLES = [
  { x: '8%',  y: '12%', r: 1.5 },
  { x: '20%', y: '28%', r: 1 },
  { x: '78%', y: '10%', r: 2 },
  { x: '88%', y: '30%', r: 1.2 },
  { x: '14%', y: '60%', r: 1 },
  { x: '90%', y: '65%', r: 1.5 },
  { x: '50%', y: '8%',  r: 1 },
  { x: '60%', y: '72%', r: 1.2 },
];

function AnimatedStar({ success, index }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setIsLit(true);
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.7, duration: 150, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 3, tension: 50, useNativeDriver: true }),
        ]).start();
      }, index * 380);
      return () => clearTimeout(timer);
    } else {
      setIsLit(false);
      scale.setValue(1);
    }
  }, [success]);

  return (
    <Animated.View
      style={[
        styles.starWrapper,
        isLit && styles.starGlow,
        { marginTop: ARC_OFFSETS[index], transform: [{ scale }] },
      ]}
    >
      <Svg width={54} height={54} viewBox="0 0 100 100">
        <Path
          d={STAR_PATH}
          fill={isLit ? '#FFD700' : '#1E1E3F'}
          stroke={isLit ? '#F5A623' : '#3D3D6B'}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* Inner shimmer on lit stars */}
        {isLit && (
          <Circle cx="50" cy="45" r="10" fill="rgba(255,255,255,0.25)" />
        )}
      </Svg>
    </Animated.View>
  );
}

export default function StarGameView({ success }) {
  const [litCount, setLitCount] = useState(0);

  useEffect(() => {
    if (success) {
      setLitCount(0);
      [0, 1, 2, 3, 4].forEach(i =>
        setTimeout(() => setLitCount(i + 1), i * 380 + 60)
      );
    } else {
      setLitCount(0);
    }
  }, [success]);

  const allLit = litCount === 5;

  return (
    <View style={styles.container}>
      {/* Sky label */}
      <Text style={styles.skyLabel}>🌙  N I G H T  S K Y</Text>

      {/* Background twinkle dots */}
      <View style={styles.twinkleLayer} pointerEvents="none">
        {TWINKLES.map((t, i) => (
          <View
            key={i}
            style={[styles.twinkle, { left: t.x, top: t.y, width: t.r * 2, height: t.r * 2, borderRadius: t.r }]}
          />
        ))}
      </View>

      {/* Stars */}
      <View style={styles.starsRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <AnimatedStar key={i} success={success} index={i} />
        ))}
      </View>

      {/* Counter pill */}
      <View style={[styles.counterPill, allLit && styles.counterPillWin]}>
        <Text style={styles.counterText}>
          {allLit ? '✨  All 5 stars lit!  ✨' : `${litCount} / 5 stars lit`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B0B22',
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginVertical: 14,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#5B4FE9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  skyLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 22,
  },
  twinkleLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  twinkle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 24,
  },
  starWrapper: {
    // base — no shadow
  },
  starGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 18,
    elevation: 14,
  },
  counterPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  counterPillWin: {
    backgroundColor: 'rgba(255,215,0,0.18)',
    borderColor: '#FFD700',
  },
  counterText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
