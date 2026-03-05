/**
 * VibeQuest AI Engine — server-side only.
 * Translates kids' descriptions into visual logic blocks + real code.
 */
import Anthropic from '@anthropic-ai/sdk';

// Strip markdown code fences the model sometimes adds
function parseJSON(raw: string) {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

// Lazy singleton — only runs server-side
let _client: Anthropic | null = null;
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Tier = 1 | 2 | 3;

const DIFFICULTY_PROMPTS: Record<Difficulty, string> = {
  easy: 'Use very simple language. Max 5 logic blocks. Explain like talking to a 6-year-old. Be VERY generous with success — if the child describes the right concept, mark success: true even if wording is imprecise. Encourage effort!',
  medium: 'Use moderate complexity. Up to 6 logic blocks. Explain like talking to a 10-year-old.',
  hard: 'Can use loops, nested conditions, functions. Explain like talking to a 14-year-old.',
};

const TIER_PROMPTS: Record<Tier, string> = {
  1: 'This is for young explorers (6-8 years old). Use story language, emojis, and very simple concepts.',
  2: 'This is for adventurers (9-12 years old). Show real pseudo-code alongside visual blocks. Bridge to real programming.',
  3: 'This is for vibe coders (13-16 years old). Show real JavaScript/Python code. Teach prompt engineering and iteration.',
};

export interface LogicBlock {
  type: 'if' | 'else' | 'loop' | 'action' | 'condition';
  label: string;
  children?: LogicBlock[];
}

export interface TranslationResult {
  logicBlocks: LogicBlock[];
  code: string;
  explanation: string;
  success: boolean;
  hint: string;
  pseudoCode?: string; // for tier 2
  promptTips?: string[]; // for tier 3
}

export interface MissionResult {
  title: string;
  story: string;
  challenge: string;
  winCondition: string;
  concept: string;
  starterHint: string;
}

export interface LessonSummaryResult {
  headline: string;
  explanation: string;
  realWorldExample: string;
  badge: string;
}

export interface BuilderMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BuilderResult {
  html: string;
  explanation: string;
  suggestions: string[];
}

/**
 * Translates a plain-language solution into logic blocks and real code.
 */
export async function translateToCode(
  userDescription: string,
  missionContext: string,
  difficulty: Difficulty = 'easy',
  tier: Tier = 1
): Promise<TranslationResult> {
  const extraInstructions = tier === 2
    ? '\nAlso include a "pseudoCode" field with simple beginner-friendly pseudo-code.'
    : tier === 3
    ? '\nAlso include a "promptTips" array with 2-3 tips on how to write even better prompts.'
    : '';

  const systemPrompt = `You are VibeQuest AI, a friendly coding guide for kids.
${DIFFICULTY_PROMPTS[difficulty]}
${TIER_PROMPTS[tier]}

Your job: take the kid's plain-language description and return a JSON response with:
- logicBlocks: array of visual block objects [{type, label, children}]
- code: the real JavaScript code equivalent
- explanation: what logic concept this teaches (e.g. "You just used an IF statement!")
- success: boolean — does this solution actually solve the mission?
- hint: if success is false, give a gentle nudge without giving away the answer${extraInstructions}

Block types allowed: "if", "else", "loop", "action", "condition"

Always respond with valid JSON only. No markdown. No extra text.`;

  const userPrompt = `Mission: ${missionContext}

Kid's solution: "${userDescription}"

Translate this into logic blocks and code. Evaluate if it solves the mission.`;

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  try {
    return parseJSON((message.content[0] as { text: string }).text);
  } catch {
    return {
      logicBlocks: [],
      code: '',
      explanation: "I couldn't understand that — try describing it differently!",
      success: false,
      hint: 'Try breaking your solution into smaller steps.',
    };
  }
}

/**
 * Generates a new story mission for a given difficulty and tier.
 */
export async function generateMission(
  difficulty: Difficulty,
  tier: Tier,
  completedConcepts: string[] = []
): Promise<MissionResult> {
  const systemPrompt = `You are VibeQuest mission designer. Create engaging coding missions for kids.
${DIFFICULTY_PROMPTS[difficulty]}
${TIER_PROMPTS[tier]}

Completed concepts to build upon: ${completedConcepts.join(', ') || 'none yet'}

Return valid JSON only:
{
  "title": "short mission name",
  "story": "2-3 sentence narrative setup",
  "challenge": "the specific problem to solve",
  "winCondition": "how we detect success",
  "concept": "the coding concept this mission teaches",
  "starterHint": "a gentle first hint"
}`;

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: `Generate a ${difficulty} tier-${tier} mission.` }],
    system: systemPrompt,
  });

  return parseJSON((message.content[0] as { text: string }).text);
}

