/**
 * gameEngine.js — executes AI logic blocks on a game grid and returns animation frames.
 */

const DIRS = ['right', 'down', 'left', 'up'];
const DELTA = { right: [1, 0], down: [0, 1], left: [-1, 0], up: [0, -1] };

const turnRight = (dir) => DIRS[(DIRS.indexOf(dir) + 1) % 4];
const turnLeft  = (dir) => DIRS[(DIRS.indexOf(dir) + 3) % 4];

function cellAhead({ col, row, dir }) {
  const [dc, dr] = DELTA[dir];
  return [col + dc, row + dr];
}

function isWall([col, row], { grid, cols, rows }) {
  if (col < 0 || col >= cols || row < 0 || row >= rows) return true;
  return grid[row]?.[col] === 1;
}

function evalCondition(label, robot, layout) {
  const s = label.toLowerCase();
  // "no wall" / "no obstacle" → false-of-wall
  if ((s.includes('no wall') || s.includes('not') || s.includes('clear') || s.includes('free') || s.includes('open')) && !s.includes('goal')) {
    return !isWall(cellAhead(robot), layout);
  }
  if (s.includes('wall') || s.includes('obstacle') || s.includes('block')) {
    return isWall(cellAhead(robot), layout);
  }
  if (s.includes('goal') || s.includes('exit') || s.includes('door') || s.includes('escape') || s.includes('reach')) {
    const [gc, gr] = layout.goal;
    return robot.col === gc && robot.row === gr;
  }
  return true;
}

// Parse "two steps", "3 times", "twice", "one step" → count
function getMoveCount(label) {
  const s = label.toLowerCase();
  const words = { once: 1, one: 1, twice: 2, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
  for (const [word, n] of Object.entries(words)) {
    if (s.includes(word)) return n;
  }
  const m = s.match(/\b(\d+)\b/);
  return m ? Math.min(parseInt(m[1]), 10) : 1;
}

function interpretAction(label) {
  const s = label.toLowerCase();
  if (s.includes('turn right') || (s.includes('right') && s.includes('turn'))) return 'turn_right';
  if (s.includes('turn left')  || (s.includes('left')  && s.includes('turn'))) return 'turn_left';
  if (s.includes('turn around') || s.includes('180') || s.includes('reverse'))  return 'turn_around';
  // "go around / go round / bypass" → handled specially in runBlocks
  if (s.includes('go around') || s.includes('go round') || s.includes('round it') ||
      s.includes('bypass') || s.includes('navigate around') || s.includes('avoid')) return 'go_around';
  if (s.includes('move') || s.includes('forward') || s.includes('walk') ||
      s.includes('step') || s.includes('go') || s.includes('ahead')) return 'move';
  return null;
}

function applyAction(type, robot, layout) {
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

function getLoopCount(label) {
  const m = label.match(/(\d+)/);
  return m ? Math.min(parseInt(m[1]), 10) : 4;
}

/**
 * Execute AI logic blocks against a game layout.
 * @param {Array}  logicBlocks - from AI translation result
 * @param {Object} layout      - { grid, cols, rows, goal, robotStart, robotDir }
 * @returns {Array<{robot, message, atGoal}>} - one frame per action
 */
export function executeBlocks(logicBlocks, layout) {
  const { robotStart, robotDir = 'right', goal } = layout;
  let robot = { col: robotStart.x, row: robotStart.y, dir: robotDir };
  const steps = [{ robot: { ...robot }, message: 'Ready! 🤖', atGoal: false }];
  const MAX = 60;

  function atGoal(r) {
    return r.col === goal[0] && r.row === goal[1];
  }

  function push(msg) {
    steps.push({ robot: { ...robot }, message: msg, atGoal: atGoal(robot) });
  }

  function runBlocks(blocks) {
    let i = 0;
    while (i < blocks.length && steps.length < MAX) {
      const block = blocks[i];

      if (block.type === 'action') {
        const act = interpretAction(block.label);

        if (act === 'go_around') {
          // Expand "go around" → turn right, step, turn left, step
          robot = applyAction('turn_right', robot, layout); push('turn right');
          robot = applyAction('move', robot, layout);       push('step forward');
          if (atGoal(robot)) return;
          robot = applyAction('turn_left', robot, layout);  push('turn left');
          robot = applyAction('move', robot, layout);       push('step forward');
          if (atGoal(robot)) return;

        } else if (act === 'move') {
          // Respect "two steps", "3 times", etc.
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

        // Check whether the AI buried an else block as the last child
        const elseAsChild = children.findLast?.(c => c.type === 'else')
          ?? children.slice().reverse().find(c => c.type === 'else');
        const ifBody   = elseAsChild ? children.filter(c => c.type !== 'else') : children;
        const elseBody = elseAsChild ? (elseAsChild.children || []) : null;

        if (condTrue) {
          runBlocks(ifBody);
        } else if (elseBody) {
          runBlocks(elseBody);
        }

        // Also handle else as the NEXT sibling block
        if (i + 1 < blocks.length && blocks[i + 1].type === 'else') {
          if (!condTrue && !elseBody) runBlocks(blocks[i + 1].children || []);
          i++; // always skip the sibling else so it isn't processed again
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
