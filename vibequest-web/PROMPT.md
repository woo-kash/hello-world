# VibeQuest — Full Build Task

You are working on the VibeQuest web app at `/Users/lukasz/hello-world/vibequest-web/`.

On each iteration, check what has already been done (look at the files that exist, git diff, etc.), then implement the next incomplete item. Commit your work after each phase is complete.

When ALL phases below are fully implemented and `npx next build` passes with zero errors, output:
<promise>DONE</promise>

---

## Phase 1 — Skill Framework

Wire the 10 AI-era skills into the app so kids and parents see what is being learned.

- Create `src/lib/skills.ts`
  - Export a `SKILLS` const — array of 10 skill objects, each with: `id` (string slug), `name`, `icon` (emoji), `shortDescription`, `parentExplanation`, `category` (one of: thinking | communication | building | meta)
  - Skills to define:
    - decomposition (thinking) — "Breaking big problems into small pieces"
    - systems-thinking (thinking) — "Understanding how parts connect and affect each other"
    - pattern-recognition (thinking) — "Seeing what repeats and knowing how to reuse it"
    - precision-of-language (communication) — "Saying exactly what you mean so the AI understands"
    - giving-feedback (communication) — "Seeing what is wrong and describing the fix clearly"
    - specification-writing (communication) — "Describing what done looks like before you start"
    - rapid-prototyping (building) — "Building something that works, then making it better"
    - debugging-with-ai (building) — "Finding what broke and describing it so the AI can fix it"
    - remix-and-extend (building) — "Taking something that exists and making it yours"
    - ai-literacy (meta) — "Knowing what AI can and cannot do, and when to question it"
  - Export `getSkillById(id: string)` helper
  - Export `SkillId` type (union of all 10 ids)

- Update `src/lib/missions.ts`
  - Add `primarySkill: SkillId` and `secondarySkill: SkillId` and `xp: number` fields to the Mission type
  - Map all existing missions (all 33) to appropriate skills. Use judgment based on mission type:
    - grid/maze missions: decomposition + precision-of-language, xp 50
    - stars/logic missions: pattern-recognition + systems-thinking, xp 50
    - code missions (tier 2): rapid-prototyping + precision-of-language, xp 100
    - app missions (tier 3): specification-writing + systems-thinking, xp 200
    - builder missions: rapid-prototyping + giving-feedback, xp 200
    - game-builder missions: decomposition + systems-thinking, xp 150

- Update `src/app/api/progress/route.ts`
  - When saving a completed mission, also write `xp_earned` (the mission xp value) and `skill_practiced` (the primarySkill id) to the progress record
  - On GET, return `total_xp` (sum of all xp_earned for the child) and `skills` (object mapping skillId to count of times practiced)

- Update `src/app/(app)/dashboard/page.tsx`
  - Fetch the enriched progress data (total_xp, skills)
  - Add a "Skills" section below the missions grid:
    - Show total XP and level (use thresholds: 0=L1, 100=L2, 250=L3, 500=L4, 1000=L5, 2000=L6... double each time)
    - Show a progress bar or simple list for each of the 10 skills, with count of times practiced
    - Add a "What [childName] is learning" callout showing the top 2-3 most-practiced skills with their parentExplanation text
  - Style consistently with the existing dark purple/blue theme

- Update `src/components/game/VictoryScreen.tsx`
  - Import the mission's primarySkill and look it up from SKILLS
  - Show "You just practiced: [icon] [name]" in the victory card
  - Show "+[xp] XP" earned from this mission

---

## Phase 2 — Debug Detective

New mission type. Debugging is 80% of real vibe coding. Currently 0% taught.

