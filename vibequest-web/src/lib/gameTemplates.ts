/**
 * gameTemplates.ts — Base HTML/Canvas game templates for the Game Builder.
 * Each template is a complete, self-contained HTML game that runs in a sandboxed iframe.
 * The AI modifies these templates based on kids' descriptions.
 */

export interface GameTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  baseHtml: string;
  customizableAreas: string[]; // what kids can change
}

// ─── PLATFORMER (Mario-style) ───────────────────────────────────────
const PLATFORMER_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #1a1a2e; overflow: hidden; font-family: sans-serif; }
canvas { display: block; }
#ui { position: absolute; top: 10px; left: 10px; color: white; font-size: 18px; z-index: 10; }
#gameover { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.8); color: white; font-size: 36px; justify-content: center; align-items: center; flex-direction: column; z-index: 20; }
#gameover button { margin-top: 20px; padding: 12px 32px; font-size: 20px; background: #e74c3c; color: white; border: none; border-radius: 12px; cursor: pointer; }
</style></head><body>
<div id="ui">Score: <span id="score">0</span> | Lives: <span id="lives">3</span></div>
<div id="gameover"><div>Game Over!</div><div style="font-size:20px;margin-top:10px">Score: <span id="final-score">0</span></div><button onclick="restart()">Play Again</button></div>
<canvas id="c"></canvas>
<script>
/* CUSTOMIZE: Game settings */
const SETTINGS = {
  playerEmoji: '🐱',
  collectEmoji: '⭐',
  enemyEmoji: '👾',
  bgColor1: '#1a1a2e',
  bgColor2: '#16213e',
  platformColor: '#2ecc71',
  gravity: 0.5,
  jumpForce: -10,
  playerSpeed: 5,
  title: 'Platformer'
};

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 500;

let score = 0, lives = 3, gameOver = false;
let player = { x: 100, y: 300, w: 36, h: 36, vy: 0, grounded: false };
let camera = { x: 0 };

/* CUSTOMIZE: Level layout */
const platforms = [
  { x: 0, y: 460, w: 300, h: 40 },
  { x: 350, y: 400, w: 150, h: 20 },
  { x: 550, y: 340, w: 200, h: 20 },
  { x: 800, y: 460, w: 300, h: 40 },
  { x: 900, y: 300, w: 120, h: 20 },
  { x: 1100, y: 380, w: 180, h: 20 },
  { x: 1350, y: 460, w: 400, h: 40 },
  { x: 1400, y: 280, w: 100, h: 20 },
  { x: 1600, y: 200, w: 120, h: 20 },
  { x: 1800, y: 460, w: 500, h: 40 },
];

/* CUSTOMIZE: Collectibles */
let collectibles = [
  { x: 400, y: 360, w: 24, h: 24, collected: false },
  { x: 600, y: 300, w: 24, h: 24, collected: false },
  { x: 950, y: 260, w: 24, h: 24, collected: false },
  { x: 1150, y: 340, w: 24, h: 24, collected: false },
  { x: 1450, y: 240, w: 24, h: 24, collected: false },
  { x: 1650, y: 160, w: 24, h: 24, collected: false },
];

/* CUSTOMIZE: Enemies */
let enemies = [
  { x: 500, y: 420, w: 32, h: 32, speed: 1.5, minX: 350, maxX: 600 },
  { x: 1000, y: 420, w: 32, h: 32, speed: 2, minX: 800, maxX: 1100 },
  { x: 1500, y: 420, w: 32, h: 32, speed: 1, minX: 1350, maxX: 1700 },
];

