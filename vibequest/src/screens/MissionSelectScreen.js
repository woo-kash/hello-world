/**
 * MissionSelectScreen — adaptive mission picker.
 * Shows missions by difficulty with progress tracking.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView,
} from 'react-native';
import { STARTER_MISSIONS } from '../missions/sampleMissions';
import useProgressStore from '../utils/progressStore';

const DIFFICULTY_TABS = ['easy', 'medium', 'hard'];

const DIFFICULTY_COLORS = {
  easy: '#27AE60',
  medium: '#F39C12',
  hard: '#E74C3C',
};

export default function MissionSelectScreen({ navigation }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const { completedMissions, unlockedDifficulties } = useProgressStore();

  const missions = STARTER_MISSIONS.filter(m => m.difficulty === selectedDifficulty);

  function handleMissionPress(mission) {
    navigation.navigate('MissionScreen', { mission, difficulty: selectedDifficulty });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Your Mission</Text>

      {/* Difficulty tabs */}
      <View style={styles.tabRow}>
        {DIFFICULTY_TABS.map(diff => (
          <TouchableOpacity
            key={diff}
            style={[
              styles.tab,
              selectedDifficulty === diff && { backgroundColor: DIFFICULTY_COLORS[diff] },
              !unlockedDifficulties.includes(diff) && styles.tabLocked,
            ]}
            onPress={() => {
              if (unlockedDifficulties.includes(diff)) setSelectedDifficulty(diff);
            }}
            disabled={!unlockedDifficulties.includes(diff)}
          >
            <Text style={[
              styles.tabText,
              selectedDifficulty === diff && styles.tabTextActive,
            ]}>
              {unlockedDifficulties.includes(diff) ? diff : `🔒 ${diff}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mission cards */}
      <FlatList
        data={missions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isCompleted = completedMissions.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.missionCard, isCompleted && styles.missionCardDone]}
              onPress={() => handleMissionPress(item)}
            >
              <View style={styles.missionCardLeft}>
                <Text style={styles.missionCardTitle}>{item.title}</Text>
                <Text style={styles.missionCardConcept}>Concept: {item.concept}</Text>
                <Text style={styles.missionCardStory} numberOfLines={2}>
                  {item.story}
                </Text>
              </View>
              <View style={styles.missionCardRight}>
                {isCompleted
                  ? <Text style={styles.checkmark}>✅</Text>
                  : <Text style={styles.arrow}>▶</Text>
                }
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    padding: 20,
    paddingBottom: 12,
  },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
  },
  tabLocked: { opacity: 0.5 },
  tabText: { color: '#555', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, gap: 12 },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  missionCardDone: { borderWidth: 2, borderColor: '#27AE60' },
  missionCardLeft: { flex: 1 },
  missionCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 3 },
  missionCardConcept: { fontSize: 12, color: '#5B4FE9', fontWeight: '600', marginBottom: 5 },
  missionCardStory: { fontSize: 13, color: '#7F8C8D', lineHeight: 18 },
  missionCardRight: { marginLeft: 12 },
  checkmark: { fontSize: 22 },
  arrow: { fontSize: 20, color: '#5B4FE9' },
});