- Create `src/components/game/DebugView.tsx`
  - Full-page layout matching the style of BuilderView (dark theme, header with back link)
  - Left panel:
    - Story/mission description at top
    - "What is broken?" input textarea — kid describes the bug in plain English
    - Submit button ("Find the bug!")
    - AI feedback area: shows whether the fix worked or gives a hint if the description was too vague
  - Right panel:
    - LivePreview showing the current state of the app (starts broken, updates after each attempt)
    - "Bugs remaining" counter (shows 0 when all fixed)
  - Victory triggers when all bugs are resolved (calls progress API, shows VictoryScreen)

- Add `debugIterate(buggyCode: string, kidDescription: string, missionContext: string, tier: number)` to `src/lib/claude.ts`
  - System prompt explains: the kid is describing a bug they see; Claude should attempt a fix based on the description
  - If the description is too vague, the fix should be intentionally wrong and the response should include a hint
  - Returns: `{ fixedCode: string, resolved: boolean, hint: string, explanation: string }`
  - Uses structured JSON response

- Add `debug_check` action to `src/app/api/claude/route.ts`
  - Accepts: `buggyCode`, `kidDescription`, `missionContext`, `tier`
  - Calls `debugIterate()`, returns result
  - Apply same 402 paywall check as other actions

- Add 3 debug missions to `src/lib/missions.ts` (type: `debug`)
  - `tier1-debug-1`: title "Bug Bunny", story about a robot that walks the wrong way, buggyCode is a simple JS function with a flipped condition, primarySkill: debugging-with-ai, xp: 75
  - `tier2-debug-1`: title "Calculator Crash", buggyCode is a calculator that returns NaN for negative inputs (missing Math.abs or parseInt handling), primarySkill: debugging-with-ai, xp: 125
  - `tier3-debug-1`: title "Message Mayhem", buggyCode is a chat app where messages push twice (event listener added twice), primarySkill: debugging-with-ai, xp: 225

  Each debug mission needs a `buggyCode` field (string of self-contained HTML) added to the Mission type.

- Add routing in `src/app/(app)/play/[tier]/[missionId]/page.tsx`:
  - Import DebugView
  - Add `if (mission.type === 'debug') { return <DebugView mission={mission} childId={childId} tier={tier} /> }`

---

## Phase 3 — Remix Studio

New mission type. Taking something that exists and making it yours.

- Create `src/components/game/RemixView.tsx`
  - Full-page layout (dark theme, header)
  - Left panel:
    - Challenge description: "This [app] already works. Your job: [add this feature]"
    - Completed challenges checklist (starts all unchecked)
    - Textarea for describing the change
    - Submit button ("Remix it!")
    - AI feedback after each round
  - Right panel:
    - LivePreview showing the current (remixed) code
    - A small "Original" toggle that shows the starter code preview for comparison
  - Victory when all challenges in the checklist are marked complete by the AI

- Add `remixIterate(originalCode: string, currentCode: string, kidDescription: string, challenges: string[], tier: number)` to `src/lib/claude.ts`
  - Takes the current state of the code + the kid's change description
  - Returns: `{ updatedCode: string, completedChallenges: string[], explanation: string }`
  - Marks which challenges from the list are now satisfied

- Add `remix_iterate` action to `src/app/api/claude/route.ts`

- Add 3 remix missions to `src/lib/missions.ts` (type: `remix`)
  - `tier1-remix-1`: Remix a simple color-changing button app. Challenges: ["Make the button say something funny", "Change the background color when clicked"]
  - `tier2-remix-1`: Remix a basic calculator. Challenges: ["Add a memory button (M+)", "Show calculation history", "Add a clear history button"]
  - `tier3-remix-1`: Remix a simple chatbot. Challenges: ["Make it remember the last 5 messages", "Add a typing indicator", "Let the user clear the chat"]

  Each remix mission needs `starterCode` (self-contained HTML string) and `remixChallenges: string[]` fields on the Mission type.

- Add routing in play page: `if (mission.type === 'remix') { return <RemixView ... /> }`

---

## Phase 4 — Spec Writer

New mission type. Describe what done looks like before building.

