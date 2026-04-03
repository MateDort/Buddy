# Buddy App — Design System & Fiverr Brief
**Version:** 1.0 — April 2026
**Window:** 300 × 460px, transparent, no decorations, always-on-top floating widget
**Character:** Biscuit the Mushroom (user's actual Claude Code buddy)
**Stack:** Tauri + React + Rive animations

This document is the Fiverr brief AND the developer spec. Every token, every state, every animation input is defined here. Designers get sections 3 and 7. Developers get everything.

---

## 1. Design Philosophy + North Star

### The North Star

**Biscuit feels alive.** Not app-alive — alive like a creature on your desk that breathes, reacts, and has opinions about whether you've been feeding it lately.

This is not a utility widget with a cute mascot. It's a companion first, a dev tool second. The design must serve that hierarchy. If something makes the app feel more like Figma and less like a Tamagotchi, it's wrong.

### Three Design Principles

**1. Warmth over polish**
The color palette is coral and warm darks, not blue-grays and neutrals. Everything tilts slightly amber. The widget should feel like a campfire next to your terminal, not another cold productivity tool.

**2. Creature logic over UI logic**
Layout decisions come from "where would Biscuit be comfortable?" not "where does the standard chat UI put things?" The character is centered and large in Home because that's their space. The chat header in Office shrinks Biscuit to a small avatar because that room belongs to the conversation.

**3. Restraint on text, expressiveness on motion**
The UI copy is minimal — single words, Geist Mono status strings, no verbose labels. All the emotional expression comes from Rive animation. This is why the Fiverr brief matters: every emotional state Biscuit needs to communicate must be in the Rive state machine, not in text.

### What "Duolingo quality" means here

Duolingo's character (the owl) has a full animation library: idle loops, celebrate, encourage, disappointed, hurt. Each state is distinct, readable at a glance, and emotionally honest. Biscuit needs the same. Not the same style — the same investment in the animation library.

---

## 2. Color Token System

### Base Palette

| Token | Hex | Description |
|-------|-----|-------------|
| `--color-primary` | `#d97757` | Coral — Biscuit's accent color, active states, CTA |
| `--color-bg-deep` | `#0d0d0b` | Deepest background (nav bar, window edges) |
| `--color-bg-base` | `#1a1917` | Base room background |
| `--color-bg-surface` | `#262420` | Cards, food cells, message bubbles |
| `--color-bg-surface-alt` | `#2e2c28` | Elevated surface, hover states |
| `--color-text-primary` | `#f5f2ed` | Names, headings, user-typed text |
| `--color-text-secondary` | `#c8c4bc` | Buddy message text, body copy |
| `--color-text-muted` | `#87867f` | Labels, food names, sub-info |
| `--color-text-ghost` | `#4a4845` | Timestamps, XP counters, cooldown text |
| `--color-status-online` | `#2d9e6b` | "● ready" status, online indicator |
| `--color-status-thinking` | `#d97757` | "● thinking…" — reuses primary |
| `--color-record-red` | `#d14f4f` | Recording dot, stop button border |
| `--color-playback-teal` | `#1aa087` | Voice playback progress, send-now CTA |
| `--color-amber-glow` | `#b07b34` | Kitchen room radial glow (center color) |
| `--color-blue-glow` | `#2a4a7f` | Office room radial glow (center color) |

### Glow / Semantic Accent Colors (stat bars)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-hunger` | `#d97757` | Hunger stat bar fill + glow (coral = primary) |
| `--color-happy` | `#e6a020` | Happiness stat bar fill + glow (amber) |
| `--color-energy` | `#2d9e6b` | Energy stat bar fill + glow (green) |

### Alpha Usage Rules

All backgrounds use `rgba()` with intentional opacity. Copy these exactly.

| Context | Value |
|---------|-------|
| Nav active tab background | `rgba(217,119,87, 0.10)` |
| Nav active tab border | `rgba(217,119,87, 0.18)` |
| Nav bar background | `rgba(13,13,11, 0.80)` — frosted |
| Character placeholder background | `rgba(217,119,87, 0.08)` |
| Character placeholder border | `rgba(217,119,87, 0.20)` |
| Office avatar border | `rgba(217,119,87, 0.20)` |
| Room divider lines | `rgba(217,119,87, 0.08)` to `rgba(217,119,87, 0.10)` |
| User message bubble | `rgba(122,60,40, 0.60)` — warm dark red |
| Buddy message bubble | `rgba(38,36,32, 1.00)` = `--color-bg-surface` |
| Typing indicator border | `rgba(217,119,87, 0.28)` — brighter than passive |
| Food card default border | `rgba(217,119,87, 0.12)` |
| Food card fed border | `rgba(45,158,107, 0.25)` |
| Food card fed background | `rgba(45,158,107, 0.12)` |
| Voice waveform bar (idle) | `rgba(74,72,69, 0.60)` |
| Home glow | radial `rgba(217,119,87, 0.08)` at bottom center |
| Kitchen glow | radial `rgba(176,123,52, 0.10)` at bottom center |
| Office glow | radial `rgba(42,74,127, 0.08)` at bottom center |

### Do / Don't

**Do:**
- Use `--color-primary` only for active states, CTAs, and Biscuit's accent. One per screen max.
- Use `--color-text-ghost` for XP counters and cooldowns. This is intentionally dim.
- Let glow colors bleed from the bottom. That's the room identity.
- Use `--color-status-online` only when the API is actually ready.

**Don't:**
- Don't use blue anywhere except the Office room glow. Blue is "thinking/work" not primary.
- Don't use pure white (`#ffffff`). `--color-text-primary` (`#f5f2ed`) is the brightest.
- Don't use opaque fills for nav backgrounds. The glass effect matters.
- Don't add new accent colors without updating this table first.

---

## 3. Typography Scale

### Font Families

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| UI (primary) | DM Sans | system-ui, sans-serif | Labels, buttons, body text, food names |
| Mono / status | Geist Mono | monospace | XP counters, status strings, timestamps, cooldowns |
| Accent | Instrument Serif | Georgia, serif | Reserved for growth-stage callouts, special moments |

Instrument Serif is not yet used in any component. It belongs on "BABY → TEEN" evolution announcements, not in the main UI.

### Scale

| Token | Size | Weight | Font | Letter Spacing | Usage |
|-------|------|--------|------|----------------|-------|
| `--type-room-title` | 12px | 600 | DM Sans | default | "Kitchen", "Office" headings |
| `--type-buddy-name` | 12px | 600 | DM Sans | default | Biscuit name in Office header |
| `--type-body` | 12px | 400 | DM Sans | default | Message bubble text, chat body |
| `--type-label` | 9px | 500 | DM Sans | 0.03em | Food card labels |
| `--type-label-nav` | 9px | 400/600 | DM Sans | 0.04em | Nav labels (400 inactive, 600 active) |
| `--type-status` | 9px | 400 | Geist Mono | 0.06em | "● ready", "● thinking…" |
| `--type-meta` | 9px | 400 | Geist Mono | 0.05em | "fed: fish", "BABY · 0 XP" |
| `--type-ghost` | 8px | 400 | Geist Mono | 0.04em | Cooldown timers, "tap to dismiss" |
| `--type-timer` | 13px | 400 | Geist Mono | default | Recording elapsed time |
| `--type-accent` | variable | 400/700 | Instrument Serif | default | Evolution screen only |

---

## 4. Component Inventory

### 4.1 RoomNav

**File:** `src/components/RoomNav/RoomNav.tsx`

Layout: `flex row`, `justify-content: center`, inside bottom-anchored strip.

| Property | Value |
|----------|-------|
| Height | ~52px total (padding 6px top, 10px bottom + icon + label) |
| Background | `rgba(13,13,11, 0.80)` |
| Border top | `1px solid rgba(217,119,87, 0.10)` |
| Outer padding | `6px 8px 10px` |
| Gap between tabs | `4px` |

**Tab button (inactive):**
| Property | Value |
|----------|-------|
| Flex | 1 (equal thirds) |
| Padding | `7px 4px 5px` |
| Border radius | `10px` |
| Background | `transparent` |
| Border | `1px solid transparent` |
| Icon color | `#4a4845` |
| Label color | `#4a4845` |
| Label weight | 400 |

**Tab button (active):**
| Property | Value |
|----------|-------|
| Background | `rgba(217,119,87, 0.10)` |
| Border | `1px solid rgba(217,119,87, 0.18)` |
| Icon color | `#d97757` |
| Label color | `#d97757` |
| Label weight | 600 |

Transition: `all 0.18s` on both button and icon color.

Icon size: 22 × 22px SVG. Will become Rive when assets are delivered.

### 4.2 NavIcons (SVG — transitional)

**File:** `src/components/RoomNav/NavIcons.tsx`

Three icons, each `22 × 22px`, stroke-based, with subtle fill on active.

**HomeIcon:**
- Stroke width: 1.6 (roof), 1.4 (door)
- Active fill (roof): `rgba(217,119,87, 0.15)`
- Active fill (door): `rgba(217,119,87, 0.30)`

**KitchenIcon:**
- Fork + knife silhouette
- Stroke width: 1.6 (main paths), 1.4 (tines)
- Active fill (knife region): `rgba(217,119,87, 0.15)`

**OfficeIcon:**
- Laptop: open lid when active, closed when inactive
- Keyboard dots appear only when active
- Stroke width: 1.5
- Active fill (base): `rgba(217,119,87, 0.15)`
- Active fill (screen): `rgba(217,119,87, 0.08)`

All icons: transition `all 0.2s` on color and fill.

### 4.3 BuddyPlaceholder (transitional)

**File:** `src/components/Rooms/HomeRoom.tsx`

This is replaced by the Rive character. Spec here is for the placeholder only.

| Property | Value |
|----------|-------|
| Size | 120 × 120px |
| Shape | `border-radius: 50%` (circle) |
| Background | `rgba(217,119,87, 0.08)` |
| Border | `1px solid rgba(217,119,87, 0.20)` |
| Emoji size | 64px |

**Once Rive is integrated:** The Rive canvas replaces this entirely. Size becomes 160 × 160px to give the character more room. The circle background is removed — Rive renders on transparent.

### 4.4 ChatBubble (HomeRoom)

Dismissable speech bubble that appears above the character.

| Property | Value |
|----------|-------|
| Background | `rgba(38,36,32, 1)` = `--color-bg-surface` |
| Border | `1px solid rgba(217,119,87, 0.18)` |
| Border radius | `12px`, `border-bottom-left-radius: 2px` (tail direction) |
| Padding | `10px 13px` |
| Font size | 12px |
| Text color | `#c8c4bc` |
| Line height | 1.55 |
| Max width | 220px |
| Shadow | `0 4px 16px rgba(0,0,0, 0.30)` |
| Dismiss hint | 9px Geist Mono, `rgba(135,134,127, 0.50)` |

### 4.5 HomeRoom Layout

**File:** `src/components/Rooms/HomeRoom.tsx`

```
[window top]
  [AppHeader — title strip with stats bars] ← not yet built
  ─────────────────────────────────
  [room content — flex column, center-aligned, gap 20px, padding 20px 16px]
    [buddy name + status]    ← 11px Geist Mono, #87867f
    [chat bubble]             ← appears above character
    [BuddyPlaceholder / Rive] ← 120px circle → 160px Rive
    [stage · XP badge]        ← 9px Geist Mono, #4a4845
  ─────────────────────────────────
  [RoomNav]
[window bottom]
```

Character is vertically centered in the available room content height (~360px minus header and nav).

Room glow: `radial-gradient(ellipse 200px 120px at 50% 100%, rgba(217,119,87, 0.08), transparent)` on the room content div background.

### 4.6 KitchenRoom Layout

**File:** `src/components/Rooms/KitchenRoom.tsx`

```
[room content — flex column, padding 14px 12px, gap 12px]
  [kitchen header — icon + "Kitchen" + status line]
  ─── 1px border rgba(217,119,87, 0.08) ───
  [food grid — 3 columns, gap 8px]
    [FoodCard × 6]
  [footer — "coding activity = most XP"]
```

Room glow: `radial-gradient(ellipse 200px 120px at 50% 100%, rgba(176,123,52, 0.10), transparent)`.

### 4.7 FoodCard

| Property | Value |
|----------|-------|
| Layout | flex column, center-aligned, gap 5px |
| Padding | `10px 6px 8px` |
| Border radius | `12px` |
| Background (default) | `rgba(38,36,32, 1)` = `--color-bg-surface` |
| Border (default) | `1px solid rgba(217,119,87, 0.12)` |
| Background (fed) | `rgba(45,158,107, 0.12)` |
| Border (fed) | `1px solid rgba(45,158,107, 0.25)` |
| Disabled opacity | 0.5 |
| Disabled cursor | not-allowed |
| Food icon size | 28px (emoji fallback → 40 × 40px Rive) |
| Label | 9px DM Sans 500, `#87867f` |
| Cooldown timer | 8px Geist Mono, `#4a4845` |
| Transition | `all 0.20s` |

### 4.8 OfficeRoom Layout

**File:** `src/components/OfficeRoom/OfficeRoom.tsx`

```
[room content — flex column, full height]
  [office header strip — 10px 14px padding]
    [36px Rive avatar] [buddy name + status]
  ─── 1px border rgba(217,119,87, 0.10) ───
  [messages scroll area — flex 1, padding 12px 12px 4px, no scrollbar]
    [message bubbles]
    [streaming text with blink cursor]
  [VoiceInput — docked to bottom]
```

Room glow: `radial-gradient(ellipse 200px 120px at 50% 100%, rgba(42,74,127, 0.08), transparent)`.

### 4.9 Office Avatar Strip

| Property | Value |
|----------|-------|
| Height (approx) | 56px |
| Background | `rgba(13,13,11, 0.40)` |
| Border bottom | `1px solid rgba(217,119,87, 0.10)` |
| Avatar size | 36 × 36px |
| Avatar border radius | `10px` |
| Avatar background | `rgba(217,119,87, 0.08)` |
| Avatar border | `1px solid rgba(217,119,87, 0.20)` |
| Buddy name | 12px DM Sans 600, `#f5f2ed` |
| Status text | 9px Geist Mono, `#2d9e6b` ready / `#d97757` thinking |

### 4.10 Message Bubbles

**Buddy message:**
| Property | Value |
|----------|-------|
| Background | `rgba(38,36,32, 1)` |
| Border | `1px solid rgba(217,119,87, 0.12)` |
| Border radius | `10px`, `border-bottom-left-radius: 3px` |
| Text color | `#c8c4bc` |
| Font | 12px DM Sans, line-height 1.5 |
| Max width | 88% of scroll area |
| Padding | `7px 10px` |

**User message:**
| Property | Value |
|----------|-------|
| Background | `rgba(122,60,40, 0.60)` |
| Border | none |
| Border radius | `10px`, `border-bottom-right-radius: 3px` |
| Text color | `#e89070` |
| Font | 12px DM Sans, line-height 1.5 |
| Alignment | `align-self: flex-end` |
| Padding | `7px 10px` |

**Streaming cursor:**
```
width: 2px, height: 12px
background: #d97757
margin-left: 2px
animation: buddy-blink 0.8s ease-in-out infinite
0%,100% → opacity 1 | 50% → opacity 0
```

**Typing indicator (ellipsis):**
Same style as buddy message but `font-style: italic`, `opacity: 0.5`.

### 4.11 VoiceInput — 4 States

**File:** `src/components/OfficeRoom/VoiceInput.tsx`

Container: `background: #1a1917`, `border-top: 1px solid rgba(217,119,87, 0.12)`.

**State 1: Idle**
Two equal buttons side-by-side, gap 8px, padding 10px.
| Property | Value |
|----------|-------|
| Button background | `#262420` |
| Button border | `1px solid rgba(217,119,87, 0.18)` |
| Button text color | `#c8c4bc` |
| Font | 12px DM Sans 500 |
| Border radius | `9px` |
| Padding | `9px 0` |

**State 2: Typing**
Back button (←) + textarea + send button (↑), padding `8px 10px`, gap 8px.
| Property | Value |
|----------|-------|
| Back button size | 32 × 32px, border-radius 8px |
| Back button bg | `#262420`, border `rgba(217,119,87, 0.18)` |
| Textarea bg | `#262420` |
| Textarea border | `1px solid rgba(217,119,87, 0.28)` |
| Textarea border-radius | `9px` |
| Textarea padding | `8px 10px` |
| Textarea color | `#f5f2ed` |
| Textarea font | 12px DM Sans |
| Send button (active) | bg `#d97757`, `box-shadow: 0 0 8px rgba(217,119,87, 0.35)` |
| Send button (empty) | bg `#262420`, no shadow |

**State 3: Recording**
Padding `10px 12px`, gap 8px, flex column.
| Property | Value |
|----------|-------|
| Red dot | 8 × 8px circle, bg `#d14f4f`, `box-shadow: 0 0 6px #d14f4f`, blinking animation |
| Timer | 13px Geist Mono, `#f5f2ed` |
| Waveform | flex 1 × 36px height, coral bars with alpha gradient (0.4 → 1.0 left to right) |
| Discard button | 36px circle, border `1.5px solid rgba(74,72,69, 0.60)`, color `#4a4845` |
| Stop button | 36px circle, border `2px solid #d14f4f`, color `#d14f4f` |
| Send-now button | 36px circle, bg `#1aa087`, `box-shadow: 0 0 10px rgba(26,160,135, 0.40)` |

**State 4: Recorded (review)**
Padding `10px 12px`, gap 8px, flex column.
| Property | Value |
|----------|-------|
| Play button | 28 × 28px circle, bg `#1aa087`, `box-shadow: 0 0 8px rgba(26,160,135, 0.35)` |
| Waveform | flex 1 × 32px, played bars `#1aa087`, unplayed `rgba(74,72,69, 0.60)` |
| Duration | 11px Geist Mono, `#87867f` |
| Discard button | 36px circle, same as recording state |
| Send button | 36px circle, bg `#d97757`, `box-shadow: 0 0 10px rgba(217,119,87, 0.40)` |

### 4.12 AppHeader (not yet built — spec for build)

The title strip at the top showing stats bars. Sits above the room content, below the window drag region.

```
[header strip — height 44px, padding 8px 12px]
  [buddy name — left]   [3 stat bars — right]
```

| Property | Value |
|----------|-------|
| Height | 44px |
| Background | `rgba(13,13,11, 0.60)` |
| Border bottom | `1px solid rgba(217,119,87, 0.08)` |
| Buddy name | 11px Geist Mono, `#87867f`, letter-spacing 0.08em |

**Stat bars:**
```
width: 64px each, height: 3px, border-radius: 2px
background track: rgba(74,72,69, 0.40)
```

| Stat | Fill color | Glow |
|------|-----------|------|
| Hunger | `#d97757` | `box-shadow: 0 0 4px rgba(217,119,87, 0.60)` |
| Happy | `#e6a020` | `box-shadow: 0 0 4px rgba(230,160,32, 0.60)` |
| Energy | `#2d9e6b` | `box-shadow: 0 0 4px rgba(45,158,107, 0.60)` |

All three bars side by side, gap 8px. Small label dots optional (1px colored dot above each bar).

### 4.13 Scanline Texture Overlay

Apply to all room content divs as a pseudo-element or fixed-position child. Not a background-image — a CSS generated pattern.

```css
background-image: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0,0,0,0.03) 2px,
  rgba(0,0,0,0.03) 3px
);
pointer-events: none;
position: absolute;
inset: 0;
z-index: 10;
```

Opacity: 0.4. Should be barely visible — adds depth, not distraction.

---

## 5. Room Design Specs

### 5.1 Home Room

**Mood:** Warm, personal, Biscuit's living room.

**Background construction:**
```
base: #1a1917 (full room)
+ radial-gradient(ellipse 200px 120px at 50% 100%, rgba(217,119,87, 0.08), transparent)
+ scanline overlay (z-index 10)
```

**Character placement:**
- Center of room content div, `align-items: center`
- Rive canvas: 160 × 160px
- Rive renders on transparent — no background circle needed
- Character sits at roughly 55% from top of room content area
- Speech bubble appears above character, offset left (tail on bottom-left)

**Status indicator** (top of room, above bubble):
- `{name} · ● ready` — 11px Geist Mono, `#87867f`
- Green dot `#2d9e6b` when API ready, coral `#d97757` when thinking

**Stage/XP badge** (below character):
- `BABY · 0 XP` — 9px Geist Mono, `#4a4845`, letter-spacing 0.06em
- Changes to `TEEN · 500 XP` at growth stage

### 5.2 Kitchen Room

**Mood:** Warm amber, food-focused, slightly cozy.

**Background construction:**
```
base: #1a1917
+ radial-gradient(ellipse 200px 120px at 50% 100%, rgba(176,123,52, 0.10), transparent)
+ scanline overlay
```

**Layout:** Header strip + 3×2 food grid. Grid fills remaining height with `align-content: start` — cards don't stretch to fill.

**Food grid:** 3 columns, gap 8px. Each card is equal width (auto from grid) × natural height.

**Empty state:** When all foods are on cooldown, footer text changes from `coding activity = most XP` to `all fed · next food ready soon` in `#87867f`.

### 5.3 Office Room

**Mood:** Cool blue hint, focused, chat-forward.

**Background construction:**
```
base: #1a1917
+ radial-gradient(ellipse 200px 120px at 50% 100%, rgba(42,74,127, 0.08), transparent)
+ scanline overlay
```

**Message area:** No visible scrollbar. `scrollbar-width: none` (Firefox) + `::-webkit-scrollbar { display: none }` (Chrome/Safari). Auto-scrolls to bottom on new messages.

**Avatar strip:** Biscuit appears as a 36 × 36px Rive animation (idle loop) in the header strip when in Office room. This is a second, smaller instance of the character Rive file — same state machine, but always stays in `idle` regardless of actual buddy state (the header avatar doesn't show hurt/hungry states).

---

## 6. Animation + Motion Language

### Motion Timing Reference

| Use | Duration | Easing |
|-----|----------|--------|
| Tab switch (icon color, bg) | 180ms | `ease` |
| Button state change | 150–200ms | `ease` |
| Food card fed state | 200ms | `ease` |
| Streaming cursor blink | 800ms | `ease-in-out infinite` |
| Recording dot blink | 1000ms | `ease-in-out infinite` |
| Message appearance | instant (no animation yet — future) |
| Speech bubble appear | instant (future: slide-up 200ms) |

### Rive State Machine Spec — Character (Biscuit the Mushroom)

This is the spec the Fiverr animator builds to.

**State machine name:** `BuddyStateMachine`

**Inputs (all Boolean unless noted):**
| Input | Type | Trigger |
|-------|------|---------|
| `isHungry` | Boolean | Hunger stat ≤ 20% |
| `isHappy` | Boolean | Happy stat ≥ 80% (override idle with happy anim) |
| `isSad` | Boolean | Happy stat ≤ 20% |
| `isThinking` | Boolean | Claude API streaming in progress |
| `isEating` | Boolean | One-shot when food is given (plays eat anim then returns) |
| `levelUp` | Trigger | One-shot on stage advancement |
| `poked` | Trigger | On tap/click of character |
| `attackHit` | Trigger | MVP2: one-shot attack animation |
| `tookDamage` | Trigger | MVP2: one-shot hurt animation |
| `fainted` | Boolean | MVP2: HP reaches 0 |
| `stage` | Number | 0=baby, 1=teen, 2=adult (drives which art layer is shown) |

**States in the machine:**
1. `idle` — looping gentle breathing, small cap bob
2. `idle_happy` — extra bounce, sparkle particles from cap
3. `idle_hungry` — slower, droopy, occasionally looks at empty bowl
4. `idle_sad` — slumped, minimal movement
5. `thinking` — gentle glow pulse, maybe spinning question mark above cap
6. `eat` — one-shot: reaches for food, bite animation, return to idle
7. `level_up` — one-shot: grows visibly, light burst, screen flash (developer celebrates this)
8. `poke_react` — one-shot: surprised jump, then returns to previous state
9. `attack` — MVP2 only: wind-up + strike forward
10. `hurt` — MVP2 only: recoil, flash red, recovery
11. `faint` — MVP2 only: slow fall, stays down

**Transitions:**
- Any → `thinking` when `isThinking = true`; back to previous on `isThinking = false`
- `idle` priority: sad > hungry > happy > default idle
- `eat`, `level_up`, `poke_react` are one-shots: trigger → play full → return to current idle variant
- `stage` input changes which art layer (baby/teen/adult skin) is visible — not a state transition, just a layer switch

**Artboard size:** 300 × 300px (rendered at 160 × 160px in app, 36 × 36px in office header)

**Growth stages (artboard layers):**
- `baby`: small cap, large eyes relative to body, round proportions
- `teen`: taller stalk, more confident pose
- `adult`: full height, more detail on cap, accessories possible in future

### Rive State Machine Spec — Food Items

**One .riv file per food item.** Each has a single state machine: `FoodStateMachine`.

**Inputs:**
| Input | Type |
|-------|------|
| `isOnCooldown` | Boolean |
| `hover` | Boolean |
| `feed` | Trigger |

**States:**
1. `idle` — gentle float or shimmer
2. `hover` — slight scale up, glow brightens
3. `feed` — one-shot: flies toward character (exits artboard top), then fades out
4. `cooldown` — desaturated, dimmed, small timer tick animation

**Artboard size:** 80 × 80px (rendered at 40 × 40px in food card)

### Rive State Machine Spec — Nav Icons

**One .riv file per icon** (Home, Kitchen, Office). State machine: `NavIconStateMachine`.

**Inputs:**
| Input | Type |
|-------|------|
| `active` | Boolean |

**States:**
1. `inactive` — dim stroke, `#4a4845`
2. `active` — coral stroke `#d97757`, subtle fill, small bounce on transition in

**Transition from inactive → active:** 180ms, icon bounces (scale 1.0 → 1.15 → 1.0), color cross-fades.
**Transition from active → inactive:** 120ms, instant color, no bounce.

**Artboard size:** 44 × 44px (rendered at 22 × 22px)

---

## 7. Fiverr Briefs

### Brief A — Mushroom Character (Biscuit)

**Title:** Rive animation — Cute mushroom character (desktop pet, multiple states)

**Description:**

I need a Rive (.riv) file for a mushroom character named Biscuit — the main character of a developer desktop pet app. The character must work as a Rive state machine with specific animated states.

**Style reference:**
- Duolingo (the owl) for quality of expression and motion
- Hollow Knight or Ori for the warm, cute creature aesthetic
- NOT pixel art. Clean vector illustration with smooth animation.
- Color palette: warm tones — mushroom cap in earthy red/brown, cream body, the primary accent color of the app is coral `#d97757`. Design the character to feel at home against dark backgrounds (`#1a1917`, `#0d0d0b`).

**Character design:**
- Mushroom species. Classic round cap (not a stem-heavy mushroom). Big expressive eyes in the body. Small stubby arms.
- Three growth stages: **baby** (small, extra-round, large eyes), **teen** (taller, more confident), **adult** (fully grown, more detailed cap, small mushroom friends around it maybe).
- Each stage on a separate artboard layer — not separate files. The stage is controlled by a `stage` input (0/1/2) that switches which layer is visible.

**Artboard size:** 300 × 300px, transparent background.

**State machine name:** `BuddyStateMachine`

**Required states and animations (all looping unless noted as one-shot):**

| State | Description |
|-------|-------------|
| `idle` | Gentle breathing. Cap bobs very slightly. Maybe 1–2 eye blinks per 4-second loop. |
| `idle_happy` | More bounce, small sparkle or star particles from cap. Energy is up. |
| `idle_hungry` | Slower movement. Arms droop slightly. Eyes slightly downcast. Occasionally glances toward where a bowl might be. |
| `idle_sad` | Minimal movement. Slumped. Eyes look down. |
| `thinking` | Gentle glow pulse around body. Maybe a small floating question mark or thought bubble above cap. |
| `eat` | ONE-SHOT: Reaches forward, takes a bite of something (food enters from outside frame), happy chewing motion, returns to idle. |
| `level_up` | ONE-SHOT: Character visibly grows a bit, flash of light, celebratory arm wiggle. |
| `poke_react` | ONE-SHOT: Surprised jump or wobble when tapped, then returns to previous state. |
| `attack` | ONE-SHOT: Wind-up, then strikes forward (MVP2/arena use). |
| `hurt` | ONE-SHOT: Recoils backward, brief red flash on body, recovers. |
| `faint` | Looping: slow fall, stays lying down. |

**State machine inputs:**
- `isHungry` (Boolean)
- `isHappy` (Boolean)
- `isSad` (Boolean)
- `isThinking` (Boolean)
- `isEating` (Boolean)
- `levelUp` (Trigger)
- `poked` (Trigger)
- `attackHit` (Trigger)
- `tookDamage` (Trigger)
- `fainted` (Boolean)
- `stage` (Number, values 0/1/2)

**Deliverable:** One `.riv` file with the full state machine. Please also share a Rive editor preview link so I can review animations before export.

**References:** Duolingo owl expressions. Hollow Knight charm/vessel proportions (round body, small limbs, big eyes). Kirby if you want a game reference for the "cute + expressive" target.

---

### Brief B — Food Items (6 items)

**Title:** Rive animations — 6 food items for desktop pet app (cute, vector, animated)

**Description:**

I need 6 Rive (.riv) food item animations for a developer desktop pet app. Each food item is in a separate .riv file. Same visual style as each other and consistent with a cute, warm mushroom character (Brief A).

**Style:** Cute, simplified food icons — not photorealistic, not flat-icon-pack. Think Stardew Valley inventory items or Animal Crossing items. Warm, inviting, slightly bouncy. Dark background (`#1a1917`).

**Items needed (one .riv file each):**

| File | Item | Notes |
|------|------|-------|
| `food-fish.riv` | Small fish | Cute, simple. Could have a little sparkle. |
| `food-steak.riv` | Steak/meat | Sizzling steam lines. Premium energy. |
| `food-apple.riv` | Apple | Classic round apple, leaf on top. |
| `food-cookie.riv` | Cookie | Round cookie with chocolate chips. |
| `food-potion.riv` | Magic potion | Small vial/bottle, glowing liquid. Purple or blue. |
| `food-code.riv` | Keyboard / coding | Mini keyboard or code bracket `{}` — represents coding XP. |

**Artboard size per file:** 80 × 80px, transparent background.

**State machine per file: `FoodStateMachine`**

Inputs:
- `isOnCooldown` (Boolean)
- `hover` (Boolean)
- `feed` (Trigger)

States:
1. `idle` — gentle float or shimmer, the item looks appetizing and alive
2. `hover` — slight scale up (maybe 10%), glow or brightness increase
3. `feed` — ONE-SHOT: item flies upward off the top of the artboard, brief trail, then fade out
4. `cooldown` — desaturated and slightly dimmed, small pulsing "wait" indicator (not a text timer — just a visual dimness)

**Deliverable:** Six separate `.riv` files, all with consistent style. Please share a Rive editor preview link for review before final export.

---

### Brief C — Nav Icons (3 icons)

**Title:** Rive animations — 3 animated nav tab icons (dark UI, minimal, state-aware)

**Description:**

I need 3 Rive (.riv) animated navigation tab icons for a dark-theme desktop pet app. These replace SVG icons. The icons need to feel like a premium app tab bar — subtle, sharp, minimal. Not cutesy (the character is cutesy, these are UI elements).

**Style:**
- Clean, thin-stroke icons (stroke weight ~2px at 44×44px artboard)
- Inspired by Duolingo's bottom navigation or Linear's sidebar icons
- When inactive: stroke color `#4a4845` (very dim warm gray)
- When active: stroke color `#d97757` (coral), with subtle fill hints
- Background: always transparent (the nav bar behind them is dark)

**Icons needed (one .riv file each):**

| File | Icon | Description |
|------|------|-------------|
| `nav-home.riv` | House / home | Classic house silhouette with roof and door. On active: roof fill appears. |
| `nav-kitchen.riv` | Fork + knife | Utensils crossed or side-by-side. Classic dining icon. |
| `nav-office.riv` | Laptop | Laptop with screen. On active: screen is "open" further, keyboard dots appear. |

**Artboard size per file:** 44 × 44px, transparent background.

**State machine per file: `NavIconStateMachine`**

Input:
- `active` (Boolean)

States:
1. `inactive` — dim stroke, no fill, static (or very subtle idle float, max 3px movement)
2. `active` — coral stroke `#d97757`, fill hints appear, small bounce on transition in (scale 1.0 → 1.15 → 1.0 over 180ms)

Transition inactive → active: 180ms, icon bounces in, color cross-fades.
Transition active → inactive: 120ms, instant color change, no bounce.

**Deliverable:** Three separate `.riv` files. Please also share Rive editor preview links.

---

## 8. Complete Asset Checklist

Every .riv file the app needs. This is the complete order list for Fiverr.

### Character

| File | Size | States | Status |
|------|------|--------|--------|
| `buddy-mushroom.riv` | 300×300px | Full state machine per Brief A | Not ordered |

### Food Items

| File | Size | Status |
|------|------|--------|
| `food-fish.riv` | 80×80px | Not ordered |
| `food-steak.riv` | 80×80px | Not ordered |
| `food-apple.riv` | 80×80px | Not ordered |
| `food-cookie.riv` | 80×80px | Not ordered |
| `food-potion.riv` | 80×80px | Not ordered |
| `food-code.riv` | 80×80px | Not ordered |

### Nav Icons

| File | Size | Status |
|------|------|--------|
| `nav-home.riv` | 44×44px | Not ordered |
| `nav-kitchen.riv` | 44×44px | Not ordered |
| `nav-office.riv` | 44×44px | Not ordered |

### MVP2 Arena (order after MVP1 ships)

| File | Size | Notes |
|------|------|-------|
| `arena-floor.riv` | 300×200px | Animated arena floor/background |
| `arena-vs-badge.riv` | 120×80px | "VS" intro badge |
| `stat-bar-hp.riv` | 200×16px | HP bar with damage flash |

**Total MVP1 asset order: 10 files across 3 Fiverr sellers (or 1 if they can do all).**

### Loading Sequence (no Rive file needed — CSS/SVG animation)

Based on the pattern in `~/buddy/src/renderer/components/BuddyCharacter3D/LoadingOutline.tsx`:
1. SVG outline of mushroom character draws in (stroke-dashoffset animation, ~600ms)
2. Bottom-to-top fill sweeps up (clip-path or gradient fill, ~400ms)
3. Crossfade to Rive canvas (opacity transition, ~200ms)

Implement as a CSS animation using an SVG outline of the mushroom shape. The Fiverr designer should provide the base SVG outline path for the character alongside the .riv file.

---

## 9. MVP2 Arena Room Design Spec

### Tab Structure

Add "Arena" as a 4th tab in MVP2. Nav becomes 4 equally-spaced tabs. Icon: `nav-arena.riv` — a stylized sword or shield.

Nav adjusts: tabs compress slightly. Labels stay at 9px. The coral active treatment is identical to the 3-tab system.

### Arena Room Layout

```
[arena room — full height, flex column]
  [arena header — "Arena" + buddy HP bar + opponent HP bar]
  [battle field — flex 1]
    [opponent buddy — top half, centered, Rive rendered]
    [VS or action log in middle]
    [your buddy — bottom half, centered, smaller]
  [action bar — 3 buttons: Attack / Defend / Special]
```

**No-opponent state (lobby):**
```
[arena room]
  [your buddy — centered, larger]
  [share code box — shows buddy QR / code string]
  [import opponent button]
  [stats display — HP / Attack / Defense / Speed]
```

### Arena Background

**Mood:** Electric, high-contrast, Pokemon-stadium energy. Breaks from the warm ambient rooms.

```
base: #0d0d0b
+ horizontal ground line at 60% height (1px, rgba(255,255,255,0.08))
+ radial glow at opponent position: rgba(217,119,87, 0.06) at top
+ radial glow at player position: rgba(45,158,107, 0.06) at bottom
+ scanline overlay (same pattern, slightly stronger: 0.06 opacity)
```

No warm amber or blue glow. The arena is its own environment — darker, harder.

### HP Bars

Two HP bars, one per buddy. Stack horizontally across full width, 8px height (larger than the stat bars in the header strip). Track background `rgba(255,255,255,0.08)`.

| Buddy | Bar fill | Position |
|-------|---------|----------|
| Opponent | `#d97757` (coral — "enemy") | Top, below opponent name |
| Yours | `#2d9e6b` (green — "yours") | Top section, right-aligned |

HP damage is animated: bar shrinks left-to-right over 400ms ease-out. Flash white on hit.

### Action Buttons

Three equal-width buttons in the bottom bar. Matching the food card aesthetic but more assertive.

| Action | Icon/Label | Active Color |
|--------|-----------|--------------|
| Attack | Sword icon | `#d97757` coral |
| Defend | Shield icon | `#4a6eb5` blue |
| Special | Star icon | `#e6a020` amber |

Special is greyed out at Baby stage, amber at Teen, full gold glow at Adult.

### Battle Log

Between the two buddies, a small scrolling text strip (3 lines max):
```
9px Geist Mono, #87867f
"Biscuit attacks for 42 dmg"
"Opponent defends — 18 absorbed"
```

### Stat Display (lobby / pre-fight)

Four stats in a 2×2 grid:
| Stat | Value display | Color |
|------|--------------|-------|
| HP | number | `#d97757` |
| ATK | number | `#e6a020` |
| DEF | number | `#4a6eb5` |
| SPD | number | `#2d9e6b` |

9px Geist Mono labels, 16px DM Sans 600 values.

### Share Code UI

A full-width box with:
- QR code (128×128px, white on dark, centered)
- Below: `{buddy-code-string}` in 10px Geist Mono, `#87867f`
- Copy button: 28px icon button with clipboard icon

---

## 10. Design Debt + Open Questions

### Design Debt (things that exist but need fixing)

**D1: Emoji in production code (HIGH)**
`HomeRoom.tsx` uses emoji glyphs (`🐉`, `🐱`, `🦊`) in BuddyPlaceholder, and `KitchenRoom.tsx` uses emoji for food items. These are transition placeholders and must be replaced before public release. The lock constraint says "NO emojis anywhere."

Action: Replace when Rive files arrive. The `.riv` integration TODOs are already commented in the code.

**D2: Hardcoded "Biscuit" + dragon emoji in OfficeRoom (HIGH)**
`OfficeRoom.tsx` line 91 has hardcoded `🐉` and line 91 has hardcoded `"Biscuit"`. Should read from `useAppStore`.

Action: Wire to `useAppStore((s) => s.buddy)` — same pattern HomeRoom already uses.

**D3: No AppHeader component (MEDIUM)**
The stat bars (hunger/happy/energy) are specced but not built. The title strip is missing. Currently the rooms have no top boundary.

Action: Build `AppHeader.tsx` per section 4.12.

**D4: Scanline overlay not implemented (LOW)**
The scanline texture is specced but not applied to any room. It's a one-line CSS addition.

Action: Add to room wrapper in `App.tsx` or as a shared `RoomOverlay` component.

**D5: No room background radial glows (LOW)**
The three rooms all share `#1a1917` background with no radial glow differentiation. The glows are specced but not applied.

Action: Add background style to each room's outermost div per section 5.1–5.3.

**D6: Voice recording uses emoji icons (LOW)**
`VoiceInput.tsx` uses `🗑`, `⏸`, `▶`, `🎙` as button content. These should be SVG icons.

Action: Replace with inline SVGs matching the NavIcons style. These are small, easy to add now.

**D7: Loading sequence not implemented (MEDIUM)**
The outline draw-in → fill → Rive reveal sequence is specced (section 8) but not built. Currently the character just appears.

Action: Build as a CSS/SVG animation component. Can do before Rive files arrive using the placeholder.

### Open Questions

**Q1: Kitchen header emoji**
`KitchenRoom.tsx` line 106 uses `🍳` as the kitchen header icon. Should this be a small Rive animation (a separate `kitchen-header.riv`), or is a custom SVG cooking icon sufficient? Recommend SVG — not worth a Fiverr order for a header decoration.

**Q2: VoiceInput "Type / Record" icons**
Currently `⌨️` and `🎙` emojis. These are in the Idle state of VoiceInput. Suggest replacing with the `nav-office.riv` keyboard motif (reuse the laptop/keyboard design language) and a simple mic SVG. No Fiverr order needed.

**Q3: 4th arena tab width**
When Arena tab is added in MVP2, the 4 tabs will be narrower. At 300px total width, with 8px outer padding and 4px inter-tab gap, each tab gets ~66px. Labels may need to drop to 8px or be removed entirely — icons only in MVP2 nav. Decide before building arena.

**Q4: Instrument Serif trigger moment**
The accent font is reserved but unused. The evolution screen ("BABY → TEEN") is the candidate. What does that screen look like? Is it a full-screen takeover overlay, or a chat bubble from Biscuit? This needs a decision before building the level-up flow.

**Q5: Office avatar Rive instance**
The office header shows a small (36×36px) version of Biscuit. Is this a second mounted Rive instance from the same `buddy-mushroom.riv`, or a separate scaled-down artboard in the same file? Rive supports multiple artboards per file — recommend adding a `BuddyAvatarSmall` artboard to the same .riv file. Brief A should include this. Add to the Fiverr order.

**Q6: Sound design**
No audio is specced. Tamagotchi games use subtle sound effects (feeding jingle, level-up chime, fight hit). Should the app have sound effects, and if so, are they part of the Rive files (Rive supports audio) or separate web audio? Recommend: add 4–6 one-shot audio events via Web Audio API, sourced separately. Not blocking MVP1 but should be decided before the Fiverr order ships so the animator knows whether to embed audio.

---

*This document is the source of truth for design decisions. Update it before changing any token, component spec, or animation state. The Fiverr briefs in section 7 are copy-pasteable as-is — no editing needed before sending.*
