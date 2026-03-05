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
body { background: #0a0a1a; overflow: hidden; font-family: 'Segoe UI', system-ui, sans-serif; }
canvas { display: block; }
#hud { position: absolute; top: 0; left: 0; right: 0; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; pointer-events: none; }
.hud-item { background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 6px 14px; color: white; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.hud-score { background: linear-gradient(135deg, rgba(46,204,113,0.3), rgba(52,152,219,0.3)); border-color: rgba(46,204,113,0.4); }
.hud-lives span { color: #e74c3c; }
#overlay { display: flex; position: absolute; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); color: white; justify-content: center; align-items: center; flex-direction: column; z-index: 20; text-align: center; }
#overlay h1 { font-size: 48px; margin-bottom: 8px; }
#overlay .subtitle { font-size: 18px; color: #aaa; margin-bottom: 30px; }
#overlay button { padding: 14px 40px; font-size: 18px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; border-radius: 16px; cursor: pointer; font-weight: 700; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 20px rgba(46,204,113,0.4); }
#overlay button:hover { transform: scale(1.05); box-shadow: 0 6px 30px rgba(46,204,113,0.6); }
#overlay .final-score { font-size: 24px; margin: 10px 0 20px; color: #2ecc71; }
#overlay .high-score { font-size: 14px; color: #888; margin-bottom: 20px; }
.start-hint { font-size: 14px; color: #666; margin-top: 16px; animation: blink 1.5s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:0.4} 50%{opacity:1} }
</style></head><body>
<div id="hud">
  <div class="hud-item hud-score">⭐ <span id="score">0</span></div>
  <div class="hud-item hud-lives" id="lives-display">❤️ ❤️ ❤️</div>
</div>
<div id="overlay">
  <h1 id="overlay-title">🐱 Platformer</h1>
  <div class="subtitle" id="overlay-sub">Collect stars, stomp enemies, survive!</div>
  <button id="overlay-btn" onclick="startGame()">▶ Play</button>
  <div class="start-hint">Arrow keys / WASD to move · Space to jump</div>
</div>
<canvas id="c"></canvas>
<script>
/* CUSTOMIZE: Game settings */
const SETTINGS = {
  playerEmoji: '🐱',
  collectEmoji: '⭐',
  enemyEmoji: '👾',
  bgColor1: '#0a0a2e',
  bgColor2: '#1a1a3e',
  platformColor: '#2ecc71',
  gravity: 0.5,
  jumpForce: -10,
  playerSpeed: 5,
  title: 'Platformer'
};

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth; canvas.height = innerHeight;
addEventListener('resize', () => { canvas.width = innerWidth; canvas.height = innerHeight; });

/* ─── Audio engine ─── */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function ensureAudio() { if (!audioCtx) audioCtx = new AudioCtx(); }
function playTone(freq, dur, type, vol) {
  ensureAudio();
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type || 'square'; o.frequency.value = freq;
  g.gain.value = vol || 0.08;
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + dur);
}
function sfxJump() { playTone(400, 0.12, 'square', 0.06); setTimeout(() => playTone(600, 0.08, 'square', 0.04), 60); }
function sfxCollect() { playTone(800, 0.08, 'sine', 0.07); setTimeout(() => playTone(1200, 0.12, 'sine', 0.06), 50); }
function sfxStomp() { playTone(200, 0.15, 'sawtooth', 0.08); }
function sfxHurt() { playTone(150, 0.2, 'sawtooth', 0.1); setTimeout(() => playTone(100, 0.3, 'sawtooth', 0.08), 100); }

/* ─── Particles ─── */
let particles = [];
function spawnParticles(x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = (Math.random() * 0.7 + 0.3) * (speed || 3);
    particles.push({ x, y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - 1, life: 1, color, size: Math.random()*4+2 });
  }
}
/* ─── Score popups ─── */
let popups = [];
function addPopup(x, y, text, color) { popups.push({ x, y, text, color: color || '#fff', life: 1 }); }

/* ─── Screen shake ─── */
let shake = { x: 0, y: 0, intensity: 0 };
function triggerShake(intensity) { shake.intensity = intensity; }

let score = 0, lives = 3, gameOver = false, gameStarted = false, invincible = 0;
let highScore = parseInt(localStorage.getItem('plat_hi') || '0');
let player = { x: 100, y: 300, w: 36, h: 36, vy: 0, grounded: false, facing: 1 };
let camera = { x: 0 };

const platforms = [
  { x: 0, y: 460, w: 300, h: 40 }, { x: 350, y: 400, w: 150, h: 20 },
  { x: 550, y: 340, w: 200, h: 20 }, { x: 800, y: 460, w: 300, h: 40 },
  { x: 900, y: 300, w: 120, h: 20 }, { x: 1100, y: 380, w: 180, h: 20 },
  { x: 1350, y: 460, w: 400, h: 40 }, { x: 1400, y: 280, w: 100, h: 20 },
  { x: 1600, y: 200, w: 120, h: 20 }, { x: 1800, y: 460, w: 500, h: 40 },
];
let collectibles = [
  { x: 400, y: 360, w: 24, h: 24, collected: false }, { x: 600, y: 300, w: 24, h: 24, collected: false },
  { x: 950, y: 260, w: 24, h: 24, collected: false }, { x: 1150, y: 340, w: 24, h: 24, collected: false },
  { x: 1450, y: 240, w: 24, h: 24, collected: false }, { x: 1650, y: 160, w: 24, h: 24, collected: false },
];
let enemies = [
  { x: 500, y: 420, w: 32, h: 32, speed: 1.5, minX: 350, maxX: 600 },
  { x: 1000, y: 420, w: 32, h: 32, speed: 2, minX: 800, maxX: 1100 },
  { x: 1500, y: 420, w: 32, h: 32, speed: 1, minX: 1350, maxX: 1700 },
];

const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
  if (!gameStarted && (e.key === ' ' || e.key === 'Enter')) startGame();
});
document.addEventListener('keyup', e => keys[e.key] = false);
canvas.addEventListener('touchstart', e => { e.preventDefault(); if (!gameStarted) { startGame(); return; } if (player.grounded) { player.vy = SETTINGS.jumpForce; sfxJump(); } });