- Create `src/components/game/SpecView.tsx`
  - Two phases, shown sequentially:
  - Phase 1 — Write the spec:
    - Prompt: "Before we build anything, describe exactly what the app should do."
    - Guided questions shown as placeholder text or sub-prompts
    - Kid writes their spec in a large textarea
    - Submit → AI scores the spec (0-10) with specific feedback on what is missing
    - Show score with encouraging feedback ("Great start! You forgot to mention...")
    - Kid can refine and resubmit until score >= 8
    - "Build it!" button unlocks at score >= 8
  - Phase 2 — Evaluate the build:
    - AI builds the app from the spec
    - LivePreview shows the result
    - "Does it match your spec?" — kid gives thumbs up/down
    - Victory triggers

- Add `evaluateSpec(spec: string, missionContext: string, tier: number)` to `src/lib/claude.ts`
  - Returns: `{ score: number, feedback: string, missingElements: string[] }`

- Add `buildFromSpec(spec: string, missionContext: string, tier: number)` to `src/lib/claude.ts`
  - Returns: `{ code: string, explanation: string }`

- Add `spec_evaluate` and `spec_build` actions to route

- Add 2 spec missions to `src/lib/missions.ts` (type: `spec`)
  - `tier2-spec-1`: "Spec a Habit Tracker" — build a daily habit tracking app
  - `tier3-spec-1`: "Spec a Messenger" — build a simple messaging interface

- Add routing in play page

---

## Phase 5 — AI Judge

New mission type. Evaluate AI output critically.

- Create `src/components/game/JudgeView.tsx`
  - Shows 3 LivePreviews side by side (labeled A, B, C) — may need to be stacked on mobile
  - Loading state while variants generate
  - Kid clicks to select the best one
  - Textarea: "Why did you pick this one?"
  - Submit → AI evaluates the reasoning
  - Victory if correct pick with reasonable explanation; hint if wrong

- Add `generateVariants(missionSpec: string, tier: number)` to `src/lib/claude.ts`
  - Returns: `{ variants: [{ code: string, label: string }], correctIndex: number, flaws: string[] }`
  - One variant is correct, two have subtle deliberate flaws

- Add `judge_generate` and `judge_evaluate` actions to route

- Add 2 judge missions to `src/lib/missions.ts` (type: `judge`)
  - `tier2-judge-1`: "Pick the Best Todo App" — 3 todo list variants
  - `tier3-judge-1`: "Pick the Best Chat Interface" — 3 chat UI variants

- Add routing in play page

---

## Phase 6 — Engagement Systems

Daily return loop.

- Create `src/lib/xp.ts`
  - `LEVEL_THRESHOLDS`: array of XP values for levels 1-20 (0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000, 22000, 29000, 37000, 46000, 56000, 67000, 79000, 92000, 106000, 121000)
  - `getLevel(xp: number): number` — returns current level (1-20)
  - `getLevelName(level: number): string` — returns level name: "Rookie Builder", "Curious Coder", "App Maker", "Logic Legend", "Vibe Coder", "AI Architect", "Code Wizard", "Debug Master", "System Builder", "AI Pioneer", "Remix King/Queen", "Spec Master", "Pattern Pro", "Prompt Engineer", "Flow State", "Deep Builder", "AI Whisperer", "Future Maker", "Vibe Master", "AI Legend"
  - `getNextLevelXP(level: number): number` — XP needed for next level
  - `getStreakBonus(streakDays: number): number` — returns multiplier: 1.0 (0-1 days), 1.1 (2-4), 1.25 (5-9), 1.5 (10+)
  - `getLevelProgress(xp: number): { current: number, needed: number, percent: number }`

- Update progress API:
  - Add `last_active_date` column tracking to streak computation
  - On POST completion: compute and return updated `streak_days`, `total_xp`, `level`
  - On GET: return streak info alongside existing data

- Add a streak/XP badge to the app header in `src/app/(app)/dashboard/page.tsx`:
  - Show current level name, total XP, and streak (e.g., "Level 4 · 450 XP · 🔥 3 days")

