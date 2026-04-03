# buddy2 — Claude Code Project Instructions

## Project Overview

A Tauri + React/TypeScript desktop app featuring **Biscuit**, a companion mushroom character. The app has a room-based navigation system (Home, Office/Work, Kitchen) with voice input and an animated mushroom buddy.

Tech stack: Tauri, React 18, TypeScript, Vite, Zustand (state), Rive (`@rive-app/react-canvas`) for character animation.

**Critical architecture decision:** The app spawns the `claude` CLI as a subprocess (`tauri-plugin-shell`) and communicates via `--output-format stream-json`. This means:
- No Anthropic API key needed — users authenticate via their existing Claude Code login
- All MCP servers, tools, and session memory the user has in Claude Code work automatically
- Buddy character info (name, species = mushroom) comes from the Claude Code session context
- The setup screen only needs to verify `claude` is installed and authenticated, not collect an API key

---

## Feature Development Workflow

When building a **new feature**, follow this pipeline in order:

### 1. Start: `/office-hours`
Run this **before writing any code**. Challenges your framing, surfaces what you're *actually* building, and generates a design doc. Do not skip for non-trivial features.

### 2. Product direction: `/plan-ceo-review`
After office-hours, run CEO review to find the "10-star" version of the feature. Use **SELECTIVE EXPANSION** mode for most features — keeps current scope but surfaces opportunities to cherry-pick.

### 3. Design: `/design-consultation` or `/plan-design-review`
- **`/design-consultation`** — use for new UI areas or when adding rooms/characters/visual elements (Biscuit visual changes, new room aesthetics, etc.)
- **`/plan-design-review`** — use when you already have a plan and want a senior designer to validate interaction states, empty states, loading states before building

### 4. Technical plan: `/plan-eng-review`
Lock in architecture, data flow, state transitions, and edge cases before touching code. Required gate before implementation.

### 5. Implement with TDD: `/tdd`
Write tests first. Red → Green → Refactor. 80% coverage minimum.

### 6. Review: `/review`
After implementation, run staff-engineer review. Auto-fixes obvious issues, flags completeness gaps.

### 7. QA: `/qa`
Test the app, find bugs, fix with atomic commits, re-verify.

### 8. Ship: `/ship`
Sync, run tests, audit coverage, push, open PR.

---

## Quick Reference: When to Use What

| Situation | Skill |
|-----------|-------|
| Starting any new feature | `/office-hours` |
| Checking if scope is right / finding 10x version | `/plan-ceo-review` |
| New visual element, room, or Biscuit change | `/design-consultation` |
| Reviewing a plan for design completeness | `/plan-design-review` |
| Locking in technical architecture | `/plan-eng-review` |
| One command: CEO + design + eng review | `/autoplan` |
| Writing code | `/tdd` |
| After writing code | `/review` |
| Visual audit of live UI | `/design-review` |
| Debugging a bug | `/investigate` |
| Build errors | `/build-fix` |
| Testing the running app | `/qa` |
| Merging and shipping | `/ship` |
| Security audit | `/cso` |
| Performance baseline | `/benchmark` |
| After shipping: monitor | `/canary` |
| Checking code quality metrics | `/quality-gate` |

---

## Tauri-Specific Notes

- Window configuration in `src-tauri/tauri.conf.json`
- Transparent/frameless window — design must account for no native chrome
- Hot reload via Vite in dev; production builds via `tauri build`

## Biscuit Character Design

- Biscuit is a **mushroom** (not a dragon, not generic)
- Character uses **Rive** (`@rive-app/react-canvas`) — NOT Three.js/React Three Fiber
- Assets are custom Fiverr-designed `.riv` files, placed in `public/rive/`
- Character states (Rive state machine inputs): idle, listening, thinking, speaking, happy, eating, hurt, faint
- Growth stages: baby → teen (500 XP) → adult (2000 XP) — each is a separate Rive artboard
- SVG fallback placeholders are in `src/components/RoomNav/NavIcons.tsx` — use this pattern while Rive files are pending
- Loading outline animation: `src/components/LoadingOutline/LoadingOutline.tsx`

## State Management

- Zustand store at `src/stores/appStore.ts`
- Immutable updates only — always return new objects, never mutate in-place

## Room Navigation

- Rooms: Home, Office (work/voice input), Kitchen
- Nav component: `src/components/RoomNav/`
- Each room is a separate component in `src/components/Rooms/`

---

## Skills — Do NOT Use for This Project

- Backend/server skills (django, springboot, laravel, golang, etc.) — this is a desktop app
- Mobile skills (android-clean-architecture, kotlin-*, compose-multiplatform-*) — wrong platform
- Database skills (postgres-patterns, database-migrations) — no backend DB

## Design System Reference

Run `/design-consultation` to establish `DESIGN.md` before building significant new UI. Once `DESIGN.md` exists, all UI work should reference it.
