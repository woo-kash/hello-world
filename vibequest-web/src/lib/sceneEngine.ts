/**
 * sceneEngine.ts — Interprets AI logic blocks into scene animation frames.
 * Similar to gameEngine.ts but for non-grid, story-based logic missions.
 * Each scene has actors performing actions based on the logic blocks.
 */

export interface SceneFrame {
  actors: ActorState[];
  message: string;
  effects: Effect[];
}

export interface ActorState {
  id: string;
  x: number; // percentage 0-100
  y: number;
  visible: boolean;
  animation: string; // CSS animation class name
  emoji: string;
  scale: number;
}

export interface Effect {
  type: 'poof' | 'sparkle' | 'rain' | 'sun' | 'combine';
  x: number;
  y: number;
  delay: number;
}

interface LogicBlock {
  type: string;
  label: string;
  children?: LogicBlock[];
}

// ─── Bunny Garden Scene ─────────────────────────────────────────────
function runBunnyScene(blocks: LogicBlock[]): SceneFrame[] {
  const patches = [
    { type: 'carrot', x: 10 }, { type: 'mud', x: 25 },
    { type: 'carrot', x: 40 }, { type: 'carrot', x: 55 },
    { type: 'mud', x: 70 }, { type: 'carrot', x: 85 },
  ];

  const frames: SceneFrame[] = [];
  let bunnyX = 2;
  let carrots = 0;

  // Initial frame
  frames.push({
    actors: [
      { id: 'bunny', x: bunnyX, y: 65, visible: true, animation: 'animate-idle-bob', emoji: '🐰', scale: 1.3 },
      ...patches.map((p, i) => ({
        id: `patch-${i}`,
        x: p.x,
        y: 75,
        visible: true,
        animation: '',
        emoji: p.type === 'carrot' ? '🥕' : '💩',
        scale: 1,
      })),
    ],
    message: 'Bunny is ready to explore the garden! 🌿',
    effects: [],
  });

  // Process each patch
  for (let i = 0; i < patches.length; i++) {
    const patch = patches[i];
    bunnyX = patch.x;

    // Hop to patch
    frames.push({
      actors: [
        { id: 'bunny', x: bunnyX, y: 60, visible: true, animation: 'animate-hop', emoji: '🐰', scale: 1.3 },
        ...patches.map((p, j) => ({
          id: `patch-${j}`,
          x: p.x,
          y: 75,
          visible: true,
          animation: '',
          emoji: j < i ? (p.type === 'carrot' ? '✅' : '💩') : p.type === 'carrot' ? '🥕' : '💩',
          scale: 1,
        })),
      ],
      message: `Bunny hops to patch ${i + 1}... 🐾`,
      effects: [],
    });

    if (patch.type === 'carrot') {
      carrots++;
      frames.push({
        actors: [
          { id: 'bunny', x: bunnyX, y: 60, visible: true, animation: 'animate-wiggle-dance', emoji: '🐰', scale: 1.4 },
          ...patches.map((p, j) => ({
            id: `patch-${j}`,
            x: p.x,
            y: 75,
            visible: true,
            animation: j === i ? 'animate-poof' : '',
            emoji: j <= i ? (p.type === 'carrot' ? '✅' : '💩') : p.type === 'carrot' ? '🥕' : '💩',
            scale: 1,
          })),
        ],
        message: `Yummy! Bunny eats the carrot! 🥕 (${carrots} carrots eaten)`,
        effects: [{ type: 'poof', x: bunnyX, y: 70, delay: 0 }],
      });
    } else {
      frames.push({
        actors: [
          { id: 'bunny', x: bunnyX, y: 55, visible: true, animation: '', emoji: '🐰', scale: 1.3 },
          ...patches.map((p, j) => ({
            id: `patch-${j}`,
            x: p.x,
            y: 75,
            visible: true,
            animation: '',
            emoji: j <= i ? (p.type === 'carrot' ? '✅' : '💩') : p.type === 'carrot' ? '🥕' : '💩',
            scale: 1,
          })),
        ],
        message: `Eww, mud! Bunny skips it! 🙅`,
        effects: [],
      });
    }
  }

  // Victory frame
  frames.push({
    actors: [
      { id: 'bunny', x: 50, y: 50, visible: true, animation: 'animate-wiggle-dance', emoji: '🐰', scale: 1.6 },
    ],
    message: `All done! Bunny ate ${carrots} carrots! 🎉`,
    effects: [
      { type: 'sparkle', x: 30, y: 40, delay: 0 },
      { type: 'sparkle', x: 70, y: 40, delay: 0.2 },
      { type: 'sparkle', x: 50, y: 30, delay: 0.4 },
    ],
  });

  return frames;
}