- Create `src/components/game/LevelUpModal.tsx`
  - Celebratory modal that appears when the player levels up
  - Shows new level number, level name, and a fun message
  - Auto-dismisses after 4 seconds or on click

- Update `src/components/game/VictoryScreen.tsx`:
  - After saving progress, check if XP crossed a level threshold
  - If so, show LevelUpModal

- Add "Ship It" button to VictoryScreen:
  - After victory, show a "Ship your creation!" prompt
  - For game-builder missions: saves the final game code
  - For builder/remix missions: saves the final app code
  - POSTs to `/api/gallery` with: `childId`, `title`, `code`, `tier`, `missionId`, `skillId`

- Create `src/app/api/gallery/route.ts`:
  - POST: saves a creation to DB. Fields: id (uuid), child_id, title, code (HTML string), tier, mission_id, skill_id, created_at
  - GET: returns list of public creations (no auth required), paginated, optional filter by tier/skill

- Create `src/app/(app)/gallery/page.tsx`:
  - Grid of cards showing shipped creations
  - Each card: title, creator first name, tier badge, skill badge, "Play" button
  - Clicking "Play" navigates to `/gallery/[id]`
  - Filter bar: All | Tier 1 | Tier 2 | Tier 3

- Create `src/app/(app)/gallery/[id]/page.tsx`:
  - Public shareable page
  - Shows the LivePreview of the creation (fully playable)
  - Shows title, creator, skill practiced
  - "Build your own!" CTA linking to dashboard

---

## Phase 7 — Sandbox Mode

Open-ended creative play.

- Create `src/app/(app)/sandbox/page.tsx`:
  - Header: "Sandbox — Build Anything"
  - Template picker shown first: 4 cards — "Game", "App", "Tool", "Blank"
  - Game → renders GameBuilder component (with a fake sandbox mission object)
  - App/Tool/Blank → renders BuilderView (with a fake sandbox mission)
  - Sandbox missions have no win condition, no XP, no challenge text
  - Auto-save to localStorage every 30 seconds (key: `sandbox-${childId}-${template}`)
  - On load: restore from localStorage if exists

- Add "Open Sandbox" card to the dashboard between the missions section and the skills section

---

## Phase 8 — Landing Page Overhaul

Stop selling "learn to code." Start selling "your child's superpower in the AI era."

Update `src/app/page.tsx` (the landing page / home route):

- Rewrite the hero section:
  - Headline: "Every child will use AI at work. The question is whether they'll direct it — or be directed by it."
  - Sub-headline: "VibeQuest teaches the 10 skills that actually matter in the AI era: how to think clearly, communicate precisely, and build with AI. Starting from age 6."
  - CTA buttons: "Start for free" and "See what kids build"

- Add a "The 10 Skills" section:
  - Grid of 10 skill cards (2x5 or 4+3+3)
  - Each card: emoji icon, skill name, one-line description
  - Group header labels for the 4 categories

- Add a "What kids build" section:
  - 3 columns for Tier 1 / 2 / 3
  - Each shows example outputs (describe them visually with placeholder cards if no screenshots)

- Add a "Why parents choose VibeQuest" section (3 anxiety cards):
  1. "My kid will be left behind" → "By 12 they're building apps. By 16, they're shipping products."
  2. "My kid just consumes AI, not creates with it" → "Every mission ends with something they MADE."
  3. "I can't evaluate tech education" → "Skill dashboard shows exactly what they're learning, in plain English."

- Add a Parent FAQ section:
  - "How is this different from Scratch?"
  - "My child isn't into coding — will they like this?"
  - "How do I know what they're learning?"
  - "Is it safe? What data do you collect?"

---

## Final Step

After all phases are complete, run `npx next build` from `/Users/lukasz/hello-world/vibequest-web/`.

If the build passes with zero errors, output:
<promise>DONE</promise>

If there are TypeScript or build errors, fix them before outputting the promise.