const keys = {};
document.addEventListener('keydown', e => { keys[e.key] = true; if (['ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault(); });
document.addEventListener('keyup', e => keys[e.key] = false);
// Touch/tap support
canvas.addEventListener('touchstart', () => { if (player.grounded) player.vy = SETTINGS.jumpForce; });
canvas.addEventListener('click', () => { if (player.grounded) player.vy = SETTINGS.jumpForce; });

function collides(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function drawEmoji(emoji, x, y, size) {
  ctx.font = size + 'px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
}

function drawBg() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, SETTINGS.bgColor1);
  grad.addColorStop(1, SETTINGS.bgColor2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 137) % 800 - camera.x * 0.1) % 800;
    const sy = (i * 83) % 350;
    ctx.fillRect(sx < 0 ? sx + 800 : sx, sy, 2, 2);
  }
}

function update() {
  if (gameOver) return;
  // Movement
  if (keys['ArrowLeft'] || keys['a']) player.x -= SETTINGS.playerSpeed;
  if (keys['ArrowRight'] || keys['d']) player.x += SETTINGS.playerSpeed;
  if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.grounded) {
    player.vy = SETTINGS.jumpForce;
    player.grounded = false;
  }
  // Gravity
  player.vy += SETTINGS.gravity;
  player.y += player.vy;
  player.grounded = false;
  // Platform collision
  for (const p of platforms) {
    if (player.vy >= 0 && player.x + player.w > p.x && player.x < p.x + p.w &&
        player.y + player.h >= p.y && player.y + player.h <= p.y + p.h + 10) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }
  // Fall death
  if (player.y > canvas.height + 50) {
    lives--;
    document.getElementById('lives').textContent = lives;
    if (lives <= 0) { endGame(); return; }
    player.x = 100; player.y = 300; player.vy = 0; camera.x = 0;
  }
  // Collectibles
  for (const c of collectibles) {
    if (!c.collected && collides(player, c)) {
      c.collected = true;
      score += 100;
      document.getElementById('score').textContent = score;
    }
  }
  // Enemies
  for (const e of enemies) {
    e.x += e.speed;
    if (e.x <= e.minX || e.x >= e.maxX) e.speed *= -1;
    if (collides(player, e)) {
      // Stomp from above
      if (player.vy > 0 && player.y + player.h - e.y < 15) {
        e.x = -999; score += 200;
        document.getElementById('score').textContent = score;
        player.vy = SETTINGS.jumpForce * 0.7;
      } else {
        lives--;
        document.getElementById('lives').textContent = lives;
        if (lives <= 0) { endGame(); return; }
        player.x = Math.max(100, player.x - 200); player.vy = -5;
      }
    }
  }
  // Camera
  camera.x = player.x - 200;
  if (camera.x < 0) camera.x = 0;
}

function draw() {
  drawBg();
  ctx.save();
  ctx.translate(-camera.x, 0);
  // Platforms
  ctx.fillStyle = SETTINGS.platformColor;
  for (const p of platforms) {
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 6);
    ctx.fill();
    // Grass top
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(p.x, p.y, p.w, 4);
    ctx.fillStyle = SETTINGS.platformColor;
  }
  // Collectibles
  for (const c of collectibles) {
    if (!c.collected) drawEmoji(SETTINGS.collectEmoji, c.x + c.w/2, c.y + c.h/2, 24);
  }
  // Enemies
  for (const e of enemies) {
    if (e.x > -100) drawEmoji(SETTINGS.enemyEmoji, e.x + e.w/2, e.y + e.h/2, 32);
  }
  // Player
  drawEmoji(SETTINGS.playerEmoji, player.x + player.w/2, player.y + player.h/2, 36);
  ctx.restore();
}

function endGame() {
  gameOver = true;
  document.getElementById('final-score').textContent = score;
  document.getElementById('gameover').style.display = 'flex';
}

function restart() {
  score = 0; lives = 3; gameOver = false;
  player = { x: 100, y: 300, w: 36, h: 36, vy: 0, grounded: false };
  camera = { x: 0 };
  collectibles.forEach(c => c.collected = false);
  enemies.forEach((e, i) => { e.x = [500, 1000, 1500][i] || 500; e.speed = Math.abs(e.speed); });
  document.getElementById('score').textContent = '0';
  document.getElementById('lives').textContent = '3';
  document.getElementById('gameover').style.display = 'none';
}

