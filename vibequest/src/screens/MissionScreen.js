/**
 * MissionScreen — the core gameplay loop.
 * Kid reads the story, types their solution, AI translates it, game runs.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { translateToCode, generateLessonSummary } from '../ai/missionAI';
import LogicBlockView from '../components/LogicBlockView';
import GameView from '../components/GameView';
import StarGameView from '../components/StarGameView';
import { executeBlocks } from '../utils/gameEngine';
import { playSuccessSound } from '../utils/sound';

export default function MissionScreen({ route, navigation }) {
  const { mission, difficulty = 'easy' } = route.params;
  const hasGame = Boolean(mission.grid);
  const hasStars = mission.type === 'stars';

  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [missionWon, setMissionWon] = useState(false);

  // Game animation state
  const [animSteps, setAnimSteps] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const inputRef = useRef(null);

  // Advance animation frame every 550 ms
  useEffect(() => {
    if (!animSteps || stepIdx >= animSteps.length - 1) return;
    const t = setTimeout(() => setStepIdx((i) => i + 1), 550);
    return () => clearTimeout(t);
  }, [animSteps, stepIdx]);

  async function handleSubmit() {
    if (!userInput.trim()) return;
    setLoading(true);
    setResult(null);
    setAnimSteps(null);
    setStepIdx(0);

    try {
      const aiResult = await translateToCode(userInput, mission.challenge, difficulty);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setResult(aiResult);

      // Kick off grid animation if this mission has a game
      if (hasGame && aiResult.logicBlocks?.length) {
        const steps = executeBlocks(aiResult.logicBlocks, mission);
        setAnimSteps(steps);
        setStepIdx(0);
        // For grid missions, success = robot actually reaches the door in simulation
        aiResult.success = steps[steps.length - 1]?.atGoal ?? false;
      }

      if (aiResult.success) {
        playSuccessSound();
        setMissionWon(true);
        setTimeout(async () => {
          const summary = await generateLessonSummary(mission.concept, newAttempts, difficulty);
          navigation.navigate('VictoryScreen', { mission, summary, attempts: newAttempts });
        }, hasGame ? 3500 : 2000); // wait for animation to play out
      }
    } catch (err) {
      Alert.alert('Hmm, something went wrong', 'Check your internet and try again!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const currentStep = animSteps?.[stepIdx] ?? null;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MissionSelect')}>
        <Text style={styles.backBtnText}>← Menu</Text>
      </TouchableOpacity>

      {/* Story Panel */}
      <View style={styles.storyCard}>
        <Text style={styles.missionTitle}>{mission.title}</Text>
        <Text style={styles.storyText}>{mission.story}</Text>
        <View style={styles.challengeBox}>
          <Text style={styles.challengeLabel}>Your Mission:</Text>
          <Text style={styles.challengeText}>{mission.challenge}</Text>
        </View>
      </View>

      {/* Difficulty badge */}
      <View style={[styles.badge, styles[`badge_${difficulty}`]]}>
        <Text style={styles.badgeText}>{difficulty.toUpperCase()}</Text>
      </View>

      {/* ── GAME VIEW (missions with a grid) ── */}
      {hasGame && (
        <GameView
          layout={mission}
          currentStep={currentStep}
          stepMessage={currentStep?.message}
        />
      )}

      {/* ── STAR VIEW (Light Up the Stars mission) ── */}
      {hasStars && <StarGameView success={missionWon} />}

      {/* Input area */}
      <Text style={styles.inputLabel}>Describe your solution:</Text>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="e.g. If there's a wall ahead, turn right, then move forward..."
        placeholderTextColor="#aaa"
        multiline
        value={userInput}
        onChangeText={setUserInput}
        editable={!missionWon}
      />

      {!missionWon && (
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || !userInput.trim()}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Run it! ▶</Text>
          }
        </TouchableOpacity>
      )}

      {/* Hint */}
      {attempts === 0 && (
        <Text style={styles.hint}>Hint: {mission.starterHint}</Text>
      )}

      {/* AI Result */}
      {result && (
        <>
          {result.success ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>It works! 🎉</Text>
            </View>
          ) : (
            <View style={styles.failBanner}>
              <Text style={styles.failText}>Not quite… {result.hint}</Text>
            </View>
          )}
          <LogicBlockView
            logicBlocks={result.logicBlocks}
            code={result.code}
            explanation={result.explanation}
          />
        </>
      )}

      {/* Attempt counter */}
      {attempts > 0 && (
        <Text style={styles.attemptText}>
          Attempts: {attempts}{attempts > 2 ? ' — keep going, you\'ve got this!' : ''}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDE1E7',
  },
  backBtnText: { color: '#5B4FE9', fontWeight: '700', fontSize: 14 },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  missionTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 8 },
  storyText: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 12 },
  challengeBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  challengeLabel: { fontWeight: 'bold', color: '#856404', marginBottom: 4 },
  challengeText: { color: '#533F03', fontSize: 14 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  badge_easy: { backgroundColor: '#27AE60' },
  badge_medium: { backgroundColor: '#F39C12' },
  badge_hard: { backgroundColor: '#E74C3C' },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: '#2C3E50', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDE1E7',
    padding: 14,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#5B4FE9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hint: { color: '#7F8C8D', fontSize: 13, fontStyle: 'italic', marginBottom: 16 },
  successBanner: {
    backgroundColor: '#D4EDDA',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  successText: { color: '#155724', fontWeight: 'bold', fontSize: 18 },
  failBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  failText: { color: '#856404', fontSize: 14 },
  attemptText: { color: '#7F8C8D', fontSize: 13, textAlign: 'center', marginTop: 8 },
});
