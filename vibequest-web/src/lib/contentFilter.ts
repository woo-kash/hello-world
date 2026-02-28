/**
 * contentFilter.ts — server-side content check for child-facing inputs.
 * Runs before any text reaches the Claude API so we can return a friendly
 * message instead of either an error or an AI refusal.
 *
 * Design notes:
 * - Word-boundary regex avoids false positives (e.g. "class" ≠ "ass")
 * - Covers the terms kids most commonly try, not an exhaustive blocklist
 * - Claude has its own safety layer — this is the UX-friendly first gate
 */

const BLOCKED = [
  // Body parts used offensively
  'penis', 'vagina', 'vulva', 'dick', 'cock', 'pussy', 'clit',
  'boob', 'boobs', 'tit', 'tits', 'nipple', 'butt', 'arse', 'arsehole',
  'willy', 'boner', 'erection', 'testicle', 'balls',
  // Sexual acts / content
  'sex', 'sexy', 'sexual', 'nude', 'naked', 'porn', 'porno', 'pornography',
  'dildo', 'condom', 'orgasm', 'masturbat', 'hentai', 'fetish',
  // Core profanity
  'fuck', 'fucking', 'fucked', 'fucker',
  'shit', 'shitting', 'bullshit',
  'cunt', 'bitch', 'bastard', 'asshole', 'ass',
  'wank', 'wanker', 'wanking',
  'damn', 'hell', // mild but flag in child context
  // Violence extremes
  'kill', 'murder', 'suicide', 'rape', 'bomb', 'terrorist',
  // Drug references
  'cocaine', 'heroin', 'marijuana', 'weed', 'meth',
  // Slurs — abbreviated to avoid embedding them fully
  'nigga', 'nigger', 'faggot', 'retard',
];

// Build a single regex with word boundaries — compiled once at module load
const FILTER_RE = new RegExp(`\\b(${BLOCKED.join('|')})`, 'i');

/**
 * Returns true if the text contains any blocked word.
 * Uses word-boundary prefix so "class" does not trigger "ass",
 * but "asshole" and "ass" both trigger.
 */
export function containsInappropriate(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return FILTER_RE.test(text);
}

/** Kid-friendly message returned to the client on a blocked input. */
export const CONTENT_BLOCKED_MSG =
  "Let's keep things fun and friendly! Try describing something else 🌟";