function loop() {
  update(); draw(); requestAnimationFrame(loop);
}
loop();
</script></body></html>`;

// ─── MAZE RUNNER (Pacman-style) ──────────────────────────────────────
const MAZE_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; }
canvas { border: 2px solid #333; border-radius: 8px; }
#ui { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: #FFD700; font-size: 20px; z-index: 10; text-align: center; }
#gameover { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); color: white; font-size: 36px; justify-content: center; align-items: center; flex-direction: column; z-index: 20; }
#gameover button { margin-top: 20px; padding: 12px 32px; font-size: 20px; background: #FFD700; color: #000; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; }
</style></head><body>
<div id="ui">Score: <span id="score">0</span> | Dots: <span id="dots">0</span></div>
<div id="gameover"><div id="go-text">You Win!</div><div style="font-size:20px;margin-top:10px">Score: <span id="final-score">0</span></div><button onclick="restart()">Play Again</button></div>
<canvas id="c"></canvas>
<script>
/* CUSTOMIZE: Game settings */
const SETTINGS = {
  playerEmoji: '😀',
  dotEmoji: '·',
  powerEmoji: '💊',
  ghostEmojis: ['👻', '🔴', '🟡', '🟢'],
  wallColor: '#2233aa',
  bgColor: '#000011',
  dotColor: '#FFD700',
  cellSize: 28,
  playerSpeed: 2.5,
  ghostSpeed: 1.8,
  title: 'Maze Runner'
};

/* CUSTOMIZE: Maze layout (1=wall, 0=path, 2=dot, 3=power) */
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const CS = SETTINGS.cellSize;
const ROWS = MAZE.length, COLS = MAZE[0].length;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = COLS * CS; canvas.height = ROWS * CS;

let score = 0, totalDots = 0, dotsEaten = 0;
let player = { x: 9, y: 15, dir: 'right', nextDir: 'right' };
let ghosts = [
  { x: 8, y: 9, dir: 'up', emoji: SETTINGS.ghostEmojis[0] },
  { x: 9, y: 9, dir: 'down', emoji: SETTINGS.ghostEmojis[1] },
  { x: 10, y: 9, dir: 'left', emoji: SETTINGS.ghostEmojis[2] },
];
let powered = 0, gameOver = false;

// Count dots
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (MAZE[r][c] === 2 || MAZE[r][c] === 3) totalDots++;
document.getElementById('dots').textContent = totalDots;

const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  if (e.key === 'ArrowUp' || e.key === 'w') player.nextDir = 'up';
  if (e.key === 'ArrowDown' || e.key === 's') player.nextDir = 'down';
  if (e.key === 'ArrowLeft' || e.key === 'a') player.nextDir = 'left';
  if (e.key === 'ArrowRight' || e.key === 'd') player.nextDir = 'right';
});

let moveTimer = 0;
function canMove(x, y, dir) {
  let nx = x, ny = y;
  if (dir === 'up') ny--; if (dir === 'down') ny++;
  if (dir === 'left') nx--; if (dir === 'right') nx++;
  // Wrap
  if (nx < 0) nx = COLS - 1; if (nx >= COLS) nx = 0;
  if (ny < 0) ny = ROWS - 1; if (ny >= ROWS) ny = 0;
  return MAZE[ny]?.[nx] !== 1;
}

function move(entity) {
  let nx = entity.x, ny = entity.y;
  const d = entity.dir || entity.nextDir;
  if (d === 'up') ny--; if (d === 'down') ny++;
  if (d === 'left') nx--; if (d === 'right') nx++;
  if (nx < 0) nx = COLS - 1; if (nx >= COLS) nx = 0;
  if (ny < 0) ny = ROWS - 1; if (ny >= ROWS) ny = 0;
  entity.x = nx; entity.y = ny;
}

function update() {
  if (gameOver) return;
  moveTimer++;
  if (moveTimer % 6 === 0) {
    // Player
    if (canMove(player.x, player.y, player.nextDir)) player.dir = player.nextDir;
    if (canMove(player.x, player.y, player.dir)) move(player);
    // Eat dots
    const cell = MAZE[player.y]?.[player.x];
    if (cell === 2) { MAZE[player.y][player.x] = 0; score += 10; dotsEaten++; }
    if (cell === 3) { MAZE[player.y][player.x] = 0; score += 50; dotsEaten++; powered = 300; }
    document.getElementById('score').textContent = score;
    document.getElementById('dots').textContent = totalDots - dotsEaten;
    if (dotsEaten >= totalDots) { endGame(true); return; }
    if (powered > 0) powered--;
  }
  if (moveTimer % 8 === 0) {
    // Ghosts
    for (const g of ghosts) {
      const dirs = ['up','down','left','right'].filter(d => canMove(g.x, g.y, d));
      // Don't reverse
      const opp = {up:'down',down:'up',left:'right',right:'left'};
      const filtered = dirs.filter(d => d !== opp[g.dir]);
      g.dir = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : (dirs[0] || g.dir);
      if (canMove(g.x, g.y, g.dir)) move(g);
      // Collision with player
      if (g.x === player.x && g.y === player.y) {
        if (powered > 0) { g.x = 9; g.y = 9; score += 200; }
        else { endGame(false); return; }
      }
    }
  }
}

function draw() {
  ctx.fillStyle = SETTINGS.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Maze
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = MAZE[r][c];
      if (cell === 1) {
        ctx.fillStyle = SETTINGS.wallColor;
        ctx.beginPath(); ctx.roundRect(c * CS + 1, r * CS + 1, CS - 2, CS - 2, 4); ctx.fill();
      } else if (cell === 2) {
        ctx.fillStyle = SETTINGS.dotColor;
        ctx.beginPath(); ctx.arc(c * CS + CS/2, r * CS + CS/2, 3, 0, Math.PI * 2); ctx.fill();
      } else if (cell === 3) {
        ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(SETTINGS.powerEmoji, c * CS + CS/2, r * CS + CS/2);
      }
    }
  }
  // Player
  ctx.font = (CS - 4) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(SETTINGS.playerEmoji, player.x * CS + CS/2, player.y * CS + CS/2);
  // Ghosts
  for (const g of ghosts) {
    ctx.globalAlpha = powered > 0 ? 0.5 : 1;
    ctx.fillText(powered > 0 ? '😨' : g.emoji, g.x * CS + CS/2, g.y * CS + CS/2);
    ctx.globalAlpha = 1;
  }
}

function endGame(won) {
  gameOver = true;
  document.getElementById('go-text').textContent = won ? 'You Win! 🎉' : 'Game Over! 💀';
  document.getElementById('final-score').textContent = score;
  document.getElementById('gameover').style.display = 'flex';
}

function restart() {
  location.reload();
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();
</script></body></html>`;

