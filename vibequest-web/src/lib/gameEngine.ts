/**
 * gameEngine.ts — executes AI logic blocks on a game grid and returns animation frames.
 * Ported from vibequest/src/utils/gameEngine.js
 */

export interface LogicBlock {
  type: 'if' | 'else' | 'loop' | 'action' | 'condition';
  label: string;
  children?: LogicBlock[];
}

export interface GameLayout {
  grid: number[][];
  cols: number;
  rows: number;
  goal: [number, number];
  robotStart: { x: number; y: number };
  robotDir?: Direction;
}

export interface RobotState {
  col: number;
  row: number;
  dir: Direction;
}

export interface AnimationFrame {
  robot: RobotState;
  message: string;
  atGoal: boolean;
}

type Direction = 'right' | 'down' | 'left' | 'up';

const DIRS: Direction[] = ['right', 'down', 'left', 'up'];
const DELTA: Record<Direction, [number, number]> = {
  right: [1, 0], down: [0, 1], left: [-1, 0], up: [0, -1],
};

const turnRight = (dir: Direction): Direction => DIRS[(DIRS.indexOf(dir) + 1) % 4];
const turnLeft  = (dir: Direction): Direction => DIRS[(DIRS.indexOf(dir) + 3) % 4];

function cellAhead({ col, row, dir }: RobotState): [number, number] {
  const [dc, dr] = DELTA[dir];
  return [col + dc, row + dr];
}

function isWall([col, row]: [number, number], { grid, cols, rows }: GameLayout): boolean {
  if (col < 0 || col >= cols || row < 0 || row >= rows) return true;
  return grid[row]?.[col] === 1;
}

// Theme obstacle words kids naturally say: tree (forest), asteroid/meteor (space),
// rock/boulder (pirate), barrier/pillar (generic).
const OBSTACLE_WORDS = [
  'wall', 'obstacle', 'block', 'blocked',
  'tree', 'bush', 'hedge', 'trunk', 'stump', // forest theme
  'asteroid', 'meteor', 'planet', 'satellite', // space theme
  'rock', 'boulder', 'reef', 'barrel', 'cannon', // pirate theme
  'barrier', 'pillar', 'fence', 'border',
];

function evalCondition(label: string, robot: RobotState, layout: GameLayout): boolean {
  const s = label.toLowerCase();

  // "clear path / no obstacle" — check negatives first so "no tree" beats "tree"
  const isNegated =
    s.includes('not') ||
    s.includes('clear') ||
    s.includes('free') ||
    s.includes('open') ||
    s.includes('path') ||
    OBSTACLE_WORDS.some(w => s.includes(`no ${w}`));
  if (isNegated && !s.includes('goal') && !s.includes('exit')) {
    return !isWall(cellAhead(robot), layout);
  }

  // Obstacle presence — any thematic word that means "something blocking ahead"
  if (OBSTACLE_WORDS.some(w => s.includes(w))) {
    return isWall(cellAhead(robot), layout);
  }

  if (s.includes('goal') || s.includes('exit') || s.includes('door') || s.includes('escape') || s.includes('reach')) {
    const [gc, gr] = layout.goal;
    return robot.col === gc && robot.row === gr;
  }
  return false;
}