function startGame() { ensureAudio(); gameStarted = true; document.getElementById('overlay').style.display = 'none'; }

function collides(a, b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
function drawEmoji(emoji, x, y, size) { ctx.font = size+'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, x, y); }

/* ─── Stars background cache ─── */
const stars = Array.from({length: 80}, () => ({ x: Math.random()*2400, y: Math.random()*500, s: Math.random()*2.5+0.5, twinkle: Math.random()*Math.PI*2 }));

function drawBg(t) {
  const grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0, SETTINGS.bgColor1); grad.addColorStop(1, SETTINGS.bgColor2);
  ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width,canvas.height);
  // Twinkling stars
  for (const s of stars) {
    const sx = ((s.x - camera.x*0.15) % canvas.width + canvas.width) % canvas.width;
    const alpha = 0.3 + 0.4 * Math.sin(t * 0.002 + s.twinkle);
    ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.beginPath(); ctx.arc(sx, s.y, s.s, 0, Math.PI*2); ctx.fill();
  }
}

function updateLivesDisplay() {
  document.getElementById('lives-display').innerHTML = Array(Math.max(0, lives)).fill('❤️').join(' ') || '💀';
}

function update() {
  if (gameOver || !gameStarted) return;
  if (invincible > 0) invincible--;
  // Movement
  if (keys['ArrowLeft'] || keys['a']) { player.x -= SETTINGS.playerSpeed; player.facing = -1; }
  if (keys['ArrowRight'] || keys['d']) { player.x += SETTINGS.playerSpeed; player.facing = 1; }
  if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.grounded) {
    player.vy = SETTINGS.jumpForce; player.grounded = false; sfxJump();
    spawnParticles(player.x+player.w/2, player.y+player.h, '#aaa', 4, 1.5);
  }
  player.vy += SETTINGS.gravity; player.y += player.vy; player.grounded = false;
  for (const p of platforms) {
    if (player.vy >= 0 && player.x+player.w > p.x && player.x < p.x+p.w &&
        player.y+player.h >= p.y && player.y+player.h <= p.y+p.h+10) {
      player.y = p.y - player.h; player.vy = 0; player.grounded = true;
    }
  }
  if (player.y > canvas.height + 50) {
    lives--; updateLivesDisplay(); sfxHurt(); triggerShake(8);
    if (lives <= 0) { endGame(); return; }
    player.x = 100; player.y = 300; player.vy = 0; camera.x = 0; invincible = 90;
  }
  for (const c of collectibles) {
    if (!c.collected && collides(player, c)) {
      c.collected = true; score += 100; sfxCollect();
      spawnParticles(c.x+c.w/2, c.y+c.h/2, '#FFD700', 8, 2.5);
      addPopup(c.x+c.w/2, c.y, '+100', '#FFD700');
      document.getElementById('score').textContent = score;
    }
  }
  for (const e of enemies) {
    e.x += e.speed;
    if (e.x <= e.minX || e.x >= e.maxX) e.speed *= -1;
    if (e.x < -100) continue;
    if (collides(player, e)) {
      if (player.vy > 0 && player.y+player.h - e.y < 15) {
        spawnParticles(e.x+e.w/2, e.y+e.h/2, '#ff6b6b', 10, 3);
        addPopup(e.x+e.w/2, e.y, '+200', '#ff6b6b');
        e.x = -999; score += 200; sfxStomp();
        document.getElementById('score').textContent = score;
        player.vy = SETTINGS.jumpForce * 0.7;
      } else if (invincible <= 0) {
        lives--; updateLivesDisplay(); sfxHurt(); triggerShake(10); invincible = 90;
        if (lives <= 0) { endGame(); return; }
        player.vy = -5;
      }
    }
  }
  camera.x += (player.x - 250 - camera.x) * 0.08;
  if (camera.x < 0) camera.x = 0;
  // Update particles
  particles = particles.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.025; return p.life > 0; });
  popups = popups.filter(p => { p.y -= 1.2; p.life -= 0.018; return p.life > 0; });
  if (shake.intensity > 0) { shake.x = (Math.random()-0.5)*shake.intensity; shake.y = (Math.random()-0.5)*shake.intensity; shake.intensity *= 0.85; if (shake.intensity < 0.3) shake.intensity = 0; }
}

