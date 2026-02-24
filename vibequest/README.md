# VibeQuest

Story-driven coding missions for all ages. Kids describe solutions in plain language → AI translates to visual logic blocks + real code → they learn by doing.

## Stack
- **React Native** (iOS + Android)
- **Electron** (Mac + Windows via React Native Web)
- **Claude API** (AI mission engine)

## Quick Start

```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

npm install

# Mobile
npm start          # Metro bundler
npm run ios        # iOS simulator
npm run android    # Android emulator

# Desktop
npm run electron:dev
```

## How it works

1. Kid picks a mission (easy / medium / hard)
2. Reads the story challenge
3. Types their solution in plain English
4. Claude translates it → visual logic blocks + real code
5. Mission evaluates success/fail
6. Kid iterates until it works
7. Victory screen: "Here's what you just learned!"

## Key files

| File | Purpose |
|------|---------|
| `src/ai/missionAI.js` | Claude API integration — translate, generate, summarize |
| `src/missions/sampleMissions.js` | Built-in starter missions (works offline) |
| `src/components/LogicBlockView.js` | Visual block renderer |
| `src/screens/MissionScreen.js` | Core gameplay loop |
| `src/screens/VictoryScreen.js` | Post-mission celebration |
| `src/utils/progressStore.js` | Adaptive difficulty + progress tracking |
