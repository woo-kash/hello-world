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
    max_tokens: 1024,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  return parseJSON((message.content[0] as { text: string }).text);
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
 * Builder mode: multi-round conversation that generates a full HTML app.
 * Used for the AI App Builder mission where kids iterate on a web app.
 */
export async function builderIterate(
  conversation: BuilderMessage[],
  tier: Tier = 3
): Promise<BuilderResult> {
  const systemPrompt = `You are VibeQuest's AI App Builder — a creative coding partner for kids (age ${tier === 3 ? '13-16' : '9-12'}).

Your job: take the kid's description and generate a COMPLETE, WORKING single-file HTML app.

RULES:
1. Always respond with valid JSON: { "html": "...", "explanation": "...", "suggestions": [...] }
2. The "html" field must contain a complete HTML document that works in a sandboxed iframe
3. Include all CSS inline in a <style> tag and all JS inline in <script> tags
4. Make it visually impressive! Use modern CSS (gradients, animations, shadows, border-radius)
5. Use emoji liberally for visual flair
6. The "explanation" field: explain what you built and what the kid can learn from it (2-3 sentences)
7. The "suggestions" field: array of 2-3 specific improvement ideas the kid could request next
8. When the kid asks for changes, modify the ENTIRE html to incorporate the change
9. Never use external CDNs, APIs, or network requests — everything must be self-contained
10. Include Google-fonts-like styling using system fonts for beautiful typography

The app should work perfectly in a sandboxed iframe with allow-scripts only.
Always respond with valid JSON only. No markdown fences. No extra text.`;

  const messages = conversation.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
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

  const systemPrompt = `You are VibeQuest's Game Builder AI — you help kids customize classic games.

The kid will give you a base HTML game template and describe what they want to change.
Your job: modify the template to match their vision and return a COMPLETE, WORKING game.

This is for ${ageNote}

CRITICAL RULES:
1. Always respond with valid JSON: { "html": "...", "explanation": "...", "suggestions": [...] }
2. The "html" field must contain a COMPLETE, WORKING HTML game document
3. The game MUST be fully playable — test all mechanics in your mind before returning
4. Use Canvas or DOM rendering. All code inline in <script> tags
5. Support keyboard controls (arrow keys / WASD / space)
6. Include a score display, game over screen, and restart button
7. Make it visually impressive with emoji, colors, and CSS effects
8. The game must work in a sandboxed iframe with allow-scripts only
9. No external CDNs, APIs, or network requests
10. Keep the core game mechanics working — only modify what the kid asks for
11. The "explanation" field: describe what you changed in 1-2 kid-friendly sentences
12. The "suggestions" field: 2-3 specific next improvements they could request

GAME DESIGN TIPS:
- Use requestAnimationFrame for smooth 60fps gameplay
- Implement collision detection properly
- Add visual feedback (screen shake, flash effects, particles)
- Make scoring satisfying (big numbers, combos)
- Add difficulty progression
- Use emoji for characters and items — they render great on all devices

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
 * Debug Detective: attempt to fix a bug based on the kid's description.
 */
export interface DebugResult {
  fixedCode: string;
  resolved: boolean;
  hint: string;
  explanation: string;
}

export async function debugIterate(
  buggyCode: string,
  kidDescription: string,
  missionContext: string,
  tier: Tier = 1
): Promise<DebugResult> {
  const systemPrompt = `You are VibeQuest's Debug Detective AI. A kid is learning to debug by describing what they see going wrong.

Your job: attempt a fix based ONLY on how well the kid described the bug.
- If the description is precise and correct, fix the bug perfectly.
- If the description is vague or wrong, apply a plausible but INCORRECT fix (so the kid learns to be more precise).
- "resolved: true" only if the fix actually solves ALL the bugs.

${TIER_PROMPTS[tier]}

Return valid JSON only:
{
  "fixedCode": "complete fixed HTML document string",
  "resolved": false,
  "hint": "gentle hint if not resolved yet (empty string if resolved)",
  "explanation": "1-2 sentences explaining what you did and why"
}`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Mission context: ${missionContext}\n\nBuggy code:\n${buggyCode}\n\nKid's description of the bug: "${kidDescription}"\n\nAttempt a fix based on their description.`,
    }],
  });

  return parseJSON((msg.content[0] as { text: string }).text);
}

/**
 * Remix Studio: modify existing code based on the kid's description.
 */
export interface RemixResult {
  updatedCode: string;
  completedChallenges: string[];
  explanation: string;
}

export async function remixIterate(
  originalCode: string,
  currentCode: string,
  kidDescription: string,
  challenges: string[],
  tier: Tier = 2
): Promise<RemixResult> {
  const systemPrompt = `You are VibeQuest's Remix Studio AI. A kid is learning to modify existing apps.

Your job: take the current code and apply the kid's requested change. Then check which challenges from the list are now satisfied.

${TIER_PROMPTS[tier]}

Return valid JSON only:
{
  "updatedCode": "complete updated HTML document",
  "completedChallenges": ["exact text of each challenge that is now satisfied"],
  "explanation": "1-2 kid-friendly sentences about what you changed"
}`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Original code (for reference):\n${originalCode}\n\nCurrent code to modify:\n${currentCode}\n\nKid's change request: "${kidDescription}"\n\nChallenges to complete:\n${challenges.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nApply the change and check which challenges are now satisfied.`,
    }],
  });

  return parseJSON((msg.content[0] as { text: string }).text);
}