function getMoveCount(label: string): number {
  const s = label.toLowerCase();
  const words: Record<string, number> = { once: 1, one: 1, twice: 2, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
  for (const [word, n] of Object.entries(words)) {
    if (s.includes(word)) return n;
  }
  const m = s.match(/\b(\d+)\b/);
  return m ? Math.min(parseInt(m[1]), 10) : 1;
}

function interpretAction(label: string): string | null {
  const s = label.toLowerCase();
  if (s.includes('turn right') || (s.includes('right') && s.includes('turn'))) return 'turn_right';
  if (s.includes('turn left')  || (s.includes('left')  && s.includes('turn'))) return 'turn_left';
  if (s.includes('turn around') || s.includes('180') || s.includes('reverse'))  return 'turn_around';
  if (s.includes('go around') || s.includes('go round') || s.includes('round it') ||
      s.includes('bypass') || s.includes('navigate around') || s.includes('avoid')) return 'go_around';
  if (s.includes('move') || s.includes('forward') || s.includes('walk') ||
      s.includes('step') || s.includes('go') || s.includes('ahead')) return 'move';
  return null;
}

function applyAction(type: string, robot: RobotState, layout: GameLayout): RobotState {
  switch (type) {
    case 'move': {
      const ahead = cellAhead(robot);
      return isWall(ahead, layout) ? robot : { ...robot, col: ahead[0], row: ahead[1] };
    }
    case 'turn_right':  return { ...robot, dir: turnRight(robot.dir) };
    case 'turn_left':   return { ...robot, dir: turnLeft(robot.dir) };
    case 'turn_around': return { ...robot, dir: turnLeft(turnLeft(robot.dir)) };
    default: return robot;
  }
}

function getLoopCount(label: string): number {
  const s = label.toLowerCase();
  const m = s.match(/\b(\d+)\b/);
  if (m) return Math.min(parseInt(m[1]), 10);
  if (s.includes('always') || s.includes('keep') || s.includes('forever') ||
      s.includes('until') || s.includes('repeat') || s.includes('loop') ||
      s.includes('continuous') || s.includes('infinite')) return 50;
  return 10;
}

/**
 * Execute AI logic blocks against a game layout.
 * Returns one animation frame per action.
 */
export function executeBlocks(logicBlocks: LogicBlock[], layout: GameLayout): AnimationFrame[] {
  const { robotStart, robotDir = 'right', goal } = layout;
  let robot: RobotState = { col: robotStart.x, row: robotStart.y, dir: robotDir };
  const steps: AnimationFrame[] = [{ robot: { ...robot }, message: 'Ready! 🤖', atGoal: false }];
  const MAX = 60;

  function atGoal(r: RobotState): boolean {
    return r.col === goal[0] && r.row === goal[1];
  }

  function push(msg: string) {
    steps.push({ robot: { ...robot }, message: msg, atGoal: atGoal(robot) });
  }

  function runBlocks(blocks: LogicBlock[]) {
    let i = 0;
    while (i < blocks.length && steps.length < MAX) {
      const block = blocks[i];

      if (block.type === 'action') {
        const act = interpretAction(block.label);

        if (act === 'go_around') {
          // turn right and move along the wall until a gap is found (max 3 steps)
          robot = applyAction('turn_right', robot, layout); push('turn right');
          for (let k = 0; k < 3 && steps.length < MAX; k++) {
            robot = applyAction('move', robot, layout); push('step forward');
            if (atGoal(robot)) return;
            if (!isWall(cellAhead(robot), layout)) break;
          }
          // turn left (back to original direction), step forward past the wall
          robot = applyAction('turn_left', robot, layout);  push('turn left');
          robot = applyAction('move', robot, layout);        push('step forward');
          if (atGoal(robot)) return;
          // turn left and move back to original lane
          robot = applyAction('turn_left', robot, layout);  push('turn left');
          robot = applyAction('move', robot, layout);        push('step forward');
          if (atGoal(robot)) return;
          // re-align (turn right to resume original direction)
          robot = applyAction('turn_right', robot, layout); push('turn right');

        } else if (act === 'move') {
          const count = getMoveCount(block.label);
          for (let k = 0; k < count && steps.length < MAX; k++) {
            robot = applyAction('move', robot, layout);
            push(block.label);
            if (atGoal(robot)) return;
          }

        } else if (act) {
          robot = applyAction(act, robot, layout);
          push(block.label);
          if (atGoal(robot)) return;
        }

      } else if (block.type === 'if' || block.type === 'condition') {
        const condTrue = evalCondition(block.label, robot, layout);
        const children = block.children || [];

        const elseAsChild = [...children].reverse().find(c => c.type === 'else');
        const ifBody   = elseAsChild ? children.filter(c => c.type !== 'else') : children;
        const elseBody = elseAsChild ? (elseAsChild.children || []) : null;

        if (condTrue) {
          runBlocks(ifBody);
        } else if (elseBody) {
          runBlocks(elseBody);
        }

        if (i + 1 < blocks.length && blocks[i + 1].type === 'else') {
          if (!condTrue && !elseBody) runBlocks(blocks[i + 1].children || []);
          i++;
        }

      } else if (block.type === 'loop') {
        const n = getLoopCount(block.label);
        for (let j = 0; j < n && steps.length < MAX && !atGoal(robot); j++) {
          runBlocks(block.children || []);
        }
      }

      i++;
    }
  }

  runBlocks(logicBlocks);
  return steps;
}
