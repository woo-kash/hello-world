/**
 * Mission library — 20+ missions across 3 age tiers.
 * Tier 1 (6-8): describe in English → visual blocks
 * Tier 2 (9-12): pseudo-code + AI pair coding
 * Tier 3 (13-16): prompt engineering + real apps
 */

import type { SkillId } from './skills';

export type MissionType = 'grid' | 'stars' | 'logic' | 'code' | 'app' | 'builder' | 'game-builder' | 'debug' | 'remix' | 'spec' | 'judge' | 'music';

export interface SceneConfig {
  sceneId: string;
  background: string;
  actors: string[];
}

export interface Mission {
  id: string;
  tier: 1 | 2 | 3;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  story: string;
  challenge: string;
  concept: string;
  winCondition: string;
  starterHint: string;
  free?: boolean;
  // Grid game fields (tier 1 maze missions)
  grid?: number[][];
  cols?: number;
  rows?: number;
  robotStart?: { x: number; y: number };
  robotDir?: 'right' | 'down' | 'left' | 'up';
  goal?: [number, number];
  // Game type
  type?: MissionType;
  // Grid theme
  theme?: 'space' | 'forest' | 'pirate';
  // Scene config for logic missions
  sceneConfig?: SceneConfig;
  // Tier 2: starter code snippet
  starterCode?: string;
  // Tier 3: example app description
  appDescription?: string;
  // Game builder: which template to use
  gameTemplateId?: string;
  // Skills
  primarySkill?: SkillId;
  secondarySkill?: SkillId;
  xp?: number;
  // Debug missions: buggy code to fix
  buggyCode?: string;
  // Remix missions: starter code + challenges to complete
  remixChallenges?: string[];
}

// ─── TIER 1: Explorers (6–8) ───────────────────────────────────────────────

