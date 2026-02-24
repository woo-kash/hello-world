/**
 * VibeQuest AI Engine
 * Translates kids' plain-language descriptions into visual logic blocks + real code.
 * Powered by Claude API.
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const DIFFICULTY_PROMPTS = {
  easy: 'Use very simple language. Max 3 logic blocks. Explain like talking to a 6-year-old.',
  medium: 'Use moderate complexity. Up to 6 logic blocks. Explain like talking to a 10-year-old.',
  hard: 'Can use loops, nested conditions, functions. Explain like talking to a 14-year-old.',
};

/**
 * Translates a plain-language solution into logic blocks and real code.
 * @param {string} userDescription - What the kid typed/said
 * @param {string} missionContext - The story challenge details
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {Promise<{logicBlocks: Array, code: string, explanation: string, success: boolean, hint: string}>}
 */
export async function translateToCode(userDescription, missionContext, difficulty = 'easy') {
  const systemPrompt = `You are VibeQuest AI, a friendly coding guide for kids.
${DIFFICULTY_PROMPTS[difficulty]}

Your job: take the kid's plain-language description and return a JSON response with:
- logicBlocks: array of visual block objects [{type, label, children}]
- code: the real JavaScript code equivalent
- explanation: what logic concept this teaches (e.g. "You just used an IF statement!")
- success: boolean — does this solution actually solve the mission?
- hint: if success is false, give a gentle nudge without giving away the answer

Block types allowed: "if", "else", "loop", "action", "condition"

Always respond with valid JSON only. No markdown. No extra text.`;

  const userPrompt = `Mission: ${missionContext}

Kid's solution: "${userDescription}"

Translate this into logic blocks and code. Evaluate if it solves the mission.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  const raw = message.content[0].text;
  return JSON.parse(raw);
}

/**
 * Generates a new story mission for a given difficulty.
 * @param {'easy'|'medium'|'hard'} difficulty
 * @param {string[]} completedConcepts - concepts the kid already knows
 * @returns {Promise<{title, story, challenge, winCondition, starterHint}>}
 */
export async function generateMission(difficulty, completedConcepts = []) {
  const systemPrompt = `You are VibeQuest mission designer. Create engaging coding missions for kids.
${DIFFICULTY_PROMPTS[difficulty]}

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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: `Generate a ${difficulty} mission.` }],
    system: systemPrompt,
  });

  return JSON.parse(message.content[0].text);
}

/**
 * Generates the post-mission summary: what did the kid learn?
 * @param {string} concept - e.g. "if statements"
 * @param {number} attempts - how many tries it took
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {Promise<{headline, explanation, realWorldExample, badge}>}
 */
export async function generateLessonSummary(concept, attempts, difficulty) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You are VibeQuest's celebration coach. ${DIFFICULTY_PROMPTS[difficulty]}
Return JSON only: { "headline", "explanation", "realWorldExample", "badge" }
badge is one of: "Loop Legend", "Condition Crusher", "Function Finder", "Logic Master", "Code Explorer"`,
    messages: [{
      role: 'user',
      content: `The kid just learned: ${concept}. It took them ${attempts} attempt(s). Celebrate and explain!`
    }],
  });

  return JSON.parse(message.content[0].text);
}