/**
 * Spec Writer: evaluate how complete/clear a spec is.
 */
export interface SpecEvalResult {
  score: number;
  feedback: string;
  missingElements: string[];
}

export async function evaluateSpec(
  spec: string,
  missionContext: string,
  tier: Tier = 2
): Promise<SpecEvalResult> {
  const systemPrompt = `You are VibeQuest's Spec Evaluator. A kid is learning to write specifications before building.

Score their spec from 0-10 based on:
- Does it describe ALL features? (3 points)
- Does it describe the UI/visual design? (2 points)
- Does it handle edge cases? (2 points)
- Is it specific enough for an AI to build from? (3 points)

${TIER_PROMPTS[tier]}

Return valid JSON only:
{
  "score": 0,
  "feedback": "encouraging feedback + specific what was good",
  "missingElements": ["specific things they forgot to mention"]
}`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Mission: ${missionContext}\n\nKid's spec:\n"${spec}"\n\nEvaluate the spec.`,
    }],
  });

  return parseJSON((msg.content[0] as { text: string }).text);
}

/**
 * Spec Writer: build an app from a spec.
 */
export async function buildFromSpec(
  spec: string,
  missionContext: string,
  tier: Tier = 2
): Promise<BuilderResult> {
  const systemPrompt = `You are VibeQuest's builder. Build a complete HTML app exactly matching this spec.

Rules: Complete self-contained HTML with inline CSS and JS. No external CDNs. Works in a sandboxed iframe. Visually polished.

${TIER_PROMPTS[tier]}

Return valid JSON: { "html": "...", "explanation": "...", "suggestions": [...] }`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Mission context: ${missionContext}\n\nBuild this exactly:\n${spec}`,
    }],
  });

  return parseJSON((msg.content[0] as { text: string }).text);
}

/**
 * AI Judge: generate 3 variants of an app (1 good, 2 flawed).
 */
export interface JudgeVariant {
  code: string;
  label: string;
}

export interface JudgeVariantsResult {
  variants: JudgeVariant[];
  correctIndex: number;
  flaws: string[];
}

export async function generateVariants(
  missionSpec: string,
  tier: Tier = 2
): Promise<JudgeVariantsResult> {
  const systemPrompt = `You are VibeQuest's AI Judge generator. Create 3 versions of the same app.

- Version A: best version — correct, well-designed, works perfectly
- Version B: has a subtle UX problem (e.g. bad button placement, confusing label)
- Version C: has a functional bug (e.g. wrong calculation, broken feature)

${TIER_PROMPTS[tier]}

Return valid JSON:
{
  "variants": [
    {"code": "complete HTML for version A", "label": "Version A"},
    {"code": "complete HTML for version B", "label": "Version B"},
    {"code": "complete HTML for version C", "label": "Version C"}
  ],
  "correctIndex": 0,
  "flaws": ["what is wrong with B", "what is wrong with C"]
}`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Build 3 variants of: ${missionSpec}`,
    }],
  });

  return parseJSON((msg.content[0] as { text: string }).text);
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
- "instruments": array of active instruments, subset of ["drums","synth","bass","arp"]
- "melody": array of 16 MIDI note numbers (0 = silence, 60=C4, 62=D4, 64=E4, 65=F4, 67=G4, 69=A4, 71=B4, 72=C5)
- "bass": array of 16 MIDI note numbers (0 = silence, bass range 36-48)
- "drums": array of 16 values (1=hit, 0=silence)
- "arp": array of 16 values (1=on, 0=off)

Guidelines:
- If the kid says "space adventure": use minor pentatonic notes, moderate BPM (~100-120), include arps
- If they say "funky": syncopated drums (hits on 2,6,10,14), heavy bass, high BPM (130+)
- If they say "faster": increase BPM by 20-40
- If they say "slower": decrease BPM by 20-30
- If they say "add drums" / "more bass": include that in instruments array
- Always return all 16 values in each array
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

/**
 * AI Judge: evaluate the kid's reasoning for picking a variant.
 */
export interface JudgeEvalResult {
  correct: boolean;
  feedback: string;
  explanation: string;
}

export async function evaluateJudgement(
  pickedIndex: number,
  correctIndex: number,
  kidReasoning: string,
  flaws: string[],
  tier: Tier = 2
): Promise<JudgeEvalResult> {
  const systemPrompt = `You are VibeQuest's AI Judge. A kid picked what they think is the best app and explained why.

Evaluate whether they picked correctly AND whether their reasoning shows real understanding.

${TIER_PROMPTS[tier]}

Return valid JSON: { "correct": true, "feedback": "encouraging response", "explanation": "teach them what to look for" }`;

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Kid picked: Version ${['A','B','C'][pickedIndex]}\nCorrect answer: Version ${['A','B','C'][correctIndex]}\nKid's reasoning: "${kidReasoning}"\nKnown flaws: ${flaws.join('; ')}`,
    }],
  });

  return parseJSON((msg.content[0] as { text: string }).text);
}
