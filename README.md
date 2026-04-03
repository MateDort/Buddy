# Buddy 🍄

A desktop companion app for Claude Code developers. Buddy lives in a small window on your screen — you can chat with it using your existing Claude Code session (no API key needed), feed it, and watch it grow.

Built with Tauri + React + TypeScript.

## What it does

- **Office room** — chat with Claude Code directly. Type a message or record voice. Supports all Claude Code slash commands (`/help`, `/model`, `/skills`, etc.) with autocomplete — type `/` to see them.
- **Kitchen room** — feed Biscuit to keep its hunger, happiness, and energy up.
- **Settings room** — manage MCP servers and installed skills, each on their own page.
- **Companion character** — Biscuit the mushroom with animated expressions (idle, speaking, eating, laughing, yawning, thinking).

## Requirements

- macOS 12+ (Tauri uses WKWebView — Windows/Linux support is possible but untested)
- [Claude Code](https://claude.ai/code) installed and authenticated:
  ```bash
  npm install -g @anthropic-ai/claude-code
  claude  # follow the login prompt
  ```
- [Rust + Cargo](https://rustup.rs/)
- Node.js 18+

## Getting started

```bash
# 1. Clone
git clone https://github.com/MateDort/Buddy.git
cd Buddy

# 2. Install JS dependencies
npm install

# 3. Run in dev mode
npm run tauri dev
```

The app reads your Claude Code session automatically — no API key setup needed.

## Enable microphone in dev mode

Microphone access requires a signed binary. The production build handles this automatically. For dev mode, after the first build completes:

```bash
npm run setup-mic
# then restart: npm run tauri dev
```

This co-signs the debug binary with the microphone entitlement using an ad-hoc signature. Requires Xcode Command Line Tools (`xcode-select --install`).

## Production build

```bash
npm run tauri build
```

The `.app` bundle has microphone access enabled automatically via `entitlements.plist`. No extra steps needed.

## How it works

Buddy spawns the `claude` CLI as a subprocess with `--output-format text`. It uses your existing Claude Code login — no Anthropic API key required. All MCP servers, tools, and session memory you have in Claude Code work automatically.

## Project structure

```
src/                    React frontend
  components/
    BuddyCharacter/     SVG animated character (Rive-ready when .riv lands)
    OfficeRoom/         Chat UI + voice input + slash command palette
    Rooms/              Kitchen, Home, Settings (with MCP + Skills sub-pages)
    StatsBar/           Draggable top bar with HNG/HAP/NRG stats
src-tauri/              Rust backend
  src/lib.rs            All Tauri commands
  entitlements.plist    macOS entitlements (microphone, JIT)
scripts/
  codesign-dev.sh       Mic fix helper for dev mode
```

## Rive animations

The character uses SVG + CSS keyframes as a placeholder. Rive support is built in — set `RIVE_READY = true` in `BuddyCharacterRive.tsx` and drop your file at `public/rive/biscuit.riv`. The state machine should expose inputs: `idle`, `happy`, `hungry`, `thinking`, `speaking`, `eating`, `yawn`, `laugh`.

## License

MIT