function draw(t) {
  drawBg(t);
  ctx.save();
  ctx.translate(-camera.x + shake.x, shake.y);
  // Platforms with glow
  for (const p of platforms) {
    ctx.fillStyle = SETTINGS.platformColor;
    ctx.shadowColor = SETTINGS.platformColor; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, p.h, 6); ctx.fill();
    ctx.shadowBlur = 0;
    // Highlight top
    const pg = ctx.createLinearGradient(p.x, p.y, p.x, p.y+6);
    pg.addColorStop(0, 'rgba(255,255,255,0.3)'); pg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = pg; ctx.fillRect(p.x, p.y, p.w, 6);
  }
  // Collectibles with glow
  for (const c of collectibles) {
    if (!c.collected) {
      const pulse = 0.8 + 0.3*Math.sin(t*0.005 + c.x);
      ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 12 * pulse;
      drawEmoji(SETTINGS.collectEmoji, c.x+c.w/2, c.y+c.h/2 - Math.sin(t*0.003+c.x)*3, 24);
      ctx.shadowBlur = 0;
    }
  }
  // Enemies
  for (const e of enemies) {
    if (e.x > -100) {
      ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 6;
      drawEmoji(SETTINGS.enemyEmoji, e.x+e.w/2, e.y+e.h/2 + Math.sin(t*0.004+e.x)*2, 32);
      ctx.shadowBlur = 0;
    }
  }
  // Player (flash when invincible)
  if (invincible <= 0 || Math.floor(invincible/4) % 2 === 0) {
    ctx.save();
    ctx.translate(player.x+player.w/2, player.y+player.h/2);
    ctx.scale(player.facing, 1);
    ctx.shadowColor = '#2ecc71'; ctx.shadowBlur = player.grounded ? 4 : 10;
    drawEmoji(SETTINGS.playerEmoji, 0, 0, 36);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  // Particles
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Score popups
  for (const p of popups) {
    ctx.globalAlpha = p.life;
    ctx.font = 'bold 18px sans-serif'; ctx.fillStyle = p.color;
    ctx.textAlign = 'center'; ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function endGame() {
  gameOver = true;
  if (score > highScore) { highScore = score; localStorage.setItem('plat_hi', String(score)); }
  document.getElementById('overlay-title').textContent = '💀 Game Over!';
  document.getElementById('overlay-sub').innerHTML = '<div class="final-score">Score: ' + score + '</div>' + (highScore > 0 ? '<div class="high-score">High Score: ' + highScore + '</div>' : '');
  document.getElementById('overlay-btn').textContent = '🔄 Play Again';
  document.getElementById('overlay-btn').onclick = restart;
  document.getElementById('overlay').style.display = 'flex';
}

function restart() {
  score = 0; lives = 3; gameOver = false; invincible = 0; particles = []; popups = [];
  player = { x: 100, y: 300, w: 36, h: 36, vy: 0, grounded: false, facing: 1 };
  camera = { x: 0 };
  collectibles.forEach(c => c.collected = false);
  enemies.forEach((e, i) => { e.x = [500,1000,1500][i]||500; e.speed = Math.abs(e.speed); });
  document.getElementById('score').textContent = '0';
  updateLivesDisplay();
  document.getElementById('overlay').style.display = 'none';
  gameStarted = true;
}

// SETTINGS_PATCH listener
addEventListener('message', e => { if (e.data?.type === 'SETTINGS_PATCH') Object.assign(SETTINGS, e.data.patch); });

function loop(t) { update(); draw(t || 0); requestAnimationFrame(loop); }
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

// ─── FLAPPY RUNNER ───────────────────────────────────────────────────
const FLAPPY_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #87CEEB; overflow: hidden; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
canvas { display: block; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
</style></head><body>
<canvas id="c" width="400" height="550"></canvas>
<script>
/* CUSTOMIZE: Game settings */
const SETTINGS = {
  birdEmoji: '🐦',
  pipeColor: '#2ecc71',
  pipeCapColor: '#27ae60',
  skyColor: '#87CEEB',
  groundColor: '#8B6914',
  grassColor: '#2ecc71',
  gravity: 0.4,
  jumpForce: -7,
  pipeSpeed: 2.5,
  pipeGap: 150,
  pipeInterval: 90,
  title: 'Flappy Runner'
};

// Listen for SETTINGS patches from parent
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SETTINGS_PATCH') {
    Object.assign(SETTINGS, e.data.patch);
  }
});

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const GROUND = H - 60;

let bird, pipes, score, gameState, frameCount;

function init() {
  bird = { x: 80, y: H / 2 - 30, vy: 0, size: 32 };
  pipes = [];
  score = 0;
  gameState = 'waiting'; // waiting, playing, dead
  frameCount = 0;
}

function jump() {
  if (gameState === 'waiting') { gameState = 'playing'; }
  if (gameState === 'playing') { bird.vy = SETTINGS.jumpForce; }
  if (gameState === 'dead') { init(); }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
});
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, { passive: false });

function spawnPipe() {
  const gapY = 80 + Math.random() * (GROUND - 80 - SETTINGS.pipeGap - 60);
  pipes.push({ x: W + 20, gapY, scored: false });
}