// ─── SPACE BLASTER (Space Invaders-style) ────────────────────────────
const SPACE_BLASTER_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0a0a1a; overflow: hidden; font-family: sans-serif; }
canvas { display: block; margin: 0 auto; }
#ui { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: #0ff; font-size: 18px; z-index: 10; text-align: center; }
#gameover { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); color: white; font-size: 36px; justify-content: center; align-items: center; flex-direction: column; z-index: 20; }
#gameover button { margin-top: 20px; padding: 12px 32px; font-size: 20px; background: #0ff; color: #000; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; }
</style></head><body>
<div id="ui">Score: <span id="score">0</span> | Wave: <span id="wave">1</span></div>
<div id="gameover"><div id="go-text">Game Over!</div><div style="font-size:20px;margin-top:10px">Score: <span id="final-score">0</span></div><button onclick="restart()">Play Again</button></div>
<canvas id="c" width="600" height="500"></canvas>
<script>
/* CUSTOMIZE: Game settings */
const SETTINGS = {
  shipEmoji: '🚀',
  bulletEmoji: '⚡',
  enemyEmojis: ['👾', '🛸', '💀'],
  explosionEmoji: '💥',
  bgColor: '#0a0a1a',
  bulletColor: '#0ff',
  shipSpeed: 6,
  bulletSpeed: 8,
  enemySpeed: 1,
  enemyCols: 8,
  enemyRows: 3,
  title: 'Space Blaster'
};

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let score = 0, wave = 1, gameOver = false;
let ship = { x: W / 2, y: H - 50, w: 36, h: 36 };
let bullets = [], enemyBullets = [], explosions = [];
let enemies = [], enemyDir = 1, enemyDropTimer = 0;

function spawnEnemies() {
  enemies = [];
  for (let r = 0; r < SETTINGS.enemyRows; r++) {
    for (let c = 0; c < SETTINGS.enemyCols; c++) {
      enemies.push({
        x: 60 + c * 60, y: 40 + r * 50, w: 32, h: 32,
        emoji: SETTINGS.enemyEmojis[r % SETTINGS.enemyEmojis.length],
        alive: true
      });
    }
  }
}
spawnEnemies();