const TIER1_MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    tier: 1,
    difficulty: 'easy',
    free: true,
    type: 'grid',
    theme: 'space',
    primarySkill: 'decomposition',
    secondarySkill: 'precision-of-language',
    xp: 50,
    title: 'Help the Robot Escape!',
    story: "ROVI the robot is stuck in a maze. There's a wall blocking the path ahead, but the exit door is waiting on the other side!",
    challenge: 'Tell ROVI what to do: describe how it should check for walls and move to reach the exit door.',
    concept: 'conditionals',
    winCondition: 'robot reaches exit without hitting walls',
    starterHint: "If there's a wall ahead, turn right. Then move forward. Then turn left. Then move forward two times!",
    grid: [
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 2, 0],
      [0, 0, 0, 0, 0],
    ],
    cols: 5, rows: 4,
    robotStart: { x: 1, y: 1 },
    robotDir: 'right',
    goal: [3, 2],
  },
  {
    id: 'mission-2',
    tier: 1,
    difficulty: 'easy',
    free: true,
    type: 'stars',
    primarySkill: 'pattern-recognition',
    secondarySkill: 'decomposition',
    xp: 50,
    title: 'Light Up the Stars',
    story: 'The night sky is dark! 5 stars need to be lit up, but you can only light one at a time.',
    challenge: 'How would you tell the computer to light up all 5 stars without writing "light star" 5 times?',
    concept: 'loops',
    winCondition: 'all 5 stars are lit',
    starterHint: 'What if you could tell it to do something... again and again?',
  },
  {
    id: 'mission-3',
    tier: 1,
    difficulty: 'easy',
    free: true,
    type: 'logic',
    primarySkill: 'systems-thinking',
    secondarySkill: 'decomposition',
    xp: 50,
    title: 'The Hungry Bunny',
    sceneConfig: {
      sceneId: 'bunny',
      background: 'linear-gradient(180deg, #87CEEB 0%, #90EE90 60%, #228B22 100%)',
      actors: ['bunny', 'carrot', 'mud'],
    },
    story: 'Bunny is hopping through a garden. Some patches have carrots, some have mud. Bunny only wants to eat carrots!',
    challenge: 'Help Bunny decide what to do at each patch. What should Bunny check, and what should it do?',
    concept: 'if-else',
    winCondition: 'bunny eats all carrots and skips all mud',
    starterHint: 'Bunny needs to check something about each patch before deciding...',
  },
  {
    id: 'mission-4',
    tier: 1,
    difficulty: 'medium',
    type: 'grid',
    theme: 'space',
    primarySkill: 'decomposition',
    secondarySkill: 'precision-of-language',
    xp: 75,
    title: 'Space Rocket Launch',
    story: "Captain Star's rocket needs to reach the launch pad, but asteroids are in the way!",
    challenge: 'Guide the rocket past the asteroids to reach the launch pad. Remember, it can only fly straight or turn!',
    concept: 'sequences + conditionals',
    winCondition: 'rocket reaches launch pad',
    starterHint: 'Check if there is an asteroid ahead before moving!',
    grid: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 2],
    ],
    cols: 6, rows: 4,
    robotStart: { x: 0, y: 0 },
    robotDir: 'right',
    goal: [5, 3],
  },
  {
    id: 'mission-5',
    tier: 1,
    difficulty: 'medium',
    type: 'stars',
    primarySkill: 'pattern-recognition',
    secondarySkill: 'systems-thinking',
    xp: 75,
    title: 'Pet Feeder Machine',
    story: 'Pixel the robot pet is hungry! You need to build a feeding machine that feeds it exactly 3 times a day.',
    challenge: 'Write instructions for the machine: it should feed Pixel, wait, then feed again — in a loop!',
    concept: 'loops + sequences',
    winCondition: 'machine feeds pet exactly 3 times',
    starterHint: 'Think about how many times you need to repeat the feeding action.',
  },
  {
    id: 'mission-6',
    tier: 1,
    difficulty: 'medium',
    type: 'logic',
    primarySkill: 'systems-thinking',
    secondarySkill: 'precision-of-language',
    xp: 75,
    title: 'Rain Dance Robot',
    sceneConfig: {
      sceneId: 'rain-robot',
      background: 'linear-gradient(180deg, #4A5568 0%, #718096 40%, #A0AEC0 100%)',
      actors: ['robot', 'cloud', 'sun', 'rain'],
    },
    story: 'The village needs rain! The rain dance robot only dances when it sees clouds, and stops when the sun comes out.',
    challenge: 'Program the robot to check the weather and decide whether to dance or stop.',
    concept: 'if-else + booleans',
    winCondition: 'robot dances in rain and stops in sun',
    starterHint: 'What two things can the sky be? And what should the robot do for each?',
  },
  {
    id: 'mission-7',
    tier: 1,
    difficulty: 'hard',
    type: 'logic',
    primarySkill: 'decomposition',
    secondarySkill: 'pattern-recognition',
    xp: 100,
    title: 'Cookie Baker 3000',
    sceneConfig: {
      sceneId: 'cookie-baker',
      background: 'linear-gradient(180deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)',
      actors: ['chef', 'flour', 'sugar', 'chocolate', 'peanut', 'cookie'],
    },
    story: "Chef Cookiebot can bake chocolate chip, sugar, or peanut butter cookies — but each needs different ingredients!",
    challenge: 'Build a recipe system: check what kind of cookie is ordered, then follow the right recipe.',
    concept: 'functions + conditionals',
    winCondition: 'correct recipe followed for all 3 cookie types',
    starterHint: 'Think of each recipe as its own set of steps. How could you name and reuse them?',
  },
  {
    id: 'mission-8',
    tier: 1,
    difficulty: 'hard',
    type: 'grid',
    theme: 'pirate',
    primarySkill: 'decomposition',
    secondarySkill: 'systems-thinking',
    xp: 100,
    title: 'Treasure Hunt',
    story: "Pirate Pete found a map! The treasure is hidden in a maze, but the path changes based on what he sees.",
    challenge: 'Guide Pete through the maze using conditionals and loops. He needs to check every turn!',
    concept: 'loops + nested conditionals',
    winCondition: 'Pete reaches the treasure',
    starterHint: 'Pete should keep moving until he finds the treasure. At each step, check what is ahead.',
    grid: [
      [0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 2],
    ],
    cols: 7, rows: 5,
    robotStart: { x: 0, y: 0 },
    robotDir: 'right',
    goal: [6, 4],
  },
  // ── Game Builder missions (Tier 1) ──
  {
    id: 'tier1-game-platformer',
    tier: 1,
    difficulty: 'medium',
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'decomposition',
    secondarySkill: 'precision-of-language',
    xp: 150,
    title: '🎮 My First Platformer',
    story: "You get to build your very own video game! Pick a hero, choose what to collect, add bad guys, and design your world. Then PLAY it!",
    challenge: 'Build your own platformer game! Pick your character, collectibles, enemies, and describe what your world looks like.',
    concept: 'decomposition + precision of language',
    winCondition: 'customised platformer game is playable with at least 3 personalised elements',
    starterHint: 'Start by picking a fun character — a cat? a robot? a dragon? Then decide what you want to collect!',
  },
  {
    id: 'tier1-game-maze',
    tier: 1,
    difficulty: 'hard',
    type: 'game-builder',
    gameTemplateId: 'maze',
    primarySkill: 'systems-thinking',
    secondarySkill: 'giving-feedback',
    xp: 150,
    title: '🎮 My Maze Game',
    story: "Create your own maze adventure! Choose who explores the maze, what they eat, and what chases them. Then play through your maze!",
    challenge: 'Design your own maze game! Pick your explorer, dots to collect, and ghosts to avoid.',
    concept: 'systems thinking + giving feedback',
    winCondition: 'customised maze game is playable with unique character and items',
    starterHint: 'Think about what makes YOUR maze special. What is your character collecting? Who is chasing them?',
  },
  // ── Debug Detective (Tier 1) ──
  {
    id: 'tier1-debug-1',
    tier: 1,
    difficulty: 'medium',
    type: 'debug',
    primarySkill: 'debugging-with-ai',
    secondarySkill: 'precision-of-language',
    xp: 75,
    title: '🐛 Bug Bunny',
    story: "ROVI the robot is acting strange! Instead of moving forward, it keeps going backward. Something in the code is flipped!",
    challenge: 'Look at what ROVI is doing wrong and describe the bug. Can you spot what is flipped?',
    concept: 'debugging + precision of language',
    winCondition: 'bug correctly identified and fixed',
    starterHint: 'Describe exactly what ROVI does wrong, and what it should do instead.',
    buggyCode: `<!DOCTYPE html>
<html><head><style>
body { background: #1a1a2e; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
#grid { display: grid; grid-template-columns: repeat(5, 60px); gap: 4px; }
.cell { width: 60px; height: 60px; background: #16213e; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.wall { background: #e94560; }
.robot { background: #0f3460; }
.goal { background: #533483; }
#msg { color: white; margin-top: 16px; font-size: 18px; }
button { margin-top: 12px; padding: 10px 24px; background: #e94560; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
</style></head><body>
<div id="grid"></div>
<div id="msg">Press Run to watch the robot!</div>
<button onclick="runRobot()">Run Robot</button>
<script>
// BUG: the robot moves in the WRONG direction
const grid = [[0,0,0,0,0],[0,0,1,0,0],[0,0,0,2,0],[0,0,0,0,0]];
let robotX = 1, robotY = 1;
const goalX = 3, goalY = 2;

function render(rx, ry) {
  const g = document.getElementById('grid');
  g.innerHTML = '';
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (grid[y][x] === 1 ? ' wall' : '') + (x === goalX && y === goalY ? ' goal' : '') + (x === rx && y === ry ? ' robot' : '');
      cell.textContent = x === rx && y === ry ? '🤖' : x === goalX && y === goalY ? '🚪' : grid[y][x] === 1 ? '🧱' : '';
      g.appendChild(cell);
    }
  }
}

function runRobot() {
  render(robotX, robotY);
  let rx = robotX, ry = robotY;
  const steps = [];
  // BUG: should move right (+1) but moves left (-1) instead
  steps.push({x: rx - 1, y: ry}); // wrong direction!
  steps.push({x: rx - 1, y: ry + 1});
  steps.push({x: rx, y: ry + 1});

  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(interval);
      const s = steps[steps.length - 1];
      document.getElementById('msg').textContent = s.x === goalX && s.y === goalY ? '🎉 Made it!' : '❌ Wrong way!';
      return;
    }
    render(steps[i].x, steps[i].y);
    i++;
  }, 500);
}
render(robotX, robotY);
</script></body></html>`,
  },
  // ── Remix Studio (Tier 1) ──
  {
    id: 'tier1-remix-1',
    tier: 1,
    difficulty: 'medium',
    type: 'remix',
    primarySkill: 'remix-and-extend',
    secondarySkill: 'giving-feedback',
    xp: 75,
    title: '🎨 Remix the Button',
    story: "Someone built a colour-changing button app, but it only changes to one colour. Can you make it more exciting?",
    challenge: 'Remix this button app: make the button say something funny AND change to a random colour each click.',
    concept: 'remix & extend + giving feedback',
    winCondition: 'button has funny text and random colour on click',
    starterHint: 'Try changing the button text first, then tackle the random colours!',
    starterCode: `<!DOCTYPE html>
<html><head><style>
body { background: #1a1a2e; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
button { padding: 20px 40px; font-size: 24px; border: none; border-radius: 16px; background: #e94560; color: white; cursor: pointer; transition: 0.2s; }
button:hover { transform: scale(1.05); }
#msg { color: white; margin-top: 20px; font-size: 18px; }
</style></head><body>
<button onclick="changeColor()">Click me!</button>
<div id="msg">Press the button!</div>
<script>
function changeColor() {
  document.querySelector('button').style.background = 'blue';
  document.getElementById('msg').textContent = 'Changed!';
}
</script></body></html>`,
    remixChallenges: [
      'Make the button say something funny when clicked',
      'Change to a random colour each time (not always blue)',
    ],
  },
];