function update() {
  if (gameState !== 'playing') return;
  frameCount++;
  // Bird physics
  bird.vy += SETTINGS.gravity;
  bird.y += bird.vy;
  // Ceiling
  if (bird.y < 0) { bird.y = 0; bird.vy = 0; }
  // Ground
  if (bird.y + bird.size > GROUND) { gameState = 'dead'; return; }
  // Spawn pipes
  if (frameCount % SETTINGS.pipeInterval === 0) spawnPipe();
  // Move pipes
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= SETTINGS.pipeSpeed;
    // Score
    if (!p.scored && p.x + 40 < bird.x) { p.scored = true; score++; }
    // Collision (bird hitbox slightly smaller for fairness)
    const bx = bird.x + 6, by = bird.y + 6, bw = bird.size - 12, bh = bird.size - 12;
    const topPipeH = p.gapY;
    const botPipeY = p.gapY + SETTINGS.pipeGap;
    if (bx + bw > p.x + 8 && bx < p.x + 40 - 8) {
      if (by < topPipeH || by + bh > botPipeY) { gameState = 'dead'; return; }
    }
    if (p.x + 40 < -20) pipes.splice(i, 1);
  }
}

function drawRoundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}

function drawPipe(x, topH, botY) {
  const pw = 52, capW = 60, capH = 16;
  ctx.fillStyle = SETTINGS.pipeColor;
  // Top pipe body
  drawRoundRect(x + (capW - pw) / 2, 0, pw, topH - capH, 4);
  // Top pipe cap
  ctx.fillStyle = SETTINGS.pipeCapColor;
  drawRoundRect(x, topH - capH, capW, capH, 6);
  // Bottom pipe body
  ctx.fillStyle = SETTINGS.pipeColor;
  drawRoundRect(x + (capW - pw) / 2, botY + capH, pw, H - botY - capH, 4);
  // Bottom pipe cap
  ctx.fillStyle = SETTINGS.pipeCapColor;
  drawRoundRect(x, botY, capW, capH, 6);
}