const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  if (e.key === ' ' && !gameOver) {
    bullets.push({ x: ship.x, y: ship.y - 20, w: 6, h: 14 });
  }
});
document.addEventListener('keyup', e => keys[e.key] = false);
// Touch
canvas.addEventListener('click', (e) => {
  if (!gameOver) {
    const rect = canvas.getBoundingClientRect();
    ship.x = e.clientX - rect.left;
    bullets.push({ x: ship.x, y: ship.y - 20, w: 6, h: 14 });
  }
});

function collides(a, b) {
  return a.x - a.w/2 < b.x + b.w/2 && a.x + a.w/2 > b.x - b.w/2 &&
         a.y - a.h/2 < b.y + b.h/2 && a.y + a.h/2 > b.y - b.h/2;
}

let shootTimer = 0;
function update() {
  if (gameOver) return;
  // Ship movement
  if (keys['ArrowLeft'] || keys['a']) ship.x -= SETTINGS.shipSpeed;
  if (keys['ArrowRight'] || keys['d']) ship.x += SETTINGS.shipSpeed;
  ship.x = Math.max(20, Math.min(W - 20, ship.x));

  // Bullets
  bullets = bullets.filter(b => { b.y -= SETTINGS.bulletSpeed; return b.y > -20; });

  // Enemy movement
  let rightMost = 0, leftMost = W;
  for (const e of enemies) {
    if (!e.alive) continue;
    e.x += SETTINGS.enemySpeed * enemyDir;
    rightMost = Math.max(rightMost, e.x + e.w/2);
    leftMost = Math.min(leftMost, e.x - e.w/2);
  }
  if (rightMost >= W - 10 || leftMost <= 10) {
    enemyDir *= -1;
    for (const e of enemies) { if (e.alive) e.y += 20; }
  }

  // Enemy shooting
  shootTimer++;
  if (shootTimer % 60 === 0) {
    const alive = enemies.filter(e => e.alive);
    if (alive.length > 0) {
      const shooter = alive[Math.floor(Math.random() * alive.length)];
      enemyBullets.push({ x: shooter.x, y: shooter.y + 20, w: 6, h: 10 });
    }
  }
  enemyBullets = enemyBullets.filter(b => { b.y += 4; return b.y < H + 20; });

  // Bullet-enemy collision
  for (const b of bullets) {
    for (const e of enemies) {
      if (e.alive && collides(b, e)) {
        e.alive = false; b.y = -999;
        score += 100;
        document.getElementById('score').textContent = score;
        explosions.push({ x: e.x, y: e.y, timer: 20 });
      }
    }
  }

  // Enemy bullet-ship collision
  for (const b of enemyBullets) {
    if (Math.abs(b.x - ship.x) < 18 && Math.abs(b.y - ship.y) < 18) {
      endGame(); return;
    }
  }

  // Enemy reaches bottom
  for (const e of enemies) {
    if (e.alive && e.y + e.h/2 > ship.y - 10) { endGame(); return; }
  }

  // Explosions
  explosions = explosions.filter(e => { e.timer--; return e.timer > 0; });

  // Wave complete
  if (enemies.every(e => !e.alive)) {
    wave++;
    document.getElementById('wave').textContent = wave;
    SETTINGS.enemySpeed += 0.3;
    spawnEnemies();
  }
}

function draw() {
  // Background
  ctx.fillStyle = SETTINGS.bgColor;
  ctx.fillRect(0, 0, W, H);
  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 50; i++) {
    ctx.fillRect((i * 97 + shootTimer * 0.2) % W, (i * 71) % H, 1.5, 1.5);
  }
  // Ship
  ctx.font = '36px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(SETTINGS.shipEmoji, ship.x, ship.y);
  // Bullets
  ctx.fillStyle = SETTINGS.bulletColor;
  for (const b of bullets) {
    ctx.fillRect(b.x - 2, b.y, 4, 14);
    ctx.shadowBlur = 10; ctx.shadowColor = SETTINGS.bulletColor;
    ctx.fillRect(b.x - 1, b.y, 2, 14);
    ctx.shadowBlur = 0;
  }
  // Enemy bullets
  ctx.fillStyle = '#f44';
  for (const b of enemyBullets) ctx.fillRect(b.x - 2, b.y, 4, 10);
  // Enemies
  ctx.font = '28px sans-serif';
  for (const e of enemies) {
    if (e.alive) ctx.fillText(e.emoji, e.x, e.y);
  }
  // Explosions
  ctx.font = '32px sans-serif';
  for (const e of explosions) {
    ctx.globalAlpha = e.timer / 20;
    ctx.fillText(SETTINGS.explosionEmoji, e.x, e.y);
    ctx.globalAlpha = 1;
  }
}