// ─── TIER 2: Adventurers (9–12) ────────────────────────────────────────────

const TIER2_MISSIONS: Mission[] = [
  {
    id: 'tier2-mission-1',
    tier: 2,
    difficulty: 'easy',
    free: true,
    type: 'code',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'decomposition',
    xp: 100,
    title: 'Build a Calculator',
    story: "Your friend needs a calculator app for math homework. Let's build one together with AI!",
    challenge: 'Describe what a calculator should do. Tell the AI what buttons it needs and how each should work.',
    concept: 'functions + operators',
    winCondition: 'calculator correctly adds, subtracts, multiplies, and divides',
    starterHint: 'Think about what inputs the calculator needs and what it should output.',
    starterCode: `// A calculator needs inputs and outputs
// What operations should it do?
function calculate(num1, operation, num2) {
  // Your logic here
}`,
  },
  {
    id: 'tier2-mission-2',
    tier: 2,
    difficulty: 'easy',
    type: 'code',
    primarySkill: 'precision-of-language',
    secondarySkill: 'systems-thinking',
    xp: 100,
    title: 'Weather Checker',
    story: "Your town needs a weather app! It should tell people whether to bring an umbrella based on the forecast.",
    challenge: 'Build a weather decision helper: it takes a temperature and weather condition and tells you what to wear.',
    concept: 'conditionals + strings',
    winCondition: 'correct outfit suggestion for all weather conditions',
    starterHint: 'Think about all the weather conditions and what each one means for clothing.',
    starterCode: `function getOutfitAdvice(temperature, condition) {
  // What should someone wear?
  // condition could be: "sunny", "rainy", "snowy", "cloudy"
}`,
  },
  {
    id: 'tier2-mission-3',
    tier: 2,
    difficulty: 'medium',
    type: 'code',
    primarySkill: 'pattern-recognition',
    secondarySkill: 'specification-writing',
    xp: 125,
    title: 'Quiz Game',
    story: "Design a quiz game for your class! It should ask questions, check answers, and keep score.",
    challenge: 'Build the quiz engine: it should present questions, take answers, and track the score.',
    concept: 'arrays + loops + conditionals',
    winCondition: 'quiz runs through all questions and shows final score',
    starterHint: 'Store your questions in a list. Loop through them one by one.',
    starterCode: `const questions = [
  { question: "What is 2+2?", answer: "4" },
  // Add more questions!
];

function runQuiz(questions) {
  // Loop through questions and check answers
}`,
  },
  {
    id: 'tier2-mission-4',
    tier: 2,
    difficulty: 'medium',
    type: 'code',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 125,
    title: 'Story Generator',
    story: "Books are cool, but what about a machine that writes stories? Tell the AI what story elements you want!",
    challenge: 'Build a story generator: it takes a hero name, setting, and problem, then creates a short story.',
    concept: 'string templates + functions',
    winCondition: 'generator produces a coherent story with all given elements',
    starterHint: 'Use template literals (backticks) to combine text with variables.',
    starterCode: `function generateStory(heroName, setting, problem) {
  // Combine the elements into a story
  // Try using template literals: \`Hello \${name}!\`
}`,
  },
  {
    id: 'tier2-mission-5',
    tier: 2,
    difficulty: 'medium',
    type: 'code',
    primarySkill: 'systems-thinking',
    secondarySkill: 'decomposition',
    xp: 125,
    title: 'Drawing Bot',
    story: "The school art fair needs a bot that draws shapes using code commands!",
    challenge: 'Create a command system where you can tell the bot to draw circles, squares, and triangles.',
    concept: 'objects + switch statements',
    winCondition: 'bot correctly draws all three shapes from commands',
    starterHint: 'Think of each shape as a different command. A switch statement can handle different cases.',
  },
  {
    id: 'tier2-mission-6',
    tier: 2,
    difficulty: 'hard',
    type: 'code',
    primarySkill: 'pattern-recognition',
    secondarySkill: 'remix-and-extend',
    xp: 150,
    title: 'Music Maker',
    story: "DJ RoboBeats needs a playlist manager! It should let you add songs, remove them, and shuffle.",
    challenge: 'Build a playlist system with add, remove, find, and shuffle functionality.',
    concept: 'arrays + methods + algorithms',
    winCondition: 'playlist correctly handles all operations',
    starterHint: 'JavaScript arrays have built-in methods like push, filter, and sort.',
    starterCode: `class Playlist {
  constructor() {
    this.songs = [];
  }

  addSong(song) { /* ... */ }
  removeSong(title) { /* ... */ }
  shuffle() { /* ... */ }
}`,
  },
  // ── Game Builder missions (Tier 2) ──
  {
    id: 'tier2-game-platformer',
    tier: 2,
    difficulty: 'medium',
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'decomposition',
    xp: 150,
    title: '🎮 Platformer Builder',
    story: "Time to build a real platformer game from scratch! Describe your world, characters, and gameplay — then play it live.",
    challenge: 'Use vibe coding to design a complete platformer: describe the theme, enemies, power-ups, and level design in detail.',
    concept: 'rapid prototyping + decomposition',
    winCondition: 'fully playable platformer with custom theme, enemies, and collectibles',
    starterHint: 'Be specific! Instead of "make it cool", say "underwater theme with jellyfish enemies that float up and down, collect pearls, blue gradient background".',
  },
  {
    id: 'tier2-game-space',
    tier: 2,
    difficulty: 'medium',
    type: 'game-builder',
    gameTemplateId: 'space-blaster',
    primarySkill: 'systems-thinking',
    secondarySkill: 'precision-of-language',
    xp: 150,
    title: '🎮 Space Blaster',
    story: "Design your own space shooter! What does your ship look like? What aliens are you fighting? What power-ups can you grab?",
    challenge: 'Build a space shooter: describe the ship, enemy types, weapons, and power-ups. Make it challenging but fair!',
    concept: 'systems thinking + precision of language',
    winCondition: 'playable space shooter with multiple enemy types and at least one power-up',
    starterHint: 'Think about what makes a great space game: different enemy types, interesting weapons, and a progression that gets harder.',
  },
  {
    id: 'tier2-game-snake',
    tier: 2,
    difficulty: 'hard',
    type: 'game-builder',
    gameTemplateId: 'snake',
    primarySkill: 'remix-and-extend',
    secondarySkill: 'giving-feedback',
    xp: 175,
    title: '🎮 Snake Remix',
    story: "Everyone knows Snake — but nobody's played YOUR version! Redesign it with wild themes, special food, and unique rules.",
    challenge: 'Remix the classic Snake: change the theme, add special food types, obstacles, and make it uniquely yours.',
    concept: 'remix & extend + giving feedback',
    winCondition: 'custom snake game with at least 2 unique features not in the original',
    starterHint: 'What if the snake was in space? Or underwater? What if eating certain foods gave you special powers?',
  },
  {
    id: 'tier2-mission-7',
    tier: 2,
    difficulty: 'hard',
    type: 'code',
    primarySkill: 'ai-literacy',
    secondarySkill: 'systems-thinking',
    xp: 175,
    title: 'Mini Chatbot',
    story: "Build a simple chatbot that can answer questions about your favourite topic!",
    challenge: 'Create a chatbot that recognises keywords and gives matching responses. Make it friendly!',
    concept: 'objects + string matching + functions',
    winCondition: 'chatbot responds correctly to at least 5 different inputs',
    starterHint: 'Store responses in an object. Check if the user message contains keywords.',
    starterCode: `const responses = {
  "hello": "Hi there! How can I help?",
  // Add more responses
};

function chat(userMessage) {
  // Check what the user said and return a response
}`,
  },
  // ── Debug Detective (Tier 2) ──
  {
    id: 'tier2-debug-1',
    tier: 2,
    difficulty: 'medium',
    type: 'debug',
    primarySkill: 'debugging-with-ai',
    secondarySkill: 'precision-of-language',
    xp: 125,
    title: '🐛 Calculator Crash',
    story: "Someone built a calculator but it breaks when you type negative numbers. Help find and describe the bug!",
    challenge: 'Try the calculator with negative numbers. Describe exactly what goes wrong and what should happen instead.',
    concept: 'debugging + precision of language',
    winCondition: 'bug correctly identified and calculator works with negative numbers',
    starterHint: 'Try typing -5 + 3 into the calculator. What happens? What should happen?',
    buggyCode: `<!DOCTYPE html>
<html><head><style>
body { background: #1a1a2e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
.calc { background: #16213e; border-radius: 16px; padding: 24px; width: 280px; }
#display { background: #0f3460; color: white; font-size: 28px; padding: 16px; border-radius: 8px; text-align: right; margin-bottom: 16px; min-height: 56px; word-break: break-all; }
.buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
button { padding: 16px; font-size: 18px; border: none; border-radius: 8px; cursor: pointer; background: #533483; color: white; }
button:hover { background: #6a42a8; }
.op { background: #e94560; }
.eq { background: #00b4d8; grid-column: span 2; }
#error { color: #e94560; font-size: 13px; margin-top: 8px; text-align: center; min-height: 20px; }
</style></head><body>
<div class="calc">
  <div id="display">0</div>
  <div id="error"></div>
  <div class="buttons">
    <button onclick="input('7')">7</button><button onclick="input('8')">8</button><button onclick="input('9')">9</button><button class="op" onclick="input('+')">+</button>
    <button onclick="input('4')">4</button><button onclick="input('5')">5</button><button onclick="input('6')">6</button><button class="op" onclick="input('-')">-</button>
    <button onclick="input('1')">1</button><button onclick="input('2')">2</button><button onclick="input('3')">3</button><button class="op" onclick="input('*')">×</button>
    <button onclick="input('0')">0</button><button onclick="input('.')">.</button><button class="op" onclick="input('/'">÷</button><button onclick="clearAll()">C</button>
    <button class="eq" onclick="calculate()">=</button>
  </div>
</div>
<script>
let expr = '';
function input(v) { expr += v; document.getElementById('display').textContent = expr; document.getElementById('error').textContent = ''; }
function clearAll() { expr = ''; document.getElementById('display').textContent = '0'; document.getElementById('error').textContent = ''; }
function calculate() {
  try {
    // BUG: parseInt strips decimals AND breaks negative numbers
    const parts = expr.split(/([+\-*\/])/);
    const a = parseInt(parts[0]); // BUG: should be parseFloat, parseInt("−5.5") = NaN
    const op = parts[1];
    const b = parseInt(parts[2]); // BUG: same issue
    let result;
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*') result = a * b;
    else if (op === '/') result = b === 0 ? 'Error: divide by zero' : a / b;
    document.getElementById('display').textContent = result;
    expr = String(result);
  } catch(e) {
    document.getElementById('error').textContent = 'Something went wrong!';
  }
}
</script></body></html>`,
  },
  // ── Remix Studio (Tier 2) ──
  {
    id: 'tier2-remix-1',
    tier: 2,
    difficulty: 'medium',
    type: 'remix',
    primarySkill: 'remix-and-extend',
    secondarySkill: 'giving-feedback',
    xp: 125,
    title: '🎨 Calculator Upgrade',
    story: "Here is a basic calculator that adds and subtracts. Your job: make it way more powerful!",
    challenge: 'Remix this calculator: add a memory button (M+), show calculation history, and add a clear history button.',
    concept: 'remix & extend + giving feedback',
    winCondition: 'calculator has memory button, history display, and clear history',
    starterHint: 'Start with the memory button — what should M+ do? Save the current number somewhere!',
    starterCode: `<!DOCTYPE html>
<html><head><style>
body { background: #1a1a2e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
.calc { background: #16213e; border-radius: 16px; padding: 24px; width: 260px; }
#display { background: #0f3460; color: white; font-size: 32px; padding: 16px; border-radius: 8px; text-align: right; margin-bottom: 12px; }
.buttons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
button { padding: 16px; font-size: 18px; border: none; border-radius: 8px; cursor: pointer; background: #533483; color: white; }
</style></head><body>
<div class="calc">
  <div id="display">0</div>
  <div class="buttons">
    <button onclick="press(7)">7</button><button onclick="press(8)">8</button><button onclick="press(9)">9</button>
    <button onclick="press(4)">4</button><button onclick="press(5)">5</button><button onclick="press(6)">6</button>
    <button onclick="press(1)">1</button><button onclick="press(2)">2</button><button onclick="press(3)">3</button>
    <button onclick="press(0)">0</button><button onclick="op('+')">+</button><button onclick="op('-')">-</button>
    <button onclick="calc()" style="grid-column:span 2; background:#e94560">=</button>
    <button onclick="clearAll()">C</button>
  </div>
</div>
<script>
let val = '', lastOp = '', lastNum = 0, mem = 0;
function press(n) { val += n; document.getElementById('display').textContent = val; }
function op(o) { lastNum = parseFloat(val) || 0; lastOp = o; val = ''; }
function calc() {
  const cur = parseFloat(val) || 0;
  let res = lastOp === '+' ? lastNum + cur : lastNum - cur;
  document.getElementById('display').textContent = res;
  val = String(res);
}
function clearAll() { val = ''; document.getElementById('display').textContent = '0'; }
</script></body></html>`,
    remixChallenges: [
      'Add a memory button (M+) that saves the current number',
      'Show calculation history below the calculator',
      'Add a clear history button',
    ],
  },
  // ── Spec Writer (Tier 2) ──
  {
    id: 'tier2-spec-1',
    tier: 2,
    difficulty: 'hard',
    type: 'spec',
    primarySkill: 'specification-writing',
    secondarySkill: 'decomposition',
    xp: 150,
    title: '📋 Spec a Habit Tracker',
    story: "Before we build anything, you need to write a perfect spec! Describe a habit tracker app in so much detail that the AI builds exactly what you imagined.",
    challenge: 'Write a complete specification for a daily habit tracker. What features does it need? What does it look like? What happens when streaks break?',
    concept: 'specification writing + decomposition',
    winCondition: 'spec score reaches 8/10 and built app matches spec',
    starterHint: 'Think about: what habits can you track? How do you mark them done? What happens with streaks? What does the UI look like?',
  },
  // ── AI Judge (Tier 2) ──
  {
    id: 'tier2-judge-1',
    tier: 2,
    difficulty: 'hard',
    type: 'judge',
    primarySkill: 'ai-literacy',
    secondarySkill: 'giving-feedback',
    xp: 150,
    title: '⚖️ Pick the Best Todo App',
    story: "Three different AIs each built a todo app. One is great, two have problems. Can you spot which is best and explain why?",
    challenge: 'Look at all 3 todo apps. Pick the best one and explain why the other two have issues.',
    concept: 'ai literacy + giving feedback',
    winCondition: 'correctly identified best version with clear reasoning',
    starterHint: 'Look for: does it work properly? Is it easy to use? Does anything break?',
  },
];

