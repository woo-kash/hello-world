/**
 * Built-in starter missions — no AI generation needed for these.
 * These ship with the app so it works offline too.
 */

export const STARTER_MISSIONS = [
  {
    id: 'mission-1',
    difficulty: 'easy',
    title: 'Help the Robot Escape!',
    story: 'ROVI the robot is stuck in a maze. There\'s a wall blocking the path ahead, but the exit door is waiting on the other side!',
    challenge: 'Tell ROVI what to do: describe how it should check for walls and move to reach the exit door.',
    concept: 'conditionals',
    winCondition: 'robot reaches exit without hitting walls',
    starterHint: 'If there\'s a wall ahead, turn right. Then move forward. Then turn left. Then move forward two times!',
    // Grid: 0=floor, 1=wall, 2=exit door
    // ROVI at (1,1) facing right. Wall at (2,1). Go around to (3,2).
    grid: [
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 2, 0],
      [0, 0, 0, 0, 0],
    ],
    cols: 5,
    rows: 4,
    robotStart: { x: 1, y: 1 },
    robotDir: 'right',
    goal: [3, 2],
  },
  {
    id: 'mission-2',
    difficulty: 'easy',
    title: 'Light Up the Stars',
    story: 'The night sky is dark! 5 stars need to be lit up, but you can only light one at a time.',
    challenge: 'How would you tell the computer to light up all 5 stars without writing "light star" 5 times?',
    concept: 'loops',
    winCondition: 'all 5 stars are lit',
    starterHint: 'What if you could tell it to do something... again and again?',
  },
  {
    id: 'mission-3',
    difficulty: 'medium',
    title: 'The Hungry Bunny',
    story: 'Bunny is hopping through a garden. Some patches have carrots, some have mud. Bunny only wants to eat carrots!',
    challenge: 'Help Bunny decide what to do at each patch. What should Bunny check, and what should it do?',
    concept: 'if-else',
    winCondition: 'bunny eats all carrots and skips all mud',
    starterHint: 'Bunny needs to check something about each patch before deciding...',
  },
  {
    id: 'mission-4',
    difficulty: 'hard',
    title: 'The Spell Factory',
    story: 'Wizard Academy needs a spell-mixing machine. Each spell is made of 3 ingredients in the right order.',
    challenge: 'Build a recipe for the machine: take a list of ingredients and mix only the ones that belong to the spell.',
    concept: 'functions + loops + conditionals',
    winCondition: 'machine produces correct spell output for 3 different inputs',
    starterHint: 'Think of the machine as a "recipe" — something that can be called over and over with different ingredients.',
  },
];

export function getMissionsByDifficulty(difficulty) {
  return STARTER_MISSIONS.filter(m => m.difficulty === difficulty);
}

export function getMissionById(id) {
  return STARTER_MISSIONS.find(m => m.id === id);
}