function endGame() {
  gameOver = true;
  document.getElementById('go-text').textContent = 'Game Over!';
  document.getElementById('final-score').textContent = score;
  document.getElementById('gameover').style.display = 'flex';
}

function restart() { location.reload(); }
function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();
</script></body></html>`;

// ─── SNAKE ───────────────────────────────────────────────────────────
const SNAKE_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; }
canvas { border: 3px solid #333; border-radius: 8px; }
#ui { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); color: #4ade80; font-size: 20px; z-index: 10; }
#gameover { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); color: white; font-size: 36px; justify-content: center; align-items: center; flex-direction: column; z-index: 20; }
#gameover button { margin-top: 20px; padding: 12px 32px; font-size: 20px; background: #4ade80; color: #000; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; }
</style></head><body>
<div id="ui">Score: <span id="score">0</span> | Best: <span id="best">0</span></div>
<div id="gameover"><div>Game Over! 🐍</div><div style="font-size:20px;margin-top:10px">Score: <span id="final-score">0</span></div><button onclick="restart()">Play Again</button></div>
<canvas id="c"></canvas>
<script>
/* CUSTOMIZE: Game settings */
const SETTINGS = {
  headEmoji: '🐍',
  bodyColor: '#4ade80',
  bodyColorAlt: '#22c55e',
  foodEmoji: '🍎',
  bonusEmoji: '⭐',
  bgColor: '#0a0a1a',
  gridColor: '#111827',
  cellSize: 22,
  gridW: 24,
  gridH: 24,
  startSpeed: 120,
  speedIncrease: 2,
  title: 'Snake'
};

const CS = SETTINGS.cellSize;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = SETTINGS.gridW * CS; canvas.height = SETTINGS.gridH * CS;

let snake, dir, food, bonus, score, best = 0, speed, gameOver, interval;

function init() {
  snake = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
  dir = { x: 1, y: 0 };
  score = 0; gameOver = false;
  speed = SETTINGS.startSpeed;
  spawnFood();
  bonus = null;
  document.getElementById('score').textContent = '0';
  document.getElementById('gameover').style.display = 'none';
}

function spawnFood() {
  do { food = { x: Math.floor(Math.random() * SETTINGS.gridW), y: Math.floor(Math.random() * SETTINGS.gridH) }; }
  while (snake.some(s => s.x === food.x && s.y === food.y));
}

document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  if ((e.key === 'ArrowUp' || e.key === 'w') && dir.y === 0) dir = { x: 0, y: -1 };
  if ((e.key === 'ArrowDown' || e.key === 's') && dir.y === 0) dir = { x: 0, y: 1 };
  if ((e.key === 'ArrowLeft' || e.key === 'a') && dir.x === 0) dir = { x: -1, y: 0 };
  if ((e.key === 'ArrowRight' || e.key === 'd') && dir.x === 0) dir = { x: 1, y: 0 };
});

function update() {
  if (gameOver) return;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  // Wall collision
  if (head.x < 0 || head.x >= SETTINGS.gridW || head.y < 0 || head.y >= SETTINGS.gridH) { endGame(); return; }
  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) { endGame(); return; }
  snake.unshift(head);
  // Food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById('score').textContent = score;
    spawnFood();
    speed = Math.max(50, speed - SETTINGS.speedIncrease);
    clearInterval(interval);
    interval = setInterval(update, speed);
    // Spawn bonus occasionally
    if (score % 50 === 0 && !bonus) {
      do { bonus = { x: Math.floor(Math.random() * SETTINGS.gridW), y: Math.floor(Math.random() * SETTINGS.gridH), timer: 100 }; }
      while (snake.some(s => s.x === bonus.x && s.y === bonus.y));
    }
  } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
    score += 50;
    document.getElementById('score').textContent = score;
    bonus = null;
  } else {
    snake.pop();
  }
  if (bonus) { bonus.timer--; if (bonus.timer <= 0) bonus = null; }
  draw();
}

function draw() {
  ctx.fillStyle = SETTINGS.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Grid
  ctx.strokeStyle = SETTINGS.gridColor;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < SETTINGS.gridW; x++) { ctx.beginPath(); ctx.moveTo(x * CS, 0); ctx.lineTo(x * CS, canvas.height); ctx.stroke(); }
  for (let y = 0; y < SETTINGS.gridH; y++) { ctx.beginPath(); ctx.moveTo(0, y * CS); ctx.lineTo(canvas.width, y * CS); ctx.stroke(); }
  // Snake body
  for (let i = 1; i < snake.length; i++) {
    ctx.fillStyle = i % 2 === 0 ? SETTINGS.bodyColor : SETTINGS.bodyColorAlt;
    ctx.beginPath();
    ctx.roundRect(snake[i].x * CS + 1, snake[i].y * CS + 1, CS - 2, CS - 2, 4);
    ctx.fill();
  }
  // Snake head
  ctx.font = (CS - 2) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(SETTINGS.headEmoji, snake[0].x * CS + CS/2, snake[0].y * CS + CS/2);
  // Food
  ctx.font = (CS - 2) + 'px sans-serif';
  ctx.fillText(SETTINGS.foodEmoji, food.x * CS + CS/2, food.y * CS + CS/2);
  // Bonus
  if (bonus) {
    ctx.globalAlpha = bonus.timer > 20 ? 1 : (bonus.timer % 4 < 2 ? 1 : 0.3);
    ctx.fillText(SETTINGS.bonusEmoji, bonus.x * CS + CS/2, bonus.y * CS + CS/2);
    ctx.globalAlpha = 1;
  }
}

function endGame() {
  gameOver = true;
  clearInterval(interval);
  if (score > best) { best = score; document.getElementById('best').textContent = best; }
  document.getElementById('final-score').textContent = score;
  document.getElementById('gameover').style.display = 'flex';
}

function restart() { init(); clearInterval(interval); interval = setInterval(update, speed); }

init(); draw();
interval = setInterval(update, speed);
</script></body></html>`;