// ─── Rain Dance Robot Scene ─────────────────────────────────────────
function runRainRobotScene(blocks: LogicBlock[]): SceneFrame[] {
  const weathers = ['cloudy', 'sunny', 'cloudy', 'cloudy', 'sunny', 'cloudy'];
  const frames: SceneFrame[] = [];

  frames.push({
    actors: [
      { id: 'robot', x: 45, y: 60, visible: true, animation: 'animate-idle-bob', emoji: '🤖', scale: 1.5 },
    ],
    message: 'Rain Dance Robot is ready! Let\'s check the weather! ☁️',
    effects: [],
  });

  for (let i = 0; i < weathers.length; i++) {
    const weather = weathers[i];
    const isCloudy = weather === 'cloudy';

    frames.push({
      actors: [
        { id: 'robot', x: 45, y: 60, visible: true, animation: '', emoji: '🤖', scale: 1.5 },
        { id: 'weather', x: 45, y: 15, visible: true, animation: 'animate-scale-in', emoji: isCloudy ? '☁️' : '☀️', scale: 2 },
      ],
      message: `Checking weather... It's ${weather}! ${isCloudy ? '☁️' : '☀️'}`,
      effects: isCloudy ? [{ type: 'rain', x: 30, y: 25, delay: 0 }] : [{ type: 'sun', x: 45, y: 15, delay: 0 }],
    });

    if (isCloudy) {
      frames.push({
        actors: [
          { id: 'robot', x: 45, y: 55, visible: true, animation: 'animate-wiggle-dance', emoji: '🤖', scale: 1.6 },
          { id: 'weather', x: 45, y: 15, visible: true, animation: '', emoji: '☁️', scale: 2 },
        ],
        message: 'Clouds detected! Robot is dancing for rain! 💃🤖',
        effects: [{ type: 'rain', x: 30, y: 30, delay: 0 }, { type: 'rain', x: 60, y: 30, delay: 0.2 }],
      });
    } else {
      frames.push({
        actors: [
          { id: 'robot', x: 45, y: 60, visible: true, animation: '', emoji: '🤖', scale: 1.5 },
          { id: 'weather', x: 45, y: 15, visible: true, animation: '', emoji: '☀️', scale: 2 },
        ],
        message: 'Sun is out! Robot stops dancing. 🛑',
        effects: [{ type: 'sun', x: 45, y: 15, delay: 0 }],
      });
    }
  }

  frames.push({
    actors: [
      { id: 'robot', x: 45, y: 55, visible: true, animation: 'animate-wiggle-dance', emoji: '🤖', scale: 1.6 },
    ],
    message: 'Great job! Robot knows when to dance! 🎉',
    effects: [
      { type: 'sparkle', x: 25, y: 40, delay: 0 },
      { type: 'sparkle', x: 65, y: 40, delay: 0.2 },
    ],
  });

  return frames;
}

