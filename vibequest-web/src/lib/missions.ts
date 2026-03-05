/**
 * Mission library — Spring 2026 Season (Streamlined).
 * 10 quests per tier, one unlocking every 3 days.
 * Focused on: Vibe-coding games, Music creation, and School/Creative apps.
 *
 * Tier 1 (6–8): describe in English → AI builds it
 * Tier 2 (9–12): iterative prompting, deeper customisation
 * Tier 3 (13–16): prompt engineering, full app building
 */

import type { SkillId } from './skills';

export type MissionType = 'game-builder' | 'music' | 'app';

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
  /** Season day this mission unlocks (1 = day 1 of season) */
  seasonDay?: number;
  type: MissionType;
  /** Game builder: which template to use */
  gameTemplateId?: string;
  primarySkill?: SkillId;
  secondarySkill?: SkillId;
  xp?: number;
  /** Tier 3 app missions: description shown in sandbox */
  appDescription?: string;
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
    type: 'music',
    primarySkill: 'precision-of-language',
    xp: 60,
    title: '🎵 Space Jam Machine',
    story: 'Zara the music robot is building a space soundtrack for the Galactic Parade! She needs YOUR help to describe the perfect space tune — full of beeps, blips, and cosmic vibes.',
    challenge: 'Use your words (or your voice!) to tell the AI what your space jam should sound like. Try to change the tempo, add drums, or describe a mood!',
    concept: 'Music creation — describing sound with language, iteration',
    winCondition: 'Music piece created with at least 1 AI iteration',
    starterHint: 'Try saying: "Make it sound like floating through space — slow, dreamy, with sparkly arpeggios!"',
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
  // Day 8 — Flap Harder
  {
    id: 'tier1-flap-harder',
    tier: 1,
    difficulty: 'easy',
    free: true,
    seasonDay: 8,
    type: 'game-builder',
    gameTemplateId: 'flappy',
    primarySkill: 'rapid-prototyping',
    xp: 60,
    title: '🐦 Flap Harder',
    story: 'A little bird named Pip needs to fly through a magical sky full of floating pillars! Pip can only move up or down — and needs YOUR help to dodge every obstacle.',
    challenge: "Customise Pip's colour, the sky, and the pipes, then describe the world Pip flies through!",
    concept: 'Game customisation — colours, characters, difficulty',
    winCondition: 'Game built and customised with at least one AI iteration',
    starterHint: "First pick Pip's look, then describe the world! Try: 'Make Pip a golden eagle flying through storm clouds'",
  },
  // Day 11 — Wall Smasher
  {
    id: 'tier1-wall-smasher',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 11,
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
  // Day 14 — Jump Quest
  {
    id: 'tier1-jump-quest',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 14,
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'decomposition',
    secondarySkill: 'precision-of-language',
    xp: 80,
    title: '🏃 Jump Quest',
    story: "You get to build your very own video game! Pick a hero, choose what to collect, add bad guys, and design your world. Then PLAY it!",
    challenge: 'Build your own platformer game! Pick your character, collectibles, enemies, and describe what your world looks like.',
    concept: 'Decomposition + precision of language',
    winCondition: 'Customised platformer game is playable with at least 3 personalised elements',
    starterHint: 'Start by picking a fun character — a cat? a robot? a dragon? Then decide what you want to collect!',
  },
  // Day 17 — Ghost Maze
  {
    id: 'tier1-ghost-maze',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 17,
    type: 'game-builder',
    gameTemplateId: 'maze',
    primarySkill: 'systems-thinking',
    secondarySkill: 'precision-of-language',
    xp: 80,
    title: '👻 Ghost Maze',
    story: "You're trapped in a haunted maze! Design your own version — change the player, the ghosts, the power-ups, and how the maze looks!",
    challenge: 'Customise the Maze game: change the player emoji, ghost behaviour, add power-ups, and describe a spooky (or silly!) theme.',
    concept: 'Game design — character behaviour, power-ups',
    winCondition: 'Maze game customised with unique characters and theme',
    starterHint: 'Try: "Make the player a cat 🐱 chasing mice 🐭, ghosts become dogs, power-up freezes them"',
  },
  // Day 20 — Jungle Beat Drops
  {
    id: 'tier1-jungle-beat',
    tier: 1,
    difficulty: 'medium',
    seasonDay: 20,
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
  // Day 23 — My Quiz App
  {
    id: 'tier1-quiz-app',
    tier: 1,
    difficulty: 'hard',
    seasonDay: 23,
    type: 'app',
    primarySkill: 'systems-thinking',
    secondarySkill: 'precision-of-language',
    xp: 90,
    title: '🧠 My Quiz App',
    story: "Make a quiz about your favourite topic! Animals, planets, football, movies — YOU pick. Build a quiz game your friends can play!",
    challenge: 'Build a quiz app with 5 questions about a topic you love. Add a score counter, colourful buttons, and a winner screen!',
    concept: 'App building — questions, answers, scoring',
    winCondition: 'Quiz app works with questions, scoring, and a results screen',
    starterHint: 'Tell the AI: "Build a quiz about dinosaurs with 5 questions, 4 answer buttons each, a score counter, and confetti when you win"',
  },
  // Day 26 — Snake 2.0: Add a Friend
  {
    id: 'tier1-snake-2',
    tier: 1,
    difficulty: 'hard',
    seasonDay: 26,
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
    concept: 'Remix & extend + giving feedback',
    winCondition: 'Custom snake game with at least 2 unique features not in the original',
    starterHint: 'What if the snake was in space? Or underwater? What if eating certain foods gave you special powers?',
  },
  // Day 3 — Beat Drop Workshop
  {
    id: 'tier2-music-1',
    tier: 2,
    difficulty: 'medium',
    free: true,
    seasonDay: 3,
    type: 'music',
    primarySkill: 'precision-of-language',
    secondarySkill: 'systems-thinking',
    xp: 100,
    title: '🎵 Beat Drop Workshop',
    story: "You've been hired as a junior composer at Beat Lab Studios. Your first assignment: build a full track from scratch — melody, bass, drums, and arpeggios — using nothing but your description skills.",
    challenge: 'Compose a song by describing the melody, bass, and rhythm. Use musical words like tempo, key, syncopated, progression. Aim for 2+ iterations to refine your tune.',
    concept: 'Music composition — melody, rhythm, instrumentation, iteration',
    winCondition: 'Full track with melody, bass, drums, and at least 2 iterations',
    starterHint: 'Start with a vibe: "A funky beat at 130 BPM with a punchy bass on every 1 and 3, synth melody in C major."',
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
    concept: 'Systems thinking + precision of language',
    winCondition: 'Playable space shooter with multiple enemy types and at least one power-up',
    starterHint: 'Think about what makes a great space game: different enemy types, interesting weapons, and a progression that gets harder.',
  },
  // Day 8 — Flappy Physics Lab
  {
    id: 'tier2-flappy-physics',
    tier: 2,
    difficulty: 'easy',
    seasonDay: 8,
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
  // Day 11 — Brick Blaster Studio
  {
    id: 'tier2-brick-blaster',
    tier: 2,
    difficulty: 'medium',
    seasonDay: 11,
    type: 'game-builder',
    gameTemplateId: 'brick-breaker',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'remix-and-extend',
    xp: 100,
    title: '🧱 Brick Blaster Studio',
    story: "The Brick Dimension is overrun with magical bricks! A lone paddle-hero must bounce an energy ball to shatter them all. You're the game designer — make it epic.",
    challenge: 'Build a Brick Breaker game. Customise the paddle, ball, brick emojis, number of rows, and difficulty. Use vibe coding to describe the theme.',
    concept: 'Game design — difficulty tuning, visual customisation, iteration',
    winCondition: 'Brick Breaker game built with at least 2 AI iterations',
    starterHint: 'Pick Brick Breaker as your template, then describe the colour scheme and brick theme.',
  },
  // Day 14 — Platformer Builder
  {
    id: 'tier2-platformer-builder',
    tier: 2,
    difficulty: 'medium',
    seasonDay: 14,
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'decomposition',
    xp: 100,
    title: '🏃 Platformer Builder',
    story: "Time to build a real platformer game from scratch! Describe your world, characters, and gameplay — then play it live.",
    challenge: 'Use vibe coding to design a complete platformer: describe the theme, enemies, power-ups, and level design in detail.',
    concept: 'Rapid prototyping + decomposition',
    winCondition: 'Fully playable platformer with custom theme, enemies, and collectibles',
    starterHint: 'Be specific! Instead of "make it cool", say "underwater theme with jellyfish enemies that float up and down, collect pearls, blue gradient background".',
  },
  // Day 17 — Ghost AI Maze
  {
    id: 'tier2-ghost-maze',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 17,
    type: 'game-builder',
    gameTemplateId: 'maze',
    primarySkill: 'systems-thinking',
    secondarySkill: 'precision-of-language',
    xp: 125,
    title: '👻 Ghost AI Maze',
    story: "Classic Pac-Man — but YOU control the rules! Change how the ghosts behave, redesign the scoring, add new power-ups. This maze is yours now.",
    challenge: 'Redesign the Maze game by changing the player character, ghost behaviour, or scoring rules. Describe every change precisely.',
    concept: 'AI behaviour and game state management',
    winCondition: 'Maze game with custom characters and at least one mechanic changed',
    starterHint: 'Try: "Make the player a cat 🐱 chasing mice 🐭, ghosts become dogs that bark when near, power-up freezes them for 3 seconds"',
  },
  // Day 20 — Flashcard Factory
  {
    id: 'tier2-flashcard-factory',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 20,
    type: 'app',
    primarySkill: 'systems-thinking',
    secondarySkill: 'specification-writing',
    xp: 125,
    title: '📚 Flashcard Factory',
    story: "Tests coming up? Build your own flashcard app! Pick any school subject, add questions and answers, and study with style.",
    challenge: 'Build a flashcard app: add cards with questions on the front and answers on the back. Include a flip animation, a shuffle button, and track how many you got right!',
    concept: 'App building — data structures, UI interaction',
    winCondition: 'Flashcard app works with flip animation, shuffle, and score tracking',
    starterHint: 'Try: "Build a flashcard app for maths times tables. Show the question big, tap to flip and see the answer. Green for correct, red for wrong. Shuffle button at the top."',
  },
  // Day 23 — Study Timer Pro
  {
    id: 'tier2-study-timer',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 23,
    type: 'app',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 125,
    title: '⏱️ Study Timer Pro',
    story: "The Pomodoro technique: study for 25 minutes, break for 5. Build a beautiful study timer that keeps you focused and tracks your sessions!",
    challenge: 'Build a Pomodoro study timer: 25-min work / 5-min break cycles. Add a progress ring, session counter, motivational messages, and sound alerts!',
    concept: 'Timer logic, UI animation, state management',
    winCondition: 'Timer works with work/break cycles, visual countdown, and session tracking',
    starterHint: 'Describe: "A circular countdown timer that fills up. Green during work time, blue during break. Shows session count. Plays a chime when time is up."',
  },
  // Day 26 — Quiz Master Pro
  {
    id: 'tier2-quiz-master',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 26,
    type: 'app',
    primarySkill: 'systems-thinking',
    secondarySkill: 'specification-writing',
    xp: 125,
    title: '🧠 Quiz Master Pro',
    story: "Design a quiz game for your class! It should ask questions, check answers, keep score, and have a winner screen.",
    challenge: 'Build the quiz engine with time limits, score tracking, and a results screen. Make it feel like a real game show!',
    concept: 'Arrays + loops + conditionals + UX',
    winCondition: 'Quiz runs through all questions, tracks score, shows results',
    starterHint: 'Store your questions in a list. Loop through them one by one. Add a timer for extra challenge!',
  },
  // Day 29 — My Best App
  {
    id: 'tier2-best-app',
    tier: 2,
    difficulty: 'hard',
    seasonDay: 29,
    type: 'app',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'specification-writing',
    xp: 175,
    title: '🏆 My Best App',
    story: "Season finale! Build the most impressive app you can imagine. A tool, a game, a dashboard — whatever shows off your vibe coding skills!",
    challenge: 'Build any web app using everything you have learned. Describe it clearly and iterate until it is polished.',
    concept: 'All skills — creativity + iteration',
    winCondition: 'A polished, working web app that demonstrates multiple skills',
    starterHint: 'Think about a problem YOU have — homework tracking? A habit tracker? A birthday countdown? Build something YOU would actually use!',
    appDescription: 'Your ultimate web app. What problem does it solve?',
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
    type: 'music',
    primarySkill: 'specification-writing',
    secondarySkill: 'precision-of-language',
    xp: 200,
    title: '🎵 Beat Drop: Spec Edition',
    story: "You're a music AI prompt engineer at SoundForge AI. Clients send you precise musical specifications and you turn them into reality using nothing but language. Today's brief: create a complete track spec and iterate until it's perfect.",
    challenge: 'Write a detailed musical specification (key, time signature, BPM, instruments, mood, structure) and use 3+ AI iterations to achieve your vision. Show your prompt engineering skills!',
    concept: 'Prompt engineering for creative AI — music specification, iteration, feedback loops',
    winCondition: 'Music piece created from a detailed spec with 3+ iterations showing clear improvement',
    starterHint: 'Write a spec first: "Key: A minor | BPM: 140 | 4/4 time | Instruments: drums (trap pattern), bass (root notes on 1, passing on 3), synth lead (minor pentatonic, call-and-response phrases), arp (16th notes, upper octave)."',
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
    concept: 'Systems thinking + rapid prototyping',
    winCondition: 'Space shooter with wave system, at least 1 boss fight, and weapon upgrades',
    starterHint: 'Start with the core loop: waves of enemies that get harder. Then add bosses, then power-ups. Layer by layer.',
  },
  // Day 8 — Flappy: Engine Rebuild
  {
    id: 'tier3-flappy-engine',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 8,
    type: 'game-builder',
    gameTemplateId: 'flappy',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 180,
    title: '🐦 Flappy: Engine Rebuild',
    story: "You're a senior game developer at VibeSoft. The Flappy Runner engine needs a full physics and difficulty overhaul. Gravity curves, pipe patterns, speed ramps — all configurable by prompt.",
    challenge: 'Use detailed prompt engineering to modify the Flappy Runner game: tune gravity curves, pipe gap algorithms, speed scaling, and add a high-score system. Aim for 3+ iterations.',
    concept: 'Prompt engineering for game physics — gravity, speed scaling, procedural generation',
    winCondition: 'Flappy game with custom physics, difficulty curve, and high-score display',
    starterHint: 'Start with a clear spec: "Modify gravity to 0.6, reduce gap size as score increases, add high-score storage in localStorage."',
  },
  // Day 11 — Breakout: Pro Edition
  {
    id: 'tier3-breakout-pro',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 11,
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
  // Day 14 — Platformer: Full Build
  {
    id: 'tier3-platformer-full',
    tier: 3,
    difficulty: 'medium',
    seasonDay: 14,
    type: 'game-builder',
    gameTemplateId: 'platformer',
    primarySkill: 'specification-writing',
    secondarySkill: 'rapid-prototyping',
    xp: 200,
    title: '🏃 Platformer: Full Build',
    story: "You're a game designer now. Build a complete platformer with multiple levels, increasing difficulty, boss mechanics, and polished visuals.",
    challenge: 'Design a professional-quality platformer: write detailed specs for level progression, enemy AI patterns, scoring systems, and visual polish. Iterate until it feels like a real game.',
    concept: 'Specification writing + all skills',
    winCondition: 'Polished platformer with difficulty progression, multiple enemy types, and a scoring system',
    starterHint: 'Think like a game designer: write a spec first. "Level 1: easy, 3 platforms, slow enemies. Level 2: moving platforms, faster enemies, new collectible type."',
  },
  // Day 17 — Homework Planner
  {
    id: 'tier3-homework-planner',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 17,
    type: 'app',
    primarySkill: 'specification-writing',
    secondarySkill: 'systems-thinking',
    xp: 250,
    title: '📋 Homework Planner',
    story: "Build a homework planner app that you will actually use! Track assignments, deadlines, subjects, and priorities. Make it so good your classmates want one too.",
    challenge: 'Build a homework planner with: add/edit/delete assignments, filter by subject, sort by due date, mark as complete, and a progress dashboard. Use localStorage to save data.',
    concept: 'Full-stack app building — CRUD operations, data persistence, UI design',
    winCondition: 'Homework planner with CRUD, filtering, sorting, and persistent storage',
    starterHint: 'Spec it out: "Each task has: title, subject (dropdown), due date, priority (high/medium/low), status. Dashboard shows overdue items in red. Filter by subject. Data persists in localStorage."',
    appDescription: 'A homework tracking app with subjects, deadlines, priorities, and a clean dashboard.',
  },
  // Day 20 — Data Story
  {
    id: 'tier3-data-story',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 20,
    type: 'app',
    primarySkill: 'decomposition',
    secondarySkill: 'systems-thinking',
    xp: 250,
    title: '📊 Data Story',
    story: "Raw numbers are boring. Build a tool that takes data and makes it visual and beautiful! Turn spreadsheets into stories.",
    challenge: 'Build a chart builder: take some data (e.g. your top 5 movies with ratings) and visualise it with bars, lines, or charts. Add a title and make it shareable.',
    concept: 'Data transformation + SVG/Canvas + storytelling with data',
    winCondition: 'Visualiser correctly renders data as an interactive chart with titles and labels',
    starterHint: 'Try: "Build a bar chart component that takes an array of {label, value} objects and renders colourful animated bars"',
  },
  // Day 23 — AI Personality Engine
  {
    id: 'tier3-ai-personality',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 23,
    type: 'app',
    primarySkill: 'ai-literacy',
    secondarySkill: 'systems-thinking',
    xp: 250,
    title: '💬 AI Personality Engine',
    story: "Build your own AI chatbot powered by Claude! Give it a personality, a purpose, and make it help people.",
    challenge: 'Build a chatbot with a custom personality and purpose. Use the Claude API to power it. Ship it.',
    concept: 'API integration + system prompts + UX',
    winCondition: 'Chatbot has custom personality, calls Claude API, and handles conversation history',
    starterHint: "The most important thing is the system prompt. Describe your bot's personality and role clearly.",
    appDescription: 'Your own AI-powered chatbot. What will it specialise in?',
  },
  // Day 26 — Landing Page Lab
  {
    id: 'tier3-landing-lab',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 26,
    type: 'app',
    primarySkill: 'precision-of-language',
    secondarySkill: 'rapid-prototyping',
    xp: 300,
    title: '🌐 Landing Page Lab',
    story: "You have a brilliant app idea. Now you need a landing page to show the world — and get people to sign up! This is the ultimate creative challenge.",
    challenge: 'Use AI to build a stunning landing page. Describe your app idea, its features, and who it is for. Iterate until it looks professional enough to launch.',
    concept: 'Prompt engineering + HTML/CSS + product thinking',
    winCondition: 'Landing page has headline, features section, social proof, and signup CTA',
    starterHint: 'Start with a clear prompt: "Build a landing page for an app called X that does Y for Z people. Make it look like a modern SaaS product."',
    appDescription: 'Describe your app idea and the AI will generate a complete, professional landing page.',
  },
  // Day 29 — My Best App
  {
    id: 'tier3-best-app',
    tier: 3,
    difficulty: 'hard',
    seasonDay: 29,
    type: 'app',
    primarySkill: 'rapid-prototyping',
    secondarySkill: 'specification-writing',
    xp: 350,
    title: '🏆 My Best App',
    story: "The grand finale. Build the most ambitious thing you can dream up. A tool, a game, a social experiment — whatever pushes your skills to the max.",
    challenge: 'Build any web app. Write a full spec first, then use precise prompt engineering to bring it to life. Iterate until it is polished and professional.',
    concept: 'All skills — specification + prompting + iteration',
    winCondition: 'A polished, professional web app demonstrating prompt engineering mastery',
    starterHint: 'Write a 5-point spec first, then build it section by section. Think: what would I be proud to show my friends?',
    appDescription: 'Your masterpiece. Spec it. Build it. Ship it.',
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