// ─── TIER 3: Vibe Coders (13–16) ───────────────────────────────────────────

const TIER3_MISSIONS: Mission[] = [
  {
    id: 'tier3-mission-1',
    tier: 3,
    difficulty: 'easy',
    free: true,
    type: 'app',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 200,
    title: 'Landing Page',
    story: 'You have a brilliant app idea. Now you need a landing page to show the world — and get people to sign up!',
    challenge: 'Use the AI to build a landing page. Describe your app idea, its features, and who it is for. Iterate until it looks professional.',
    concept: 'prompt engineering + HTML/CSS',
    winCondition: 'landing page has headline, features section, and signup CTA',
    starterHint: 'Start with a clear prompt: "Build a landing page for an app called X that does Y for Z people"',
    appDescription: 'Describe your app idea and the AI will generate a complete landing page.',
  },
  {
    id: 'tier3-mission-2',
    tier: 3,
    difficulty: 'easy',
    type: 'app',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'giving-feedback',
    xp: 200,
    title: 'Todo App',
    story: "Everyone needs a todo list, but yours will be special. Build it with AI, then customise it to make it your own.",
    challenge: 'Build a todo app with add, complete, and delete. Then add one unique feature no other todo app has.',
    concept: 'React state management + CRUD operations',
    winCondition: 'todo app has all CRUD operations plus one unique feature',
    starterHint: 'Start simple: "Build a React todo app with add, check off, and delete". Then iterate!',
    appDescription: 'A todo list app that is actually useful for your own life.',
  },
  {
    id: 'tier3-mission-3',
    tier: 3,
    difficulty: 'medium',
    type: 'app',
    primarySkill: 'systems-thinking',
    secondarySkill: 'specification-writing',
    xp: 250,
    title: 'Text Adventure Game',
    story: "Write a text adventure where the player makes choices that change the story. Like a real game designer!",
    challenge: 'Build a branching text adventure with at least 3 different story paths and 2 possible endings.',
    concept: 'data structures + branching logic + UX',
    winCondition: 'game has 3+ paths, 2+ endings, and feels like a real game',
    starterHint: 'Start by designing your story tree on paper first, then prompt the AI to build it.',
  },
  {
    id: 'tier3-mission-4',
    tier: 3,
    difficulty: 'medium',
    type: 'app',
    primarySkill: 'decomposition',
    secondarySkill: 'systems-thinking',
    xp: 250,
    title: 'Data Visualiser',
    story: "Raw numbers are boring. Build a tool that takes data and makes it visual and beautiful!",
    challenge: 'Build a chart builder: take some data (e.g. your top 5 movies with ratings) and visualise it with bars or charts.',
    concept: 'data transformation + SVG/Canvas + APIs',
    winCondition: 'visualiser correctly renders data as an interactive chart',
    starterHint: 'Try: "Build a bar chart component that takes an array of {label, value} objects"',
  },
  {
    id: 'tier3-mission-5',
    tier: 3,
    difficulty: 'hard',
    type: 'app',
    primarySkill: 'ai-literacy',
    secondarySkill: 'systems-thinking',
    xp: 300,
    title: 'AI Chatbot',
    story: "Build your own AI chatbot powered by Claude! Give it a personality, a purpose, and make it help people.",
    challenge: 'Build a chatbot with a custom personality and purpose. Use the Claude API to power it. Ship it.',
    concept: 'API integration + system prompts + UX',
    winCondition: 'chatbot has custom personality, calls Claude API, and handles conversation history',
    starterHint: 'The most important thing is the system prompt. Describe your bot\'s personality and role clearly.',
    appDescription: 'Your own AI-powered chatbot. What will it specialise in?',
  },
  {
    id: 'tier3-mission-6',
    tier: 3,
    difficulty: 'hard',
    type: 'builder',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'giving-feedback',
    xp: 300,
    title: 'AI App Builder',
    story: "This is the ultimate challenge: build something real with AI. Describe what you want, iterate on it, and ship it!",
    challenge: 'Use multiple rounds of conversation with the AI to design, build, and refine a web app. Be specific, iterate, and make something you are proud of!',
    concept: 'prompt engineering + iteration + AI collaboration',
    winCondition: 'complete at least 3 rounds of iteration and produce a working app',
    starterHint: 'Start by describing your app idea clearly. Then look at the preview and tell the AI what to change. Iterate!',
    appDescription: 'Build anything you can imagine. The AI is your co-pilot.',
  },
  // ── Game Builder missions (Tier 3) ──
  {
    id: 'tier3-game-studio',
    tier: 3,
    difficulty: 'medium',
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'specification-writing',
    secondarySkill: 'rapid-prototyping',
    xp: 300,
    title: '🎮 Full Game Studio',
    story: "You're a game designer now. Build a complete platformer with multiple levels, increasing difficulty, boss mechanics, and polished visuals.",
    challenge: 'Design a professional-quality platformer: write detailed specs for level progression, enemy AI patterns, scoring systems, and visual polish. Iterate until it feels like a real game.',
    concept: 'specification writing + all skills',
    winCondition: 'polished platformer with difficulty progression, multiple enemy types, and a scoring system',
    starterHint: 'Think like a game designer: write a spec first. "Level 1: easy, 3 platforms, slow enemies. Level 2: moving platforms, faster enemies, new collectible type."',
  },
  {
    id: 'tier3-game-space',
    tier: 3,
    difficulty: 'hard',
    type: 'game-builder',
    gameTemplateId: 'space-blaster',
    primarySkill: 'systems-thinking',
    secondarySkill: 'rapid-prototyping',
    xp: 350,
    title: '🎮 Space Wars',
    story: "Build an epic space shooter with boss fights, weapon upgrades, and a wave system. Make it addictively fun!",
    challenge: 'Create a deep space shooter with wave progression, boss fights every 5 waves, weapon upgrades, and a high-score system.',
    concept: 'systems thinking + rapid prototyping',
    winCondition: 'space shooter with wave system, at least 1 boss fight, and weapon upgrades',
    starterHint: 'Start with the core loop: waves of enemies that get harder. Then add bosses, then power-ups. Layer by layer.',
  },
  // ── Debug Detective (Tier 3) ──
  {
    id: 'tier3-debug-1',
    tier: 3,
    difficulty: 'hard',
    type: 'debug',
    primarySkill: 'debugging-with-ai',
    secondarySkill: 'precision-of-language',
    xp: 225,
    title: '🐛 Message Mayhem',
    story: "Someone built a chat app but messages appear TWICE every time you send one. There's a classic JavaScript bug in there — can you find it?",
    challenge: 'Use the chat app and figure out why messages duplicate. Describe the bug precisely enough for the AI to fix it.',
    concept: 'debugging + precision of language',
    winCondition: 'bug correctly identified and messages only appear once',
    starterHint: 'Think about what happens each time the send button is clicked. Is the event listener being added multiple times?',
    buggyCode: `<!DOCTYPE html>
<html><head><style>
body { background: #1a1a2e; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
.chat-container { background: #16213e; border-radius: 16px; padding: 24px; width: 380px; height: 500px; display: flex; flex-direction: column; }
#messages { flex: 1; overflow-y: auto; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
.message { background: #0f3460; color: white; padding: 10px 14px; border-radius: 12px; max-width: 80%; word-wrap: break-word; }
.message.own { background: #533483; align-self: flex-end; }
.input-row { display: flex; gap: 8px; }
input { flex: 1; background: #0f3460; border: none; border-radius: 8px; padding: 12px; color: white; font-size: 16px; outline: none; }
button { background: #e94560; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-size: 16px; }
</style></head><body>
<div class="chat-container">
  <div id="messages"></div>
  <div class="input-row">
    <input id="input" placeholder="Type a message..." />
    <button id="sendBtn">Send</button>
  </div>
</div>
<script>
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

// BUG: setupSend is called every time, adding a new event listener each time
function addMessage(text, own) {
  const div = document.createElement('div');
  div.className = 'message' + (own ? ' own' : '');
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function setupSend() {
  // BUG: This adds a NEW listener every time setupSend() is called
  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, true);
    input.value = '';
    setupSend(); // BUG: calling setupSend again here stacks another listener!
    setTimeout(() => addMessage('Got it! 👍', false), 600);
  });
}

setupSend();
input.addEventListener('keydown', e => { if (e.key === 'Enter') sendBtn.click(); });
</script></body></html>`,
  },
  // ── Remix Studio (Tier 3) ──
  {
    id: 'tier3-remix-1',
    tier: 3,
    difficulty: 'hard',
    type: 'remix',
    primarySkill: 'remix-and-extend',
    secondarySkill: 'giving-feedback',
    xp: 225,
    title: '🎨 Chatbot Upgrade',
    story: "Here is a simple chatbot that only responds to greetings. Make it actually useful!",
    challenge: 'Remix this chatbot: make it remember the last 5 messages, add a typing indicator, and let the user clear the chat.',
    concept: 'remix & extend + giving feedback',
    winCondition: 'chatbot has message memory, typing indicator, and clear button',
    starterHint: 'Start with the message history — how would you store the last 5 messages? An array!',
    starterCode: `<!DOCTYPE html>
<html><head><style>
body { background: #1a1a2e; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
.chat { background: #16213e; border-radius: 16px; padding: 24px; width: 400px; height: 500px; display: flex; flex-direction: column; }
#msgs { flex: 1; overflow-y: auto; margin-bottom: 12px; }
.msg { padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; max-width: 80%; }
.user { background: #533483; color: white; margin-left: auto; }
.bot { background: #0f3460; color: white; }
.row { display: flex; gap: 8px; }
input { flex: 1; background: #0f3460; border: none; border-radius: 8px; padding: 12px; color: white; outline: none; }
button { background: #e94560; color: white; border: none; border-radius: 8px; padding: 12px 16px; cursor: pointer; }
</style></head><body>
<div class="chat">
  <div id="msgs"></div>
  <div class="row">
    <input id="inp" placeholder="Say something..." onkeydown="if(event.key==='Enter')send()"/>
    <button onclick="send()">Send</button>
  </div>
</div>
<script>
function send() {
  const text = document.getElementById('inp').value.trim();
  if (!text) return;
  addMsg(text, 'user');
  document.getElementById('inp').value = '';
  const reply = text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi') ? 'Hello there! 👋' : "Hmm, I only know how to say hello right now!";
  setTimeout(() => addMsg(reply, 'bot'), 500);
}
function addMsg(text, type) {
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.textContent = text;
  document.getElementById('msgs').appendChild(div);
  document.getElementById('msgs').scrollTop = 99999;
}
</script></body></html>`,
    remixChallenges: [
      'Make the chatbot remember and display the last 5 messages in the chat history',
      'Add a typing indicator (... animation) that shows while the bot is "thinking"',
      'Add a Clear Chat button that wipes the conversation',
    ],
  },
  // ── Spec Writer (Tier 3) ──
  {
    id: 'tier3-spec-1',
    tier: 3,
    difficulty: 'hard',
    type: 'spec',
    primarySkill: 'specification-writing',
    secondarySkill: 'decomposition',
    xp: 300,
    title: '📋 Spec a Messenger',
    story: "You are going to spec out a full messaging app. The more detail you put in your spec, the closer the AI will build exactly what you imagined.",
    challenge: 'Write a complete, detailed spec for a messaging app. Think about features, UI, edge cases, and what makes it different from existing apps.',
    concept: 'specification writing + decomposition',
    winCondition: 'spec score reaches 8/10 and built app matches spec',
    starterHint: 'Great specs cover: what the user can do, what the UI looks like, what happens with edge cases, and what makes it unique.',
  },
  // ── AI Judge (Tier 3) ──
  {
    id: 'tier3-judge-1',
    tier: 3,
    difficulty: 'hard',
    type: 'judge',
    primarySkill: 'ai-literacy',
    secondarySkill: 'giving-feedback',
    xp: 300,
    title: '⚖️ Pick the Best Chat Interface',
    story: "Three AIs built chat interfaces. One is well-designed, two have UX problems or bugs. Study them carefully and pick the winner.",
    challenge: 'Evaluate all 3 chat interfaces. Which has the best UX and fewest bugs? Explain your reasoning.',
    concept: 'ai literacy + critical evaluation',
    winCondition: 'correctly identified best version with clear technical reasoning',
    starterHint: 'Look at UX clarity, whether features work, edge cases, and code quality.',
  },
];