// ─── Cookie Baker Scene ─────────────────────────────────────────────
function runCookieBakerScene(blocks: LogicBlock[]): SceneFrame[] {
  const orders = ['chocolate chip', 'sugar', 'peanut butter'];
  const ingredients: Record<string, string[]> = {
    'chocolate chip': ['🧈', '🍫', '🥚'],
    'sugar': ['🧈', '🍬', '🥚'],
    'peanut butter': ['🥜', '🧈', '🥚'],
  };
  const frames: SceneFrame[] = [];

  frames.push({
    actors: [
      { id: 'chef', x: 45, y: 50, visible: true, animation: 'animate-idle-bob', emoji: '👨‍🍳', scale: 1.5 },
      { id: 'oven', x: 80, y: 65, visible: true, animation: '', emoji: '🏠', scale: 1.2 },
    ],
    message: 'Chef Cookiebot is ready to bake! 🍪',
    effects: [],
  });

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const ingr = ingredients[order];

    // Order comes in
    frames.push({
      actors: [
        { id: 'chef', x: 45, y: 50, visible: true, animation: '', emoji: '👨‍🍳', scale: 1.5 },
        { id: 'order', x: 45, y: 20, visible: true, animation: 'animate-fly-in-left', emoji: '📋', scale: 1.2 },
      ],
      message: `New order: ${order} cookies! 📋`,
      effects: [],
    });

    // Ingredients fly in
    frames.push({
      actors: [
        { id: 'chef', x: 45, y: 50, visible: true, animation: '', emoji: '👨‍🍳', scale: 1.5 },
        ...ingr.map((ing, j) => ({
          id: `ing-${j}`,
          x: 20 + j * 20,
          y: 40,
          visible: true,
          animation: j % 2 === 0 ? 'animate-fly-in-left' : 'animate-fly-in-right',
          emoji: ing,
          scale: 1.3,
        })),
      ],
      message: `Adding ingredients: ${ingr.join(' + ')}`,
      effects: [],
    });

    // Mix and bake
    frames.push({
      actors: [
        { id: 'chef', x: 45, y: 50, visible: true, animation: 'animate-wiggle-dance', emoji: '👨‍🍳', scale: 1.5 },
        { id: 'bowl', x: 45, y: 40, visible: true, animation: 'animate-wiggle-dance', emoji: '🥣', scale: 1.4 },
      ],
      message: 'Mixing the ingredients! 🥣',
      effects: [{ type: 'combine', x: 45, y: 40, delay: 0 }],
    });

    // Cookie comes out
    frames.push({
      actors: [
        { id: 'chef', x: 45, y: 50, visible: true, animation: '', emoji: '👨‍🍳', scale: 1.5 },
        { id: `cookie-${i}`, x: 45, y: 35, visible: true, animation: 'animate-scale-in', emoji: '🍪', scale: 1.8 },
      ],
      message: `${order} cookie is ready! 🍪 (${i + 1}/${orders.length})`,
      effects: [{ type: 'sparkle', x: 45, y: 30, delay: 0 }],
    });
  }

  // Victory
  frames.push({
    actors: [
      { id: 'chef', x: 45, y: 45, visible: true, animation: 'animate-wiggle-dance', emoji: '👨‍🍳', scale: 1.6 },
      { id: 'c1', x: 20, y: 60, visible: true, animation: '', emoji: '🍪', scale: 1.3 },
      { id: 'c2', x: 45, y: 60, visible: true, animation: '', emoji: '🍪', scale: 1.3 },
      { id: 'c3', x: 70, y: 60, visible: true, animation: '', emoji: '🍪', scale: 1.3 },
    ],
    message: 'All 3 cookie types baked perfectly! 🎉🍪',
    effects: [
      { type: 'sparkle', x: 20, y: 50, delay: 0 },
      { type: 'sparkle', x: 50, y: 30, delay: 0.2 },
      { type: 'sparkle', x: 80, y: 50, delay: 0.4 },
    ],
  });

  return frames;
}

/**
 * Execute logic blocks as scene animation frames.
 * The sceneId determines which scenario to run.
 */
export function executeScene(sceneId: string, _blocks: LogicBlock[]): SceneFrame[] {
  switch (sceneId) {
    case 'bunny':
      return runBunnyScene(_blocks);
    case 'rain-robot':
      return runRainRobotScene(_blocks);
    case 'cookie-baker':
      return runCookieBakerScene(_blocks);
    default:
      return [{
        actors: [],
        message: 'Scene not found',
        effects: [],
      }];
  }
}