function draw() {
  // Sky
  ctx.fillStyle = SETTINGS.skyColor;
  ctx.fillRect(0, 0, W, H);
  // Clouds (static parallax)
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const clouds = [[60,60,80,30],[200,40,100,25],[320,80,70,28],[100,120,60,22]];
  for (const [cx,cy,cw,ch] of clouds) { ctx.beginPath(); ctx.ellipse(cx, cy, cw/2, ch/2, 0, 0, Math.PI*2); ctx.fill(); }
  // Pipes
  for (const p of pipes) drawPipe(p.x, p.gapY, p.gapY + SETTINGS.pipeGap);
  // Ground
  ctx.fillStyle = SETTINGS.groundColor;
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = SETTINGS.grassColor;
  ctx.fillRect(0, GROUND, W, 12);
  // Bird
  ctx.font = bird.size + 'px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.save();
  const angle = Math.min(Math.max(bird.vy * 0.06, -0.5), 0.7);
  ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
  ctx.rotate(angle);
  ctx.fillText(SETTINGS.birdEmoji, 0, 0);
  ctx.restore();
  // Score
  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 3;
  ctx.strokeText(score, W / 2, 60);
  ctx.fillText(score, W / 2, 60);
  // Overlays
  if (gameState === 'waiting') {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Flappy Runner 🐦', W/2, H/2 - 40);
    ctx.font = '18px sans-serif';
    ctx.fillText('Tap or press Space to fly!', W/2, H/2 + 10);
  }
  if (gameState === 'dead') {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('Game Over! 💀', W/2, H/2 - 50);
    ctx.font = '22px sans-serif';
    ctx.fillText('Score: ' + score, W/2, H/2);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#FFE66D';
    ctx.fillText('Tap or Space to try again', W/2, H/2 + 50);
  }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
init(); loop();
</script></body></html>`;

// ─── BRICK BREAKER ────────────────────────────────────────────────────
const BRICK_BREAKER_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0a0a2e; overflow: hidden; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
canvas { display: block; border-radius: 12px; box-shadow: 0 8px 32px rgba(100,50,255,0.4); }
</style></head><body>
<canvas id="c" width="480" height="560"></canvas>
<script>
/* CUSTOMIZE: Game settings */
const SETTINGS = {
  paddleColor: '#A855F7',
  paddleGlow: '#7C3AED',
  ballColor: '#FFE66D',
  bgColor: '#0a0a2e',
  brickRows: 5,
  brickCols: 9,
  brickEmojis: ['🍎','🍊','🍋','💙','💜'],
  paddleW: 90,
  paddleSpeed: 7,
  ballSpeed: 4.5,
  lives: 3,
  title: 'Brick Breaker'
};

// Listen for SETTINGS patches from parent
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SETTINGS_PATCH') {
    Object.assign(SETTINGS, e.data.patch);
  }
});

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let paddle, ball, bricks, score, lives, gameOver, gameWon, launched;

function initBricks() {
  bricks = [];
  const brickW = Math.floor((W - 40) / SETTINGS.brickCols);
  const brickH = 34;
  for (let r = 0; r < SETTINGS.brickRows; r++) {
    for (let c = 0; c < SETTINGS.brickCols; c++) {
      bricks.push({
        x: 20 + c * brickW, y: 60 + r * (brickH + 6),
        w: brickW - 6, h: brickH,
        emoji: SETTINGS.brickEmojis[r % SETTINGS.brickEmojis.length],
        alive: true,
        hp: r < 2 ? 1 : r < 4 ? 1 : 2,
      });
    }
  }
}

function init() {
  paddle = { x: W / 2 - SETTINGS.paddleW / 2, y: H - 40, w: SETTINGS.paddleW, h: 14 };
  ball = { x: W / 2, y: H - 60, r: 9, vx: SETTINGS.ballSpeed * 0.7, vy: -SETTINGS.ballSpeed };
  score = 0; lives = SETTINGS.lives; gameOver = false; gameWon = false; launched = false;
  initBricks();
}

const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.code === 'Space') { launched = true; e.preventDefault(); }
});
document.addEventListener('keyup', e => keys[e.key] = false);
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  paddle.x = (e.clientX - rect.left) * (W / rect.width) - paddle.w / 2;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
  launched = true;
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  paddle.x = (e.touches[0].clientX - rect.left) * (W / rect.width) - paddle.w / 2;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
  launched = true;
}, { passive: false });
canvas.addEventListener('click', () => { launched = true; });

function update() {
  if (gameOver || gameWon) return;
  // Keyboard paddle
  if (keys['ArrowLeft'] || keys['a']) paddle.x -= SETTINGS.paddleSpeed;
  if (keys['ArrowRight'] || keys['d']) paddle.x += SETTINGS.paddleSpeed;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

  if (!launched) {
    ball.x = paddle.x + paddle.w / 2;
    return;
  }
  // Ball movement
  ball.x += ball.vx; ball.y += ball.vy;
  // Wall bounces
  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
  if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
  // Paddle collision
  if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h &&
      ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
    const hitPos = (ball.x - paddle.x) / paddle.w; // 0..1
    ball.vx = (hitPos - 0.5) * SETTINGS.ballSpeed * 2;
    ball.vy = -Math.abs(ball.vy);
    ball.y = paddle.y - ball.r;
  }
  // Lost ball
  if (ball.y - ball.r > H) {
    lives--;
    if (lives <= 0) { gameOver = true; return; }
    launched = false;
    ball.x = paddle.x + paddle.w / 2; ball.y = paddle.y - 20;
    ball.vx = SETTINGS.ballSpeed * (Math.random() > 0.5 ? 0.7 : -0.7);
    ball.vy = -SETTINGS.ballSpeed;
  }
  // Brick collision
  let allDead = true;
  for (const b of bricks) {
    if (!b.alive) continue;
    allDead = false;
    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
        ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
      b.hp--;
      if (b.hp <= 0) { b.alive = false; score += 10; }
      // Determine which side was hit
      const overlapL = ball.x + ball.r - b.x;
      const overlapR = b.x + b.w - (ball.x - ball.r);
      const overlapT = ball.y + ball.r - b.y;
      const overlapB = b.y + b.h - (ball.y - ball.r);
      const minH = Math.min(overlapL, overlapR);
      const minV = Math.min(overlapT, overlapB);
      if (minH < minV) ball.vx *= -1; else ball.vy *= -1;
      break;
    }
  }
  if (allDead) { gameWon = true; }
}

function draw() {
  // Background
  ctx.fillStyle = SETTINGS.bgColor;
  ctx.fillRect(0, 0, W, H);
  // Stars bg
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 40; i++) {
    ctx.fillRect((i * 113) % W, (i * 79) % H, 1.5, 1.5);
  }
  // Bricks
  ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of bricks) {
    if (!b.alive) continue;
    ctx.globalAlpha = b.hp === 1 ? 1 : 0.6;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 6); ctx.stroke();
    ctx.globalAlpha = b.hp === 1 ? 1 : 0.45;
    ctx.fillText(b.emoji, b.x + b.w / 2, b.y + b.h / 2);
    ctx.globalAlpha = 1;
  }
  // Paddle with glow
  ctx.shadowBlur = 16; ctx.shadowColor = SETTINGS.paddleGlow;
  ctx.fillStyle = SETTINGS.paddleColor;
  ctx.beginPath(); ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 8); ctx.fill();
  ctx.shadowBlur = 0;
  // Ball with glow
  ctx.shadowBlur = 20; ctx.shadowColor = SETTINGS.ballColor;
  ctx.fillStyle = SETTINGS.ballColor;
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // HUD
  ctx.fillStyle = 'white';
  ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 16, 36);
  ctx.textAlign = 'right';
  ctx.fillText('Lives: ' + '❤️'.repeat(Math.max(0,lives)), W - 16, 36);
  // Launch hint
  if (!launched) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Move mouse or arrow keys to aim • Click / Space to launch', W/2, H - 15);
  }
  // Overlays
  if (gameOver || gameWon) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(gameWon ? 'You Win! 🎉' : 'Game Over! 💀', W/2, H/2 - 40);
    ctx.font = '22px sans-serif';
    ctx.fillText('Score: ' + score, W/2, H/2 + 5);
    ctx.font = '16px sans-serif'; ctx.fillStyle = '#FFE66D';
    ctx.fillText('Click to play again', W/2, H/2 + 50);
    canvas.onclick = () => { init(); canvas.onclick = () => { launched = true; }; };
  }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
init(); loop();
</script></body></html>`;

// ─── MUSIC PLAYER TEMPLATE ───────────────────────────────────────────
const MUSIC_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0D0B1F; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; padding: 20px; overflow: hidden; }
h2 { font-size: 20px; color: #FFE66D; margin-bottom: 4px; }
#controls { display: flex; gap: 12px; align-items: center; }
button { padding: 10px 24px; font-size: 16px; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; background: #A855F7; color: white; transition: transform 0.1s; }
button:active { transform: scale(0.95); }
#info { font-size: 13px; color: rgba(255,255,255,0.5); text-align: center; }
#visualizer { display: flex; align-items: flex-end; gap: 3px; height: 60px; }
.bar { width: 8px; background: #4ECDC4; border-radius: 4px 4px 0 0; transition: height 0.08s; }
#grid { display: grid; gap: 3px; }
.cell { width: 22px; height: 22px; border-radius: 4px; cursor: default; border: 1px solid rgba(255,255,255,0.1); transition: background 0.1s; }
.cell.active { background: #A855F7 !important; }
.instrument-row { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.inst-label { font-size: 16px; width: 28px; text-align: center; }
</style></head><body>
<h2 id="title">🎵 My Song</h2>
<div id="controls">
  <button id="playBtn">▶ Play</button>
</div>
<div id="beatGrid"></div>
<div id="visualizer"></div>
<div id="info">Generated by VibeQuest Music Builder</div>
<script>
/* CUSTOMIZE: Music settings */
const SETTINGS = {
  title: 'My Song',
  bpm: 120,
  instruments: ['drums', 'synth', 'bass', 'arp'],
  melody: [60, 62, 64, 65, 67, 65, 64, 62, 60, 60, 62, 64, 65, 67, 69, 67],
  bass:   [36, 36, 38, 36, 36, 36, 38, 38, 36, 36, 38, 36, 36, 36, 38, 38],
  drums:  [1,0,0,0, 1,0,1,0, 1,0,0,1, 1,0,1,0],
  arp:    [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
  voice:  [0,0,0,0, 60,0,60,0, 0,0,0,0, 62,0,62,0],
  lead:   [0,64,0,0, 67,0,64,0, 0,65,0,0, 67,0,0,0],
  pad:    [60,0,0,0, 0,0,0,0, 60,0,0,0, 0,0,0,0],
  perc:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1],
  drumColor: '#FF6B6B',
  synthColor: '#4ECDC4',
  bassColor: '#A855F7',
  arpColor: '#FFE66D',
  voiceColor: '#FF69B4',
  leadColor: '#FFA500',
  padColor: '#6495ED',
  percColor: '#90EE90',
};

// Listen for SETTINGS patches
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SETTINGS_PATCH') {
    Object.assign(SETTINGS, e.data.patch);
    renderGrid(); updateTitle();
    if (isPlaying) { stopMusic(); startMusic(); }
  }
});

function updateTitle() {
  document.getElementById('title').textContent = '🎵 ' + SETTINGS.title;
}

// ─── Beat grid rendering ──────────────────────────────────────────
const BEATS = 16;
const ROWS = [
  { key: 'drums', emoji: '🥁', color: () => SETTINGS.drumColor },
  { key: 'melody', emoji: '🎹', color: () => SETTINGS.synthColor },
  { key: 'bass',  emoji: '🎸', color: () => SETTINGS.bassColor },
  { key: 'arp',   emoji: '✨', color: () => SETTINGS.arpColor },
  { key: 'voice', emoji: '🎤', color: () => SETTINGS.voiceColor },
  { key: 'lead',  emoji: '🎺', color: () => SETTINGS.leadColor },
  { key: 'pad',   emoji: '🎻', color: () => SETTINGS.padColor },
  { key: 'perc',  emoji: '🪘', color: () => SETTINGS.percColor },
];

function renderGrid() {
  const container = document.getElementById('beatGrid');
  container.innerHTML = '';
  ROWS.forEach(row => {
    // Map ROWS display key to the instruments[] key (melody row uses 'synth' in instruments)
    const instKey = row.key === 'melody' ? 'synth' : row.key;
    const isActive = SETTINGS.instruments.includes(instKey);
    const rowEl = document.createElement('div');
    rowEl.className = 'instrument-row';
    rowEl.style.opacity = isActive ? '1' : '0.3';
    const label = document.createElement('span');
    label.className = 'inst-label'; label.textContent = row.emoji;
    rowEl.appendChild(label);
    const data = SETTINGS[row.key];
    for (let i = 0; i < BEATS; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = row.key + '-' + i;
      const on = Array.isArray(data) ? (data[i % data.length] ? true : false) : false;
      cell.style.background = on ? row.color() : 'rgba(255,255,255,0.05)';
      rowEl.appendChild(cell);
    }
    container.appendChild(rowEl);
  });
}

// Visualizer bars
const vizContainer = document.getElementById('visualizer');
const BARS = 16;
for (let i = 0; i < BARS; i++) {
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.style.height = '4px';
  vizContainer.appendChild(bar);
}
function updateViz(beat, active) {
  const bars = vizContainer.querySelectorAll('.bar');
  bars.forEach((bar, i) => {
    const h = active && i === beat ? 20 + Math.random() * 40 : Math.max(4, parseFloat(bar.style.height) * 0.7);
    bar.style.height = h + 'px';
    bar.style.background = i === beat && active ? '#FFE66D' : '#4ECDC4';
  });
}

// ─── Audio engine ─────────────────────────────────────────────────
let audioCtx = null, isPlaying = false, beat = 0, nextBeatTime = 0, scheduleId = null;

function midiToFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

function playDrumHit(when, audioCtx) {
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.15, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4);
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.5, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.1);
  src.connect(gain); gain.connect(audioCtx.destination);
  src.start(when); src.stop(when + 0.15);
}

