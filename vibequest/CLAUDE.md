# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup
cp .env.example .env   # add ANTHROPIC_API_KEY
npm install

# Run (mobile)
npm start              # Metro bundler
npm run ios
npm run android

# Run (desktop — two terminals)
npm run web            # webpack-dev-server on port 3000
npm run electron:dev   # Electron loads from localhost:3000

# Tests
npm test               # Jest (no test files exist yet)
```

No lint script is configured.

## Architecture

VibeQuest is a story-driven coding education app. Kids describe solutions in plain English; Claude translates them into visual logic blocks and real JavaScript.

**Platforms**: iOS, Android (React Native), Mac/Windows (Electron wrapping React Native Web on port 8081).

### Core data flow

1. `MissionSelectScreen` — shows starter missions filtered by difficulty; tracks unlock state via `progressStore`
2. `MissionScreen` — gameplay loop: kid types plain-English solution → calls `translateToCode()` → renders `LogicBlockView` with result
3. `VictoryScreen` — calls `generateLessonSummary()` to produce celebration content and badge

### AI layer (`src/ai/missionAI.js`)

Three Claude API calls, all using `claude-sonnet-4-6` with structured JSON responses:

- **`translateToCode(userDescription, missionContext, difficulty)`** — core function; returns `{logicBlocks, code, explanation, success, hint}`. Prompts are age-scaled by difficulty (easy = 6yr, medium = 10yr, hard = 14yr).
- **`generateMission(difficulty, completedConcepts)`** — dynamically generates story missions; returns `{title, story, challenge, winCondition, concept, starterHint}`.
- **`generateLessonSummary(concept, attempts, difficulty)`** — post-victory content; returns `{headline, explanation, realWorldExample, badge}`.

### Logic block schema

`logicBlocks` is a recursive tree: `{type, label, children[]}`. `LogicBlockView` renders it with color-coded blocks by type: `if` (red), `else` (orange), `loop` (teal), `action` (blue), `condition` (green).

### State management (`src/utils/progressStore.js`)

Zustand in-memory store (not persisted across sessions). Tracks:
- `completedMissions[]`, `earnedBadges[]`, `unlockedDifficulties[]`
- Unlock logic: medium unlocks after 2 easy completions; hard unlocks after 2 medium completions.

### Mission data (`src/missions/sampleMissions.js`)

Four built-in starter missions work fully offline (no API needed). Dynamic mission generation via `generateMission()` requires the API.