// ─── New Game + Music Missions ──────────────────────────────────────────────

const NEW_GAME_MISSIONS: Mission[] = [
  // Flappy Runner — Tier 1
  {
    id: 'tier1-game-flappy',
    tier: 1,
    difficulty: 'easy',
    title: '🐦 Flappy Sky Quest',
    story: 'A little bird named Pip needs to fly through a magical sky full of floating pillars! Pip can only move up or down — and needs YOUR help to dodge every obstacle.',
    challenge: 'Customise Pip\'s colour, the sky, and the pipes, then describe the world Pip flies through!',
    concept: 'Game customisation — colours, characters, difficulty',
    winCondition: 'Game built and customised with at least one AI iteration',
    starterHint: 'First pick a game type, then choose Pip\'s look, and describe the world!',
    type: 'game-builder',
    gameTemplateId: 'flappy',
    primarySkill: 'rapid-prototyping',
    xp: 60,
    free: true,
  },
  // Brick Breaker — Tier 2
  {
    id: 'tier2-game-brick',
    tier: 2,
    difficulty: 'medium',
    title: '🧱 Brick Blaster Studio',
    story: 'The Brick Dimension is overrun with magical bricks! A lone paddle-hero must bounce an energy ball to shatter them all. You\'re the game designer — make it epic.',
    challenge: 'Build a Brick Breaker game. Customise the paddle, ball, brick emojis, number of rows, and difficulty. Use vibe coding to describe the theme.',
    concept: 'Game design — difficulty tuning, visual customisation, iteration',
    winCondition: 'Brick Breaker game built with at least 2 AI iterations',
    starterHint: 'Pick Brick Breaker as your template, then describe the colour scheme and brick theme.',
    type: 'game-builder',
    gameTemplateId: 'brick-breaker',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'remix-and-extend',
    xp: 100,
  },
  // Flappy Advanced — Tier 3
  {
    id: 'tier3-game-flappy',
    tier: 3,
    difficulty: 'hard',
    title: '🐦 Flappy Advanced — Physics Remix',
    story: 'You\'re a senior game developer at VibeSoft. The Flappy Runner engine needs a full physics and difficulty overhaul. Gravity curves, pipe patterns, speed ramps — all configurable by prompt.',
    challenge: 'Use detailed prompt engineering to modify the Flappy Runner game: tune gravity curves, pipe gap algorithms, speed scaling, and add a high-score system. Aim for 3+ iterations.',
    concept: 'Prompt engineering for game physics — gravity, speed scaling, procedural generation',
    winCondition: 'Flappy game with custom physics, difficulty curve, and high-score display',
    starterHint: 'Start with a clear spec: "Modify gravity to 0.6, reduce gap size as score increases, add high-score storage in localStorage."',
    type: 'game-builder',
    gameTemplateId: 'flappy',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 180,
  },
];