/**
 * Generates a post-mission lesson summary and badge.
 */
export async function generateLessonSummary(
  concept: string,
  attempts: number,
  difficulty: Difficulty,
  tier: Tier = 1
): Promise<LessonSummaryResult> {
  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You are VibeQuest's celebration coach. ${DIFFICULTY_PROMPTS[difficulty]} ${TIER_PROMPTS[tier]}
Return JSON only: { "headline", "explanation", "realWorldExample", "badge" }
badge is one of: "Loop Legend", "Condition Crusher", "Function Finder", "Logic Master", "Code Explorer", "Vibe Coder", "Prompt Pro", "AI Whisperer"`,
    messages: [{
      role: 'user',
      content: `The kid just learned: ${concept}. It took them ${attempts} attempt(s). Celebrate and explain!`,
    }],
  });

  return parseJSON((message.content[0] as { text: string }).text);
}

/**
 * Game Builder mode: modifies a game template based on kid's description.
 * Returns a complete, playable HTML game.
 */
export async function gameBuilderIterate(
  conversation: BuilderMessage[],
  tier: Tier = 2
): Promise<BuilderResult> {
  const ageNote = tier === 1 ? '6-8 year olds. Keep it simple, colorful, and fun!'
    : tier === 2 ? '9-12 year olds. They can handle more detail.'
    : '13-16 year olds. They want full control.';

  const systemPrompt = `You are VibeQuest's Game Builder AI — you help kids customize classic games into stunning, polished creations.

The kid will give you a base HTML game template and describe what they want to change.
Your job: modify the template to match their vision and return a COMPLETE, WORKING, VISUALLY IMPRESSIVE game.

This is for ${ageNote}

CRITICAL RULES:
1. Always respond with valid JSON: { "html": "...", "explanation": "...", "suggestions": [...] }
2. The "html" field must contain a COMPLETE, WORKING HTML game document
3. The game MUST be fully playable — mentally test ALL mechanics before returning
4. Use HTML5 Canvas for rendering. All CSS in <style>, all JS in <script> tags
5. Support keyboard controls (arrow keys / WASD / space) AND touch controls for mobile
6. Include a polished HUD: score counter, lives/health, combo multiplier
7. Include a game-over screen with final score, high score (localStorage), and animated restart button
8. The game must work in a sandboxed iframe with allow-scripts only
9. No external CDNs, APIs, or network requests — 100% self-contained
10. Keep the core game mechanics working — only modify what the kid asks for
11. The "explanation" field: describe what you changed in 1-2 kid-friendly sentences
12. The "suggestions" field: 2-3 specific, creative next improvements they could request

VISUAL QUALITY REQUIREMENTS — MAKE IT LOOK AMAZING:
- Use requestAnimationFrame for smooth 60fps gameplay
- Add a gradient or starfield background (not flat colours)
- Add particle effects: explosions on death, sparkle trails on collectibles, dust on landing
- Screen shake on hit/death (brief canvas translate offset)
- Smooth camera/viewport scrolling for platformers
- Score pop-ups that float upward and fade (+10, +50, COMBO!)
- Glowing effects on power-ups and collectibles (pulsing shadow/halo)
- Animated title screen with "Press SPACE to start" prompt
- Smooth transitions between states (fade in/out)
- Use emoji for characters and items — they render great on all devices at any size
- Use ctx.shadowBlur and ctx.shadowColor for glow effects on projectiles and pickups
- Add subtle screen-wide effects: vignette overlay, scanlines for retro feel, or colour tint shifts
- Make the UI beautiful: rounded score display, gradient health bars, animated combo counters

GAMEPLAY QUALITY:
- Implement collision detection properly with bounding-box or circle checks
- Add difficulty progression: speed increases, more enemies, tighter patterns
- Make scoring satisfying: big numbers, combo multipliers, streak bonuses
- Add brief invincibility frames after taking damage (flashing effect)
- Sound: use oscillator-based Web Audio API for simple SFX (jump, collect, hit, game-over jingle)
- Add at least one collectible type and one hazard/enemy type
- Game feel: responsive controls with no input lag, satisfying movement physics

COMMON PROMPTS — handle these well:
- "make it space themed" → dark starfield bg, asteroid enemies, rocket player, laser projectiles, nebula colours
- "add power-ups" → shield (invincibility), magnet (auto-collect), 2x score, speed boost — with glow pickup effect
- "make it harder" → faster enemies, more obstacles, shorter timers, boss wave every 5 levels
- "make it underwater" → blue-green gradient, bubble particles, fish enemies, seaweed platforms, wavy motion
- "add a dragon/boss" → large enemy sprite with health bar, attack patterns, phase changes
- "make the character a [X]" → swap the emoji, adjust size if needed
- "add explosions" → particle burst on enemy death (8-12 particles, random velocity, fade out)
- "candy land / rainbow" → pastel gradients, candy emoji items, rainbow trail effects

Always respond with valid JSON only. No markdown fences. No extra text.`;

  const messages = conversation.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: systemPrompt,
    messages,
  });

  return parseJSON((message.content[0] as { text: string }).text);
}


/**
 * Music Builder: iterate on a song's SETTINGS based on the kid's description.
 * Returns updated SETTINGS JSON + explanation (much faster than full HTML regeneration).
 */
export interface MusicSettings {
  title?: string;
  bpm?: number;
  instruments?: string[];
  melody?: number[];
  bass?: number[];
  drums?: number[];
  arp?: number[];
}

export interface MusicIterateResult {
  settings: MusicSettings;
  explanation: string;
}

export async function musicIterate(
  currentSettings: MusicSettings,
  kidDescription: string,
  tier: Tier = 1
): Promise<MusicIterateResult> {
  const systemPrompt = `You are VibeQuest's Music Builder AI. A kid is describing music they want to create.

Your job: take their description and return updated music SETTINGS as JSON.

${TIER_PROMPTS[tier]}

MUSIC SETTINGS schema:
- "title": string — song title
- "bpm": number 60-180 — tempo
- "instruments": array of active instrument keys — any subset of ["drums","synth","bass","arp","voice","lead","pad","perc"]
- "melody": array of 16 MIDI note numbers (0=silence, 60=C4, 62=D4, 64=E4, 65=F4, 67=G4, 69=A4, 71=B4, 72=C5)
- "bass": array of 16 MIDI note numbers (0=silence, bass range 36-48)
- "drums": array of 16 values (1=hit, 0=silence)
- "arp": array of 16 values (1=on, 0=off)
- "voice": array of 16 MIDI note numbers (0=silence, range 48-72) — choir/vocal melody
- "lead": array of 16 MIDI note numbers (0=silence, range 60-84) — bright lead instrument (horn, flute, guitar solo)
- "pad": array of 16 MIDI note numbers (0=silence, range 48-72) — slow-attack strings/chord pad (put note on beat 1 of each bar, 0 elsewhere)
- "perc": array of 16 values (1=hit, 0=silence) — extra percussion (claps, shakers)

Guidelines:
- If the kid says "space adventure": minor pentatonic notes, BPM ~100-120, include arps
- If they say "funky": syncopated drums (hits on 2,6,10,14), heavy bass, BPM 130+
- If they say "faster": increase BPM by 20-40
- If they say "slower": decrease BPM by 20-30
- If they say "add voice" / "add vocals" / "singing" / "choir": add "voice" to instruments, write a vocal melody
- If they say "add flute" / "add horn" / "add guitar" / "lead instrument": add "lead" to instruments, write a lead melody
- If they say "add strings" / "orchestra" / "pad" / "cinematic": add "pad" to instruments, put chord root notes on beat 1 of each bar
- If they say "add clap" / "add snare" / "extra percussion" / "add perc": add "perc" to instruments, write a syncopated pattern
- Always return all 16 values in each array you modify
- Only modify what the description asks for; keep everything else from currentSettings

Return valid JSON only:
{
  "settings": { /* only the fields to change */ },
  "explanation": "1-2 kid-friendly sentences about what you changed"
}`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Current settings: ${JSON.stringify(currentSettings)}\n\nKid's description: "${kidDescription}"\n\nUpdate the music!`,
    }],
  });

  return parseJSON((msg.content[0] as { text: string }).text);
}

/**
 * Avatar Generator: produces a simple SVG avatar from a text description.
 */
export async function generateAvatar(description: string): Promise<{ svg: string }> {
  const systemPrompt = `You are an SVG avatar generator for a kids' coding app.

Create a simple, friendly, colourful SVG avatar based on the description.
- 120×120px viewBox
- Use simple geometric shapes (circles, rects, paths) — no complexity
- Friendly face if depicting a character
- Vivid, cheerful colours that work on a light background
- No external references, fonts, or images — pure SVG shapes only
- Return ONLY the complete <svg>...</svg> element, nothing else`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Create an avatar for: "${description}"` }],
  });

  const raw = (msg.content[0] as { text: string }).text.trim();
  // Extract just the SVG element
  const match = raw.match(/<svg[\s\S]*<\/svg>/i);
  const svg = match ? match[0] : raw;
  return { svg };
}

