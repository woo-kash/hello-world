/**
 * VictoryScreen — post-mission celebration + lesson summary.
 * "Here's what you just learned!"
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function VictoryScreen({ route, navigation }) {
  const { mission, summary, attempts } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Celebration header */}
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.headline}>{summary.headline}</Text>
      <Text style={styles.subtext}>
        Solved in {attempts} {attempts === 1 ? 'try' : 'tries'}!
      </Text>

      {/* Badge earned */}
      <View style={styles.badgeCard}>
        <Text style={styles.badgeEmoji}>🏅</Text>
        <Text style={styles.badgeName}>{summary.badge}</Text>
        <Text style={styles.badgeDesc}>Badge earned!</Text>
      </View>

      {/* What you learned */}
      <View style={styles.lessonCard}>
        <Text style={styles.lessonTitle}>What you just learned:</Text>
        <Text style={styles.lessonText}>{summary.explanation}</Text>
      </View>

      {/* Real world example */}
      <View style={styles.realWorldCard}>
        <Text style={styles.realWorldTitle}>In the real world...</Text>
        <Text style={styles.realWorldText}>{summary.realWorldExample}</Text>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => navigation.navigate('MissionSelect')}
      >
        <Text style={styles.nextBtnText}>Next Mission ▶</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.replayBtn}
        onPress={() => navigation.navigate('MissionScreen', { mission, difficulty: 'easy' })}
      >
        <Text style={styles.replayBtnText}>Play Again</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5B4FE9' },
  content: { alignItems: 'center', padding: 24, paddingTop: 48 },
  emoji: { fontSize: 64, marginBottom: 12 },
  headline: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtext: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 24 },
  badgeCard: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  badgeEmoji: { fontSize: 40, marginBottom: 6 },
  badgeName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  badgeDesc: { color: '#666', fontSize: 13 },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    marginBottom: 14,
  },
  lessonTitle: { fontWeight: 'bold', color: '#5B4FE9', fontSize: 14, marginBottom: 6 },
  lessonText: { color: '#333', fontSize: 15, lineHeight: 22 },
  realWorldCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    marginBottom: 28,
  },
  realWorldTitle: { fontWeight: 'bold', color: '#fff', fontSize: 14, marginBottom: 6 },
  realWorldText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20 },
  nextBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  nextBtnText: { color: '#5B4FE9', fontWeight: 'bold', fontSize: 16 },
  replayBtn: { paddingVertical: 10 },
  replayBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
});