const MUSIC_MISSIONS: Mission[] = [
  // Tier 1 Music
  {
    id: 'tier1-music-1',
    tier: 1,
    difficulty: 'easy',
    title: '🎵 Space Jam Machine',
    story: 'Zara the music robot is building a space soundtrack for the Galactic Parade! She needs YOUR help to describe the perfect space tune — full of beeps, blips, and cosmic vibes.',
    challenge: 'Use your words (or your voice!) to tell the AI what your space jam should sound like. Try to change the tempo, add drums, or describe a mood!',
    concept: 'Music creation — describing sound with language, iteration',
    winCondition: 'Music piece created with at least 1 AI iteration',
    starterHint: 'Try saying: "Make it sound like floating through space — slow, dreamy, with sparkly arpeggios!"',
    type: 'music',
    primarySkill: 'precision-of-language',
    xp: 60,
    free: true,
  },
  // Tier 2 Music
  {
    id: 'tier2-music-1',
    tier: 2,
    difficulty: 'medium',
    title: '🎵 Tune Builder Workshop',
    story: 'You\'ve been hired as a junior composer at Beat Lab Studios. Your first assignment: build a full track from scratch — melody, bass, drums, and arpeggios — using nothing but your description skills.',
    challenge: 'Compose a song by describing the melody, bass, and rhythm. Use musical words like tempo, key, syncopated, progression. Aim for 2+ iterations to refine your tune.',
    concept: 'Music composition — melody, rhythm, instrumentation, iteration',
    winCondition: 'Full track with melody, bass, drums, and at least 2 iterations',
    starterHint: 'Start with a vibe: "A funky beat at 130 BPM with a punchy bass on every 1 and 3, synth melody in C major."',
    type: 'music',
    primarySkill: 'precision-of-language',
    secondarySkill: 'systems-thinking',
    xp: 100,
  },
  // Tier 3 Music
  {
    id: 'tier3-music-1',
    tier: 3,
    difficulty: 'hard',
    title: '🎵 Beat Drop — Spec Edition',
    story: 'You\'re a music AI prompt engineer at SoundForge AI. Clients send you precise musical specifications and you turn them into reality using nothing but language. Today\'s brief: create a complete track spec and iterate until it\'s perfect.',
    challenge: 'Write a detailed musical specification (key, time signature, BPM, instruments, mood, structure) and use 3+ AI iterations to achieve your vision. Show your prompt engineering skills!',
    concept: 'Prompt engineering for creative AI — music specification, iteration, feedback loops',
    winCondition: 'Music piece created from a detailed spec with 3+ iterations showing clear improvement',
    starterHint: 'Write a spec first: "Key: A minor | BPM: 140 | 4/4 time | Instruments: drums (trap pattern), bass (root notes on 1, passing on 3), synth lead (minor pentatonic, call-and-response phrases), arp (16th notes, upper octave)."',
    type: 'music',
    primarySkill: 'specification-writing',
    secondarySkill: 'precision-of-language',
    xp: 200,
  },
];