function playNote(freq, when, dur, type, vol, audioCtx) {
  const osc = audioCtx.createOscillator();
  osc.type = type; osc.frequency.value = freq;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(when); osc.stop(when + dur + 0.05);
}

function playVoiceNote(freq, when, dur, ctx) {
  // Choir "aah": 3 slightly detuned sawtooth oscillators through a formant bandpass filter
  [-8, 0, 8].forEach(detune => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = freq; osc.detune.value = detune;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 800; filt.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(0.07, when + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    osc.start(when); osc.stop(when + dur + 0.1);
  });
}

function playPadNote(freq, when, dur, ctx) {
  // Soft strings: sawtooth through lowpass, slow attack
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth'; osc.frequency.value = freq;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass'; filt.frequency.value = 1400;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.1, when + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
  osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  osc.start(when); osc.stop(when + dur + 0.1);
}

function playPercHit(when, ctx) {
  // Clap: noise burst through highpass filter
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filt = ctx.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 1500;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
  src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  src.start(when); src.stop(when + 0.1);
}

function scheduleBeat(b, time) {
  const secPerBeat = 60 / SETTINGS.bpm / 4;
  const mel = SETTINGS.melody;
  const bassNotes = SETTINGS.bass;
  const drums = SETTINGS.drums;
  const arp = SETTINGS.arp;
  const active = SETTINGS.instruments;
  if (active.includes('drums') && drums && drums[b % drums.length]) playDrumHit(time, audioCtx);
  if (active.includes('synth') && mel && mel[b % mel.length] > 0) {
    playNote(midiToFreq(mel[b % mel.length]), time, secPerBeat * 0.85, 'square', 0.18, audioCtx);
  }
  if (active.includes('bass') && b % 4 === 0 && bassNotes && bassNotes[b % bassNotes.length] > 0) {
    playNote(midiToFreq(bassNotes[b % bassNotes.length]), time, secPerBeat * 3.5, 'sine', 0.22, audioCtx);
  }
  if (active.includes('arp') && arp && arp[b % arp.length]) {
    const arpNote = mel ? mel[b % mel.length] + 12 : 72;
    playNote(midiToFreq(arpNote), time, secPerBeat * 0.4, 'triangle', 0.1, audioCtx);
  }
  // ── New instruments ──────────────────────────────────────────────
  const voice = SETTINGS.voice;
  if (active.includes('voice') && voice && voice[b % voice.length] > 0) {
    playVoiceNote(midiToFreq(voice[b % voice.length]), time, secPerBeat * 1.2, audioCtx);
  }
  const lead = SETTINGS.lead;
  if (active.includes('lead') && lead && lead[b % lead.length] > 0) {
    playNote(midiToFreq(lead[b % lead.length]), time, secPerBeat * 0.7, 'sawtooth', 0.12, audioCtx);
  }
  const pad = SETTINGS.pad;
  if (active.includes('pad') && b % 4 === 0 && pad && pad[b % pad.length] > 0) {
    playPadNote(midiToFreq(pad[b % pad.length]), time, secPerBeat * 7, audioCtx);
  }
  const perc = SETTINGS.perc;
  if (active.includes('perc') && perc && perc[b % perc.length]) playPercHit(time, audioCtx);
}

