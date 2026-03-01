/**
 * Mission library — Spring 2026 Season.
 * 15 challenges per tier, one unlocking every 2 days.
 * Tier 1 (6–8): describe in English → visual blocks
 * Tier 2 (9–12): pseudo-code + AI pair coding
 * Tier 3 (13–16): prompt engineering + real apps
 */

import type { SkillId } from './skills';

export type MissionType = 'grid' | 'code' | 'app' | 'builder' | 'game-builder' | 'debug' | 'remix' | 'spec' | 'judge' | 'music' | 'animate';

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
  /** Season day this mission unlocks (1 = day 1 of season, 3 = day 3, etc.) */
  seasonDay?: number;
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
  // Character emoji to display in grid games instead of the default Pac-Man
  character?: string;
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

// ─── TIER 1: Explorers (6–8) ────────────────────────────────────────────────

const TIER1_MISSIONS: Mission[] = [
  // Day 1 — Snake Attack
  {
    id: 'tier1-snake-attack',
    tier: 1,
    difficulty: 'easy',
    free: true,
    seasonDay: 1,
    type: 'game-builder',
    gameTemplateId: 'snake',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'precision-of-language',
    xp: 60,
    title: '🐍 Snake Attack',
    story: "A tiny snake named Slinky is hungry! Every time Slinky eats a star it grows bigger. Help design Slinky's world — change its look, pick new food, make it yours!",
    challenge: "Customise the Snake game: change the snake emoji, pick new food items, and describe the grid world Slinky lives in.",
    concept: 'Game customisation — characters, objects, environment',
    winCondition: 'Snake game customised and playable with at least 1 AI iteration',
    starterHint: 'Try: "Make the snake a sparkly dragon 🐉 and the food be treasure chests 💎 on a dark blue grid"',
  },
  // Day 3 — Space Jam Machine
  {
    id: 'tier1-music-1',
    tier: 1,
    difficulty: 'easy',
    free: true,
    seasonDay: 3,
    title: '🎵 Space Jam Machine',
    story: 'Zara the music robot is building a space soundtrack for the Galactic Parade! She needs YOUR help to describe the perfect space tune — full of beeps, blips, and cosmic vibes.',
    challenge: 'Use your words (or your voice!) to tell the AI what your space jam should sound like. Try to change the tempo, add drums, or describe a mood!',
    concept: 'Music creation — describing sound with language, iteration',
    winCondition: 'Music piece created with at least 1 AI iteration',
    starterHint: 'Try saying: "Make it sound like floating through space — slow, dreamy, with sparkly arpeggios!"',
    type: 'music',
    primarySkill: 'precision-of-language',
    xp: 60,
  },
  // Day 5 — Alien Invasion
  {
    id: 'tier1-alien-invasion',
    tier: 1,
    difficulty: 'easy',
    seasonDay: 5,
    type: 'game-builder',
    gameTemplateId: 'space-blaster',
    primarySkill: 'rapid-prototyping',
    xp: 60,
    title: '🚀 Alien Invasion',
    story: "Aliens are invading the galaxy! Design your ultimate space battle — what does your ship look like? Who are the enemies? Make the most epic space game ever!",
    challenge: 'Customise the Space Blaster: change the spaceship, alien enemies, and background. Describe a unique space world!',
    concept: 'Game events and scoring',
    winCondition: 'Space game customised and playable with a unique theme',
    starterHint: 'Try: "Make the ship a unicorn 🦄, the enemies be broccoli 🥦, and the background a rainbow galaxy"',
  },
  // Day 7 — Flap Harder
  {
    id: 'tier1-flap-harder',
    tier: 1,
    difficulty: 'easy',
    free: true,
    seasonDay: 7,
    title: '🐦 Flap Harder',
    story: 'A little bird named Pip needs to fly through a magical sky full of floating pillars! Pip can only move up or down — and needs YOUR help to dodge every obstacle.',
    challenge: "Customise Pip's colour, the sky, and the pipes, then describe the world Pip flies through!",
    concept: 'Game customisation — colours, characters, difficulty',
    winCondition: 'Game built and customised with at least one AI iteration',
    starterHint: "First pick Pip's look, then describe the world! Try: 'Make Pip a golden eagle flying through storm clouds'",
    type: 'game-builder',
    gameTemplateId: 'flappy',
    primarySkill: 'rapid-prototyping',
    xp: 60,
  },
  // Day 9 — Bug Catcher
  {
    id: 'tier1-debug-1',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 9,
    type: 'debug',
    primarySkill: 'debugging-with-ai',
    secondarySkill: 'precision-of-language',
    xp: 75,
    title: '🐛 Bug Catcher',
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
  // Day 11 — Magic Buttons
  {
    id: 'tier1-magic-buttons',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 11,
    type: 'remix',
    primarySkill: 'remix-and-extend',
    secondarySkill: 'giving-feedback',
    xp: 75,
    title: '🎨 Magic Buttons',
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
  // Day 13 — Wall Smasher
  {
    id: 'tier1-wall-smasher',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 13,
    type: 'game-builder',
    gameTemplateId: 'brick-breaker',
    primarySkill: 'rapid-prototyping',
    xp: 80,
    title: '🧱 Wall Smasher',
    story: "BOING! A magic ball bounces around smashing bricks! You're the game artist — design the most satisfying brick-smashing adventure with your own theme!",
    challenge: 'Customise the Brick Breaker game: pick a colour theme, change the brick emojis, and design the paddle. Make it look amazing!',
    concept: 'Collision detection and game design',
    winCondition: 'Brick Breaker customised with a theme and playable',
    starterHint: 'Try: "Make an underwater theme — blue bricks, fish emojis, coral paddle, bubbles when bricks break"',
  },
  // Day 15 — Doodle Animator (NEW)
  {
    id: 'tier1-animate-doodle',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 15,
    type: 'animate',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 90,
    title: '🖼️ Doodle Animator',
    story: "Imagine your drawing coming to life! Place shapes on a canvas, draw your scene, then describe how everything should move. The AI will animate it just for you!",
    challenge: 'Place some shapes on the canvas (a sun, clouds, trees), then describe how you want them to move. Watch your scene come alive!',
    concept: 'Creative expression + describing motion',
    winCondition: 'Scene drawn and animated with at least 1 AI iteration',
    starterHint: 'Start simple! Place a sun and cloud, then say: "Make the sun slowly rise and the cloud drift across"',
  },
  // Day 17 — Jump Quest
  {
    id: 'tier1-jump-quest',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 17,
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'decomposition',
    secondarySkill: 'precision-of-language',
    xp: 80,
    title: '🏃 Jump Quest',
    story: "You get to build your very own video game! Pick a hero, choose what to collect, add bad guys, and design your world. Then PLAY it!",
    challenge: 'Build your own platformer game! Pick your character, collectibles, enemies, and describe what your world looks like.',
    concept: 'decomposition + precision of language',
    winCondition: 'customised platformer game is playable with at least 3 personalised elements',
    starterHint: 'Start by picking a fun character — a cat? a robot? a dragon? Then decide what you want to collect!',
  },
  // Day 19 — Ghost Escape (single maze mission)
  {
    id: 'tier1-ghost-escape',
    tier: 1,
    difficulty: 'hard',
    seasonDay: 19,
    type: 'grid',
    theme: 'space',
    primarySkill: 'decomposition',
    secondarySkill: 'precision-of-language',
    xp: 100,
    title: '👻 Ghost Escape',
    story: "You're trapped in a haunted maze! The exit glows green but the path twists and turns. Can you find your way out before the ghost catches you?",
    challenge: 'Navigate the haunted maze to reach the glowing exit. Use conditionals to check for walls at every turn!',
    concept: 'loops + nested conditionals',
    winCondition: 'character reaches the exit without hitting walls',
    starterHint: 'At each step, check: is there a wall ahead? If yes, turn. Keep checking until you find the exit!',
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
  // Day 21 — Jungle Beat Drops
  {
    id: 'tier1-jungle-beat',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 21,
    type: 'music',
    primarySkill: 'precision-of-language',
    secondarySkill: 'pattern-recognition',
    xp: 75,
    title: '🎵 Jungle Beat Drops',
    story: "Deep in the jungle, the animals are throwing a party! But they need a beat that sounds wild and alive. Can you describe the perfect jungle rhythm?",
    challenge: 'Create a jungle-themed music track. Describe the drums, animal sounds, and wild rhythm you want to hear!',
    concept: 'Music creation — rhythm, mood, instrumentation',
    winCondition: 'Jungle music track created with at least 1 iteration',
    starterHint: 'Try: "Add a deep tribal drum pattern, jungle bird sounds, and a bouncy marimba melody"',
  },
  // Day 23 — My Chatbot Friend
  {
    id: 'tier1-chatbot-friend',
    tier: 1,
    difficulty: 'hard',
    seasonDay: 23,
    type: 'builder',
    primarySkill: 'ai-literacy',
    secondarySkill: 'precision-of-language',
    xp: 90,
    title: '💬 My Chatbot Friend',
    story: "Imagine having a robot friend who always has time to chat! What would your robot friend be like? Describe its personality and it will come to life!",
    challenge: 'Build a chatbot with a fun personality. Give it a name, a way of talking, and things it loves. Then chat with it!',
    concept: 'AI literacy + describing personality',
    winCondition: 'Chatbot built with a clear personality and responds to 5+ different messages',
    starterHint: 'Think: what is my chatbot called? Is it funny? Serious? What topics does it love talking about?',
  },
  // Day 25 — Colour Mixer
  {
    id: 'tier1-colour-mixer',
    tier: 1,
    difficulty: 'hard',
    seasonDay: 25,
    type: 'app',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'systems-thinking',
    xp: 90,
    title: '🌈 Colour Mixer',
    story: "Red + Blue = Purple! What if you could mix any colours together and see what you get? Build a colour mixing app and experiment with every combination!",
    challenge: 'Build a colour mixer app where you can pick two colours and see what they make. Add a colour wheel or sliders!',
    concept: 'Colour theory + simple app building',
    winCondition: 'Colour mixer app works and correctly shows mixed colours',
    starterHint: 'Think about what the user needs: two colour pickers, a mix button, and a box showing the result colour',
  },
  // Day 27 — Snake 2.0: Add a Friend
  {
    id: 'tier1-snake-2',
    tier: 1,
    difficulty: 'hard',
    seasonDay: 27,
    type: 'game-builder',
    gameTemplateId: 'snake',
    primarySkill: 'remix-and-extend',
    secondarySkill: 'systems-thinking',
    xp: 100,
    title: '🐍 Snake 2.0: Add a Friend',
    story: "Slinky is lonely! Can you add a second snake so two players can race each other? Or add a friendly companion that follows Slinky around?",
    challenge: 'Remix the Snake game to add something new: a second player, a helper companion, or special power-up food. Make Snake more exciting!',
    concept: 'Remix & extend — adding new mechanics',
    winCondition: 'Snake game remixed with at least 1 new mechanic',
    starterHint: 'Pick ONE new idea: 2-player mode, a food that shrinks the snake, or a teleport portal. Describe it clearly!',
  },
  // Day 29 — My Best Creation
  {
    id: 'tier1-best-creation',
    tier: 1,
    difficulty: 'hard',
    seasonDay: 29,
    type: 'app',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'specification-writing',
    xp: 150,
    title: '🏆 My Best Creation',
    story: "It's the end of the season — time to build YOUR masterpiece! Take everything you've learned and make something you're truly proud of. Anything goes!",
    challenge: 'Build any app, game, or tool you want. Use all your skills — describe it clearly, iterate, and make it awesome!',
    concept: 'All skills — creativity + iteration',
    winCondition: 'A working creation that uses at least 3 skills from the season',
    starterHint: "Think about your favourite challenge this season. Can you make something like that, but YOUR way? Write down your idea first!",
    appDescription: 'Your ultimate creation. Make it yours!',
  },
];

// ─── TIER 2: Adventurers (9–12) ────────────────────────────────────────────

const TIER2_MISSIONS: Mission[] = [
  // Day 1 — Snake Remix Lab
  {
    id: 'tier2-snake-remix',
    tier: 2,
    difficulty: 'easy',
    free: true,
    seasonDay: 1,
    type: 'game-builder',
    gameTemplateId: 'snake',
    primarySkill: 'remix-and-extend',
    secondarySkill: 'giving-feedback',
    xp: 75,
    title: '🐍 Snake Remix Lab',
    story: "Everyone knows Snake — but nobody's played YOUR version! Redesign it with wild themes, special food, and unique rules.",
    challenge: 'Remix the classic Snake: change the theme, add special food types, obstacles, and make it uniquely yours.',
    concept: 'remix & extend + giving feedback',
    winCondition: 'custom snake game with at least 2 unique features not in the original',
    starterHint: 'What if the snake was in space? Or underwater? What if eating certain foods gave you special powers?',
  },
  // Day 3 — Beat Drop Workshop
  {
    id: 'tier2-music-1',
    tier: 2,
    difficulty: 'medium',
    free: true,
    seasonDay: 3,
    title: '🎵 Beat Drop Workshop',
    story: "You've been hired as a junior composer at Beat Lab Studios. Your first assignment: build a full track from scratch — melody, bass, drums, and arpeggios — using nothing but your description skills.",
    challenge: 'Compose a song by describing the melody, bass, and rhythm. Use musical words like tempo, key, syncopated, progression. Aim for 2+ iterations to refine your tune.',
    concept: 'Music composition — melody, rhythm, instrumentation, iteration',
    winCondition: 'Full track with melody, bass, drums, and at least 2 iterations',
    starterHint: 'Start with a vibe: "A funky beat at 130 BPM with a punchy bass on every 1 and 3, synth melody in C major."',
    type: 'music',
    primarySkill: 'precision-of-language',
    secondarySkill: 'systems-thinking',
    xp: 100,
  },
  // Day 5 — Space Wars
  {
    id: 'tier2-space-wars',
    tier: 2,
    difficulty: 'medium',
    seasonDay: 5,
    type: 'game-builder',
    gameTemplateId: 'space-blaster',
    primarySkill: 'systems-thinking',
    secondarySkill: 'precision-of-language',
    xp: 100,
    title: '🚀 Space Wars',
    story: "Design your own space shooter! What does your ship look like? What aliens are you fighting? What power-ups can you grab?",
    challenge: 'Build a space shooter: describe the ship, enemy types, weapons, and power-ups. Make it challenging but fair!',
    concept: 'systems thinking + precision of language',
    winCondition: 'playable space shooter with multiple enemy types and at least one power-up',
    starterHint: 'Think about what makes a great space game: different enemy types, interesting weapons, and a progression that gets harder.',
  },
  // Day 7 — Flappy Physics Lab
  {
    id: 'tier2-flappy-physics',
    tier: 2,
    difficulty: 'easy',
    seasonDay: 7,
    type: 'game-builder',
    gameTemplateId: 'flappy',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'systems-thinking',
    xp: 75,
    title: '🐦 Flappy Physics Lab',
    story: "You're a junior game designer at VibeStudio. The Flappy template is on your desk — tune the physics and aesthetics to create the perfect flying challenge.",
    challenge: "Modify the Flappy game's physics and visuals: adjust gravity, pipe gap, scroll speed, or character. Use at least 2 iterations to balance the difficulty.",
    concept: 'Game physics — gravity, speed, difficulty tuning',
    winCondition: 'Flappy game with custom physics and aesthetics, 2+ iterations',
    starterHint: 'Try: "Change the bird to a rocket 🚀, gravity to 0.4, pipes into skyscrapers, gap size 160px"',
  },
  // Day 9 — Calculator Crash (debug)
  {
    id: 'tier2-debug-1',
    tier: 2,
    difficulty: 'medium',
    seasonDay: 9,
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
    <button onclick="input('0')">0</button><button onclick="input('.')">.</button><button class="op" onclick="input('/')">÷</button><button onclick="clearAll()">C</button>
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
    const parts = expr.split(/([+\\-*\\/])/);
    const a = parseInt(parts[0]); // BUG: should be parseFloat, parseInt("-5.5") = NaN
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
  // Day 11 — Calculator Upgrade (remix)
  {
    id: 'tier2-remix-1',
    tier: 2,
    difficulty: 'medium',
    seasonDay: 11,
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
  // Day 13 — Brick Blaster Studio
  {
    id: 'tier2-brick-blaster',
    tier: 2,
    difficulty: 'medium',
    seasonDay: 13,
    title: '🧱 Brick Blaster Studio',
    story: "The Brick Dimension is overrun with magical bricks! A lone paddle-hero must bounce an energy ball to shatter them all. You're the game designer — make it epic.",
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
  // Day 15 — Animator Studio (NEW)
  {
    id: 'tier2-animate-studio',
    tier: 2,
    difficulty: 'medium',
    seasonDay: 15,
    type: 'animate',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 120,
    title: '🖼️ Animator Studio',
    story: "You're a junior animator at VibeMotion Studios! Draw a scene with shapes and your own artwork, then describe exactly how every element should move. Watch it come alive!",
    challenge: 'Create an animated scene: place shapes and draw details, then describe the motion — floating, bouncing, spinning, fading. Iterate until it looks amazing!',
    concept: 'Animation principles + describing motion precisely',
    winCondition: 'Scene drawn and animated with 2+ AI iterations, multiple elements moving',
    starterHint: 'Try: place sun, clouds, trees. Then describe: "Sun slowly rises from bottom, clouds drift left, trees sway gently"',
  },
  // Day 17 — Platformer Builder
  {
    id: 'tier2-platformer-builder',
    tier: 2,
    difficulty: 'medium',
    seasonDay: 17,
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'decomposition',
    xp: 100,
    title: '🏃 Platformer Builder',
    story: "Time to build a real platformer game from scratch! Describe your world, characters, and gameplay — then play it live.",
    challenge: 'Use vibe coding to design a complete platformer: describe the theme, enemies, power-ups, and level design in detail.',
    concept: 'rapid prototyping + decomposition',
    winCondition: 'fully playable platformer with custom theme, enemies, and collectibles',
    starterHint: 'Be specific! Instead of "make it cool", say "underwater theme with jellyfish enemies that float up and down, collect pearls, blue gradient background".',
  },
  // Day 19 — Chatbot Lab
  {
    id: 'tier2-chatbot-lab',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 19,
    type: 'builder',
    primarySkill: 'ai-literacy',
    secondarySkill: 'systems-thinking',
    xp: 125,
    title: '💬 Chatbot Lab',
    story: "Build a simple chatbot that can answer questions about your favourite topic!",
    challenge: 'Create a chatbot that recognises keywords and gives matching responses. Make it friendly and surprisingly smart!',
    concept: 'objects + string matching + functions',
    winCondition: 'chatbot responds correctly to at least 5 different inputs',
    starterHint: 'Store responses in an object. Check if the user message contains keywords.',
  },
  // Day 21 — Weather Dashboard
  {
    id: 'tier2-weather-dashboard',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 21,
    type: 'app',
    primarySkill: 'precision-of-language',
    secondarySkill: 'systems-thinking',
    xp: 125,
    title: '🌦️ Weather Dashboard',
    story: "Build a beautiful weather dashboard. It should show the forecast, suggest what to wear, and look great on any screen.",
    challenge: 'Build a weather dashboard: enter a city, see the forecast, get outfit advice. Use at least 2 iterations to polish the UI.',
    concept: 'UI design + conditional logic + API concepts',
    winCondition: 'Dashboard shows weather info, outfit suggestion, and has a polished UI',
    starterHint: 'Start with the layout: a search bar, a big temperature display, and cards for each day of the week',
  },
  // Day 23 — Quiz Master Pro
  {
    id: 'tier2-quiz-master',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 23,
    type: 'app',
    primarySkill: 'systems-thinking',
    secondarySkill: 'specification-writing',
    xp: 125,
    title: '🧠 Quiz Master Pro',
    story: "Design a quiz game for your class! It should ask questions, check answers, keep score, and have a winner screen.",
    challenge: 'Build the quiz engine with time limits, score tracking, and a results screen. Make it feel like a real game show!',
    concept: 'arrays + loops + conditionals + UX',
    winCondition: 'quiz runs through all questions, tracks score, shows results',
    starterHint: 'Store your questions in a list. Loop through them one by one. Add a timer for extra challenge!',
  },
  // Day 25 — Spec a Habit Tracker
  {
    id: 'tier2-spec-1',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 25,
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
  // Day 27 — Pick the Best Code
  {
    id: 'tier2-judge-1',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 27,
    type: 'judge',
    primarySkill: 'ai-literacy',
    secondarySkill: 'giving-feedback',
    xp: 150,
    title: '⚖️ Pick the Best Code',
    story: "Three different AIs each built a todo app. One is great, two have problems. Can you spot which is best and explain why?",
    challenge: 'Look at all 3 todo apps. Pick the best one and explain why the other two have issues.',
    concept: 'ai literacy + giving feedback',
    winCondition: 'correctly identified best version with clear reasoning',
    starterHint: 'Look for: does it work properly? Is it easy to use? Does anything break?',
  },
  // Day 29 — Ghost AI Maze (single maze mission for tier 2)
  {
    id: 'tier2-ghost-maze',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 29,
    type: 'game-builder',
    gameTemplateId: 'maze',
    primarySkill: 'systems-thinking',
    secondarySkill: 'precision-of-language',
    xp: 150,
    title: '👻 Ghost AI Maze',
    story: "Classic Pac-Man — but YOU control the rules! Change how the ghosts behave, redesign the scoring, add new power-ups. This maze is yours now.",
    challenge: 'Redesign the Maze game by changing the player character, ghost behaviour, or scoring rules. Describe every change precisely.',
    concept: 'AI behaviour and game state management',
    winCondition: 'Maze game with custom characters and at least one mechanic changed',
    starterHint: 'Try: "Make the player a cat 🐱 chasing mice 🐭, ghosts become dogs that bark when near, power-up freezes them for 3 seconds"',
  },
];

// ─── TIER 3: Vibe Coders (13–16) ───────────────────────────────────────────

const TIER3_MISSIONS: Mission[] = [
  // Day 1 — Snake Studio
  {
    id: 'tier3-snake-studio',
    tier: 3,
    difficulty: 'easy',
    free: true,
    seasonDay: 1,
    type: 'game-builder',
    gameTemplateId: 'snake',
    primarySkill: 'specification-writing',
    secondarySkill: 'rapid-prototyping',
    xp: 100,
    title: '🐍 Snake Studio',
    story: "Classic Snake is too simple. You're a senior engineer at VibeSoft Games. Design Snake 2.0: new mechanics, an AI opponent, portals, or a leaderboard. You spec it, the AI builds it.",
    challenge: 'Write a detailed feature specification for an advanced Snake game and implement it through precise prompting. Aim for 3+ novel features.',
    concept: 'Specification writing and feature planning',
    winCondition: 'At least 3 novel features working correctly as described in spec',
    starterHint: 'Write a spec: "Feature 1: Walls spawn randomly every 10s. Feature 2: AI snake competes for food. Feature 3: Portal pairs on opposite walls. Feature 4: localStorage leaderboard top 5."',
  },
  // Day 3 — Beat Drop: Spec Edition
  {
    id: 'tier3-music-1',
    tier: 3,
    difficulty: 'hard',
    free: true,
    seasonDay: 3,
    title: '🎵 Beat Drop: Spec Edition',
    story: "You're a music AI prompt engineer at SoundForge AI. Clients send you precise musical specifications and you turn them into reality using nothing but language. Today's brief: create a complete track spec and iterate until it's perfect.",
    challenge: 'Write a detailed musical specification (key, time signature, BPM, instruments, mood, structure) and use 3+ AI iterations to achieve your vision. Show your prompt engineering skills!',
    concept: 'Prompt engineering for creative AI — music specification, iteration, feedback loops',
    winCondition: 'Music piece created from a detailed spec with 3+ iterations showing clear improvement',
    starterHint: 'Write a spec first: "Key: A minor | BPM: 140 | 4/4 time | Instruments: drums (trap pattern), bass (root notes on 1, passing on 3), synth lead (minor pentatonic, call-and-response phrases), arp (16th notes, upper octave)."',
    type: 'music',
    primarySkill: 'specification-writing',
    secondarySkill: 'precision-of-language',
    xp: 200,
  },
  // Day 5 — Space Wars: AI Mode
  {
    id: 'tier3-space-wars-ai',
    tier: 3,
    difficulty: 'medium',
    seasonDay: 5,
    type: 'game-builder',
    gameTemplateId: 'space-blaster',
    primarySkill: 'systems-thinking',
    secondarySkill: 'rapid-prototyping',
    xp: 175,
    title: '🚀 Space Wars: AI Mode',
    story: "Build an epic space shooter with boss fights, weapon upgrades, and a wave system. Make it addictively fun!",
    challenge: 'Create a deep space shooter with wave progression, boss fights every 5 waves, weapon upgrades, and a high-score system.',
    concept: 'systems thinking + rapid prototyping',
    winCondition: 'space shooter with wave system, at least 1 boss fight, and weapon upgrades',
    starterHint: 'Start with the core loop: waves of enemies that get harder. Then add bosses, then power-ups. Layer by layer.',
  },
  // Day 7 — Flappy: Engine Rebuild
  {
    id: 'tier3-flappy-engine',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 7,
    title: '🐦 Flappy: Engine Rebuild',
    story: "You're a senior game developer at VibeSoft. The Flappy Runner engine needs a full physics and difficulty overhaul. Gravity curves, pipe patterns, speed ramps — all configurable by prompt.",
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
  // Day 9 — Message Mayhem (debug)
  {
    id: 'tier3-debug-1',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 9,
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
  // Day 11 — Chatbot Upgrade (remix)
  {
    id: 'tier3-remix-1',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 11,
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
  // Day 13 — Breakout: Pro Edition
  {
    id: 'tier3-breakout-pro',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 13,
    type: 'game-builder',
    gameTemplateId: 'brick-breaker',
    primarySkill: 'precision-of-language',
    secondarySkill: 'specification-writing',
    xp: 200,
    title: '🧱 Breakout: Pro Edition',
    story: "You've been hired to build the premium version of Breakout for VibeArcade. Power-ups, multi-ball, boss bricks, screen shake — spec the features and engineer it precisely.",
    challenge: 'Design and build a professional Breakout game using prompt engineering. Include power-ups, physics tweaks, and visual effects described precisely.',
    concept: 'Prompt engineering for game feature development',
    winCondition: 'Game includes 3+ custom features working correctly as specified',
    starterHint: 'Write precise power-up specs: "(1) Multi-ball: spawns 2 extra balls. (2) Wide Paddle: doubles width for 10 seconds. (3) Laser: shoots beam destroying all bricks in that column."',
  },
  // Day 15 — Animator Studio Pro (NEW)
  {
    id: 'tier3-animate-pro',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 15,
    type: 'animate',
    primarySkill: 'specification-writing',
    secondarySkill: 'precision-of-language',
    xp: 250,
    title: '🖼️ Animator Studio Pro',
    story: "You're a senior animator at VibeMotion. Your client wants a physics-driven animated scene — particles, gravity, bouncing objects. Write a precise animation spec and iterate until it's perfect.",
    challenge: 'Create a complex animated scene with physics-inspired effects. Describe velocity, gravity, particle systems, and coordinated multi-element animations. Aim for 3+ iterations.',
    concept: 'Physics-based animation — velocity, gravity, particles, timing',
    winCondition: 'Scene animated with physics effects and 3+ iterations showing clear improvement',
    starterHint: 'Write a spec: "Particles emit from sun, subject to gravity. Clouds drift with parallax. Rain droplets fall and splash. All timed to a 4-second loop."',
  },
  // Day 17 — Platformer: Full Build
  {
    id: 'tier3-platformer-full',
    tier: 3,
    difficulty: 'medium',
    seasonDay: 17,
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'specification-writing',
    secondarySkill: 'rapid-prototyping',
    xp: 200,
    title: '🏃 Platformer: Full Build',
    story: "You're a game designer now. Build a complete platformer with multiple levels, increasing difficulty, boss mechanics, and polished visuals.",
    challenge: 'Design a professional-quality platformer: write detailed specs for level progression, enemy AI patterns, scoring systems, and visual polish. Iterate until it feels like a real game.',
    concept: 'specification writing + all skills',
    winCondition: 'polished platformer with difficulty progression, multiple enemy types, and a scoring system',
    starterHint: 'Think like a game designer: write a spec first. "Level 1: easy, 3 platforms, slow enemies. Level 2: moving platforms, faster enemies, new collectible type."',
  },
  // Day 19 — AI Personality Engine
  {
    id: 'tier3-ai-personality',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 19,
    type: 'app',
    primarySkill: 'ai-literacy',
    secondarySkill: 'systems-thinking',
    xp: 250,
    title: '💬 AI Personality Engine',
    story: "Build your own AI chatbot powered by Claude! Give it a personality, a purpose, and make it help people.",
    challenge: 'Build a chatbot with a custom personality and purpose. Use the Claude API to power it. Ship it.',
    concept: 'API integration + system prompts + UX',
    winCondition: 'chatbot has custom personality, calls Claude API, and handles conversation history',
    starterHint: "The most important thing is the system prompt. Describe your bot's personality and role clearly.",
    appDescription: 'Your own AI-powered chatbot. What will it specialise in?',
  },
  // Day 21 — Data Story
  {
    id: 'tier3-data-story',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 21,
    type: 'app',
    primarySkill: 'decomposition',
    secondarySkill: 'systems-thinking',
    xp: 250,
    title: '📊 Data Story',
    story: "Raw numbers are boring. Build a tool that takes data and makes it visual and beautiful! Turn spreadsheets into stories.",
    challenge: 'Build a chart builder: take some data (e.g. your top 5 movies with ratings) and visualise it with bars, lines, or charts. Add a title and make it shareable.',
    concept: 'data transformation + SVG/Canvas + storytelling with data',
    winCondition: 'visualiser correctly renders data as an interactive chart with titles and labels',
    starterHint: 'Try: "Build a bar chart component that takes an array of {label, value} objects and renders colourful animated bars"',
  },
  // Day 23 — Spec a Messenger
  {
    id: 'tier3-spec-1',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 23,
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
  // Day 25 — Code Review Panel
  {
    id: 'tier3-judge-1',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 25,
    type: 'judge',
    primarySkill: 'ai-literacy',
    secondarySkill: 'giving-feedback',
    xp: 300,
    title: '⚖️ Code Review Panel',
    story: "Three AIs built chat interfaces. One is well-designed, two have UX problems or bugs. Study them carefully and pick the winner.",
    challenge: 'Evaluate all 3 chat interfaces. Which has the best UX and fewest bugs? Explain your reasoning.',
    concept: 'ai literacy + critical evaluation',
    winCondition: 'correctly identified best version with clear technical reasoning',
    starterHint: 'Look at UX clarity, whether features work, edge cases, and code quality.',
  },
  // Day 27 — AI Detector App
  {
    id: 'tier3-ai-detector',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 27,
    type: 'app',
    primarySkill: 'ai-literacy',
    secondarySkill: 'precision-of-language',
    xp: 300,
    title: '🤖 AI Detector App',
    story: "In a world full of AI-generated content, can you build a tool that spots it? Use Claude to analyse text and find the tell-tale signs of AI writing.",
    challenge: "Build an AI detector web app: text input → Claude API → analysis of whether the text was AI-written, with evidence and confidence score.",
    concept: 'Claude API + critical thinking + UX design',
    winCondition: 'App takes text input, calls Claude API correctly, displays analysis with confidence and evidence',
    starterHint: "Prompt Claude: \"Analyse this text and determine if it was likely written by AI. Look for: uniform sentence rhythm, lack of personal voice, hedging language, overly balanced arguments. Output: verdict (AI/Human/Uncertain), confidence %, 3 key evidence points.\"",
    appDescription: 'A web app that analyses text and rates the probability it was written by AI.',
  },
  // Day 29 — Landing Page Lab
  {
    id: 'tier3-landing-lab',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 29,
    type: 'app',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 300,
    title: '🌐 Landing Page Lab',
    story: "You have a brilliant app idea. Now you need a landing page to show the world — and get people to sign up! This is the ultimate creative challenge.",
    challenge: 'Use AI to build a stunning landing page. Describe your app idea, its features, and who it is for. Iterate until it looks professional enough to launch.',
    concept: 'prompt engineering + HTML/CSS + product thinking',
    winCondition: 'landing page has headline, features section, social proof, and signup CTA',
    starterHint: 'Start with a clear prompt: "Build a landing page for an app called X that does Y for Z people. Make it look like a modern SaaS product."',
    appDescription: 'Describe your app idea and the AI will generate a complete, professional landing page.',
  },
];

// ─── Exports ────────────────────────────────────────────────────────────────

export const ALL_MISSIONS: Mission[] = [
  ...TIER1_MISSIONS,
  ...TIER2_MISSIONS,
  ...TIER3_MISSIONS,
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

export function getSeasonMissions(tier: 1 | 2 | 3): Mission[] {
  return getMissionsByTier(tier)
    .filter(m => m.seasonDay !== undefined)
    .sort((a, b) => (a.seasonDay ?? 0) - (b.seasonDay ?? 0));
}