// ─── Literature Missions ─────────────────────────────────────────────────────

const LITERATURE_MISSIONS: Mission[] = [
  {
    id: 'tier1-lit-alice',
    tier: 1,
    difficulty: 'easy',
    title: "Alice's Maze Machine",
    story: "Alice has tumbled into Wonderland and the path keeps changing! She needs a rulebook so she always knows which way to go.",
    challenge: "Write rules for Alice: if the door is red she goes left, if it's blue she goes right, if it's striped she jumps over it.",
    concept: 'conditionals',
    winCondition: 'All three door colours handled with correct directions',
    starterHint: 'Think of each colour as a question: "Is it red? Then..."',
    free: true,
    type: 'grid',
    theme: 'forest',
    primarySkill: 'decomposition',
    xp: 75,
  },
  {
    id: 'tier1-lit-beanstalk',
    tier: 1,
    difficulty: 'easy',
    title: "Jack's Beanstalk Climber",
    story: "Jack needs to climb the magic beanstalk to reach the giant's castle — but the beanstalk keeps growing! He needs a repeating plan.",
    challenge: "Give Jack instructions to climb the beanstalk step by step. He needs to repeat the same moves over and over until he reaches the top.",
    concept: 'loops',
    winCondition: 'Jack reaches the top using a repeating pattern of instructions',
    starterHint: 'What does Jack do once? Now how do you make him do it 10 times?',
    free: true,
    type: 'stars',
    primarySkill: 'pattern-recognition',
    xp: 75,
  },
  {
    id: 'tier2-lit-sherlock',
    tier: 2,
    difficulty: 'medium',
    title: "The Missing Crown Jewels",
    story: "Sherlock Holmes has built a clue-matching program to catch the thief — but something is wrong. The wrong suspects keep being flagged!",
    challenge: "Sherlock's clue-matcher has a bug. Find it, explain what went wrong, and fix it so the right culprit is identified.",
    concept: 'debugging',
    winCondition: 'Bug identified, explained clearly, and program produces the correct output',
    starterHint: 'Read the logic carefully. Does the condition check the right thing? Are the comparisons exact?',
    type: 'debug',
    primarySkill: 'debugging-with-ai',
    secondarySkill: 'precision-of-language',
    xp: 125,
  },
  {
    id: 'tier2-lit-romeo',
    tier: 2,
    difficulty: 'medium',
    title: "Romeo & Juliet's Secret Messenger",
    story: "Romeo and Juliet need to send secret messages past the Capulet guards. They need a message encoder that scrambles letters so nobody else can read them!",
    challenge: "Build a secret message encoder: take any text, shift each letter by 3 positions in the alphabet (Caesar cipher), and decode it back.",
    concept: 'string manipulation',
    winCondition: 'Encoder correctly shifts letters; decoder reverses it; example message works end-to-end',
    starterHint: 'Think about the alphabet as a number line. "A" is 0, "B" is 1... shift by 3 means add 3!',
    type: 'code',
    starterCode: "// Encode: shift each letter forward by 3\nfunction encode(message) {\n  // Your code here\n}\n\n// Test it:\nconsole.log(encode('HELLO')); // Should print 'KHOOR'",
    primarySkill: 'decomposition',
    secondarySkill: 'pattern-recognition',
    xp: 125,
  },
  {
    id: 'tier3-lit-frankenstein',
    tier: 3,
    difficulty: 'hard',
    title: "Frankenstein's Lab",
    story: "Dr Frankenstein wants to build a creature-creator app — but he needs a perfect specification before he can start. Without a good spec, the creature might turn out... wrong.",
    challenge: "Write a full product specification for a 'creature creator' web app. Define the features, user flows, edge cases, and what the AI needs to do at each step.",
    concept: 'specification writing',
    winCondition: 'Specification covers all core features, user flows, edge cases, and AI interaction points clearly enough to hand to a developer',
    starterHint: 'Start with: what does the user see first? What can they click? What does each action do? What should the AI help with?',
    type: 'spec',
    primarySkill: 'specification-writing',
    secondarySkill: 'giving-feedback',
    xp: 175,
  },
  {
    id: 'tier3-lit-1984',
    tier: 3,
    difficulty: 'hard',
    title: 'Room 101 — Doublethink Detector',
    story: "In George Orwell's 1984, the Party uses 'doublethink' — holding two contradictory beliefs at the same time. Winston wants to build a tool to expose it.",
    challenge: "Build a 'doublethink detector' web app that takes any piece of text, sends it to the Claude API, and highlights any contradictions, logical inconsistencies, or double-speak it finds.",
    concept: 'Claude API + critical thinking',
    winCondition: 'App takes text input, calls Claude API correctly, displays contradictions in a clear UI with explanations',
    starterHint: 'Prompt Claude: "Analyse this text for contradictions, double-speak, or logical inconsistencies. For each one found, quote the conflicting parts and explain why they contradict."',
    type: 'app',
    appDescription: 'A web app with a text input box and a "Detect Doublethink" button. On submit it calls the Claude API and shows highlighted contradictions with explanations below.',
    primarySkill: 'ai-literacy',
    secondarySkill: 'precision-of-language',
    xp: 200,
  },
];

// ─── Exports ────────────────────────────────────────────────────────────────

export const ALL_MISSIONS: Mission[] = [
  ...TIER1_MISSIONS,
  ...TIER2_MISSIONS,
  ...TIER3_MISSIONS,
  ...NEW_GAME_MISSIONS,
  ...MUSIC_MISSIONS,
  ...LITERATURE_MISSIONS,
];

export function getMissionsByTier(tier: 1 | 2 | 3): Mission[] {
  return ALL_MISSIONS.filter(m => m.tier === tier);
}

export function getMissionById(id: string): Mission | undefined {
  return ALL_MISSIONS.find(m => m.id === id);
}

export function getFreeMissions(): Mission[] {
  return ALL_MISSIONS.filter(m => m.free);
}