function scheduleLoop() {
  if (!isPlaying) return;
  const LOOK_AHEAD = 0.1;
  const SCHEDULE_INTERVAL = 25;
  const secPerBeat = 60 / SETTINGS.bpm / 4;
  while (nextBeatTime < audioCtx.currentTime + LOOK_AHEAD) {
    const b = beat % BEATS;
    scheduleBeat(b, nextBeatTime);
    // Highlight grid cell
    const currentBeat = b;
    setTimeout(() => {
      if (!isPlaying) return;
      ROWS.forEach(row => {
        for (let i = 0; i < BEATS; i++) {
          const cell = document.getElementById(row.key + '-' + i);
          if (!cell) return;
          const data = SETTINGS[row.key];
          const on = Array.isArray(data) ? (data[i % data.length] ? true : false) : false;
          if (i === currentBeat) {
            cell.classList.add('active');
          } else {
            cell.classList.remove('active');
            cell.style.background = on ? (ROWS.find(r=>r.key===row.key)?.color() || '#fff') : 'rgba(255,255,255,0.05)';
          }
        }
      });
      updateViz(currentBeat, true);
    }, (nextBeatTime - audioCtx.currentTime) * 1000);
    beat++;
    nextBeatTime += secPerBeat;
  }
  scheduleId = setTimeout(scheduleLoop, SCHEDULE_INTERVAL);
}