// ─── Template Registry ──────────────────────────────────────────────
export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: 'platformer',
    name: 'Platformer',
    emoji: '🏃',
    description: 'Side-scrolling jump & run game — like Mario!',
    baseHtml: PLATFORMER_HTML,
    customizableAreas: ['Player character', 'Enemies', 'Collectibles', 'Background theme', 'Platform layout', 'Power-ups', 'Scoring', 'Difficulty'],
  },
  {
    id: 'maze',
    name: 'Maze Runner',
    emoji: '👻',
    description: 'Navigate a maze, eat dots, avoid ghosts — like Pacman!',
    baseHtml: MAZE_HTML,
    customizableAreas: ['Player character', 'Ghosts', 'Maze theme', 'Dots & power-ups', 'Ghost behavior', 'Speed', 'Scoring'],
  },
  {
    id: 'space-blaster',
    name: 'Space Blaster',
    emoji: '🚀',
    description: 'Shoot aliens from your spaceship — like Space Invaders!',
    baseHtml: SPACE_BLASTER_HTML,
    customizableAreas: ['Ship design', 'Enemy types', 'Weapons', 'Background', 'Boss fights', 'Power-ups', 'Wave difficulty'],
  },
  {
    id: 'snake',
    name: 'Snake',
    emoji: '🐍',
    description: 'Grow your snake by eating food — classic Snake!',
    baseHtml: SNAKE_HTML,
    customizableAreas: ['Snake appearance', 'Food types', 'Bonus items', 'Speed progression', 'Obstacles', 'Grid theme', 'Scoring'],
  },
];

export function getGameTemplate(id: string): GameTemplate | undefined {
  return GAME_TEMPLATES.find(t => t.id === id);
}
