/**
 * Progress store using Zustand.
 * Tracks completed missions, earned badges, and unlocked difficulties.
 */

import { create } from 'zustand';

const useProgressStore = create((set, get) => ({
  completedMissions: [],
  earnedBadges: [],
  unlockedDifficulties: ['easy'], // medium unlocks after 2 easy missions, hard after 2 medium

  completeMission: (missionId, badge) => {
    const { completedMissions, earnedBadges, unlockedDifficulties } = get();
    const newCompleted = [...new Set([...completedMissions, missionId])];
    const newBadges = badge ? [...new Set([...earnedBadges, badge])] : earnedBadges;

    // Unlock logic
    const easyCount = newCompleted.filter(id => id.includes('easy') || EASY_IDS.includes(id)).length;
    const mediumCount = newCompleted.filter(id => id.includes('medium') || MEDIUM_IDS.includes(id)).length;

    const newUnlocked = [...unlockedDifficulties];
    if (easyCount >= 2 && !newUnlocked.includes('medium')) newUnlocked.push('medium');
    if (mediumCount >= 2 && !newUnlocked.includes('hard')) newUnlocked.push('hard');

    set({
      completedMissions: newCompleted,
      earnedBadges: newBadges,
      unlockedDifficulties: newUnlocked,
    });
  },

  resetProgress: () => set({
    completedMissions: [],
    earnedBadges: [],
    unlockedDifficulties: ['easy'],
  }),
}));

// Mission IDs by difficulty (matches sampleMissions.js)
const EASY_IDS = ['mission-1', 'mission-2'];
const MEDIUM_IDS = ['mission-3'];

export default useProgressStore;