function startMusic() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  beat = 0; nextBeatTime = audioCtx.currentTime + 0.05;
  isPlaying = true;
  scheduleLoop();
  document.getElementById('playBtn').textContent = '⏸ Pause';
}

function stopMusic() {
  isPlaying = false;
  if (scheduleId) clearTimeout(scheduleId);
  document.getElementById('playBtn').textContent = '▶ Play';
  ROWS.forEach(row => {
    for (let i = 0; i < BEATS; i++) {
      const cell = document.getElementById(row.key + '-' + i);
      if (cell) {
        cell.classList.remove('active');
        const data = SETTINGS[row.key];
        const on = Array.isArray(data) ? (data[i % data.length] ? true : false) : false;
        cell.style.background = on ? (ROWS.find(r=>r.key===row.key)?.color() || '#fff') : 'rgba(255,255,255,0.05)';
      }
    }
  });
  updateViz(0, false);
}

document.getElementById('playBtn').addEventListener('click', () => {
  if (isPlaying) stopMusic(); else startMusic();
});

updateTitle(); renderGrid();
</script></body></html>`;

// ─── Add postMessage support to existing templates ───────────────────
// (injected before </script> in each template — they already have it via the new templates above;
//  for the existing ones we patch them inline by appending listener code)

function addPostMessageSupport(html: string): string {
  // Insert message listener right after the SETTINGS object declaration
  const listener = `
// Listen for SETTINGS patches from parent (VibeQuest builder)
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SETTINGS_PATCH') {
    Object.assign(SETTINGS, e.data.patch);
  }
});
`;
  // Insert after the closing }; of the SETTINGS block
  return html.replace(/(const SETTINGS = \{[\s\S]*?\};)/, '$1' + listener);
}

const MAZE_HTML_PATCHED = addPostMessageSupport(MAZE_HTML);
const SPACE_BLASTER_HTML_PATCHED = addPostMessageSupport(SPACE_BLASTER_HTML);
const SNAKE_HTML_PATCHED = addPostMessageSupport(SNAKE_HTML);

// ─── Template Registry ──────────────────────────────────────────────
export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: 'platformer',
    name: 'Platformer',
    emoji: '🏃',
    description: 'Side-scrolling jump & run game — like Mario!',
    baseHtml: PLATFORMER_HTML, // already has SETTINGS_PATCH listener built in
    customizableAreas: ['Player character', 'Enemies', 'Collectibles', 'Background theme', 'Platform layout', 'Power-ups', 'Scoring', 'Difficulty'],
  },
  {
    id: 'maze',
    name: 'Maze Runner',
    emoji: '👻',
    description: 'Navigate a maze, eat dots, avoid ghosts — like Pacman!',
    baseHtml: MAZE_HTML_PATCHED,
    customizableAreas: ['Player character', 'Ghosts', 'Maze theme', 'Dots & power-ups', 'Ghost behavior', 'Speed', 'Scoring'],
  },
  {
    id: 'space-blaster',
    name: 'Space Blaster',
    emoji: '🚀',
    description: 'Shoot aliens from your spaceship — like Space Invaders!',
    baseHtml: SPACE_BLASTER_HTML_PATCHED,
    customizableAreas: ['Ship design', 'Enemy types', 'Weapons', 'Background', 'Boss fights', 'Power-ups', 'Wave difficulty'],
  },
  {
    id: 'snake',
    name: 'Snake',
    emoji: '🐍',
    description: 'Grow your snake by eating food — classic Snake!',
    baseHtml: SNAKE_HTML_PATCHED,
    customizableAreas: ['Snake appearance', 'Food types', 'Bonus items', 'Speed progression', 'Obstacles', 'Grid theme', 'Scoring'],
  },
  {
    id: 'flappy',
    name: 'Flappy Runner',
    emoji: '🐦',
    description: 'Tap to fly, dodge the pipes — like Flappy Bird!',
    baseHtml: FLAPPY_HTML,
    customizableAreas: ['Bird character', 'Pipe colour', 'Sky colour', 'Gravity', 'Gap size', 'Speed'],
  },
  {
    id: 'brick-breaker',
    name: 'Brick Breaker',
    emoji: '🧱',
    description: 'Bounce the ball, smash all the bricks — like Breakout!',
    baseHtml: BRICK_BREAKER_HTML,
    customizableAreas: ['Paddle colour', 'Ball colour', 'Brick emojis', 'Rows & columns', 'Speed', 'Lives'],
  },
];

export const MUSIC_TEMPLATE: GameTemplate = {
  id: 'music',
  name: 'Music Builder',
  emoji: '🎵',
  description: 'Compose your own song with beats, melody, bass, and arpeggios!',
  baseHtml: MUSIC_HTML,
  customizableAreas: ['BPM / Tempo', 'Melody notes', 'Bass line', 'Drum pattern', 'Voice', 'Lead instrument', 'Strings pad', 'Extra percussion', 'Title'],
};

export function getGameTemplate(id: string): GameTemplate | undefined {
  if (id === 'music') return MUSIC_TEMPLATE;
  return GAME_TEMPLATES.find(t => t.id === id);
}
