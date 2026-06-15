# Koala

A Tamagotchi-style virtual pet game for the Amazfit Bip 6 smartwatch. Raise a koala by walking (steps → coins) or tapping (petting), feed it, play with it, and keep it healthy through a 30-day lifecycle. Runs on the watch via Zepp OS, with a React web wrapper for local development and testing.

## Architecture

```
 ┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
 │  web/        │     │  shared/         │     │  watch/      │
 │  (React)     │────▶│  (pure JS)       │◀────│  (Zepp OS)   │
 │  Vite + CSS  │     │  game engine     │     │  @zos/*      │
 │              │     │  + constants     │     │  hmUI        │
 └──────┬───────┘     └──────────────────┘     └──────┬───────┘
        │                                             │
        │    ┌─────────────────────┐                  │
        └───▶│  page/index.js      │◀─────────────────┘
             │  (single UI source) │
             └─────────────────────┘
                      │
               ┌──────┴──────┐
               │  vitest     │
               │  19 tests   │
               └─────────────┘
```

**`page/index.js`** is the single source of truth for the UI. It uses Zepp OS's `hmUI` widget API — the web wrapper runs the exact same file by providing React-based shim implementations of `@zos/ui`, `@zos/sensor`, and `@zos/fs`. Each platform provides its own adapter implementations for storage, time, and step counting.

| Capability | Web Adapter | Watch Adapter |
|---|---|---|
| Persistence | `localStorage` | `@zos/fs` |
| Time | `Date.now()` + debug offset | `Date.now()` |
| Steps | Manual counter | `@zos/sensor` |
| UI (`hmUI`) | React shim (`web/src/hmUI.js` + `WidgetRenderer.jsx`) | `@zos/ui` |
| Sensor (`Vibrator`) | No-op shim (`web/src/zos-sensor.js`) | `@zos/sensor` |

## Project Structure

```
koala-tamagotchi/
├── shared/                            # Pure JS — shared between web & watch
│   ├── constants.js                   # All tunable game params
│   ├── gameEngine.js                  # Core state machine
│   └── gameEngine.test.js            # 19 unit tests (vitest)
│
├── web/                               # React dev wrapper (browser)
│   ├── index.html
│   ├── vite.config.mjs                # Vite + plugin for @zos/* → web shims
│   ├── package.json
│   └── src/
│       ├── main.jsx                   # Entry: sets Page global, dyn-imports page/index.js
│       ├── WatchPage.jsx              # Page() global provider + React render loop
│       ├── hmUI.js                    # React-compatible hmUI shim (createWidget, etc.)
│       ├── WidgetRenderer.jsx         # Maps hmUI widget descriptors → React elements
│       ├── zos-sensor.js             # No-op Vibrator + Step shim
│       ├── zos-fs.js                 # No-op @zos/fs shim
│       ├── constants.js               # Device dimensions (390×450)
│       ├── adapters/
│       │   ├── storageAdapter.js      # localStorage wrapper
│       │   ├── timeAdapter.js         # Date.now() + debug offset
│       │   └── stepsAdapter.js        # Manual step counter (exports as sensorAdapter too)
│       └── components/
│           ├── DebugPanel.jsx         # Simulate steps/time, reset
│           └── DebugPanel.module.css
│
├── page/                              # Zepp OS watch pages (also run by web)
│   ├── index.js                       # Main game screen — single UI source
│   └── index.style.js
│
├── utils/                             # Zepp OS adapters
│   ├── storageAdapter.js              # @zos/storage wrapper
│   ├── sensorAdapter.js               # @zos/sensor wrapper
│   └── timeAdapter.js                 # Date.now() wrapper
│
├── app.js                             # Zepp OS app lifecycle
├── app.json                           # Zepp OS manifest
│
├── images/                            # Canonical assets (replace with real art)
│   ├── bg.png                         # Watch background
│   ├── koala/
│   │   ├── day_0.png … day_30.png     # 31 growth sprites
│   │   └── day_dead.png              # Death sprite
│   └── ui/
│       ├── food.png                   # Food icon
│       ├── toy.png                    # Toy/play icon
│       └── medicine.png              # Medicine icon
│
├── assets/                            # Symlinks to images/ (Zepp OS needs these)
│   ├── bg.png -> ../images/bg.png
│   ├── koala/ -> ../images/koala/
│   └── ui/ -> ../images/ui/
│
├── package.json                       # Root scripts (dev, test, lint)
└── vitest.config.js
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A modern browser (Chrome/Firefox) for local testing

### Run the Web Wrapper

```bash
# Install dependencies
cd web && npm install && cd ..

# Start dev server
npm run dev
# or: npm run dev --prefix web

# Open http://localhost:5173 in your browser
```

You'll see a 390×450 watch viewport with:
- Full-screen background and koala sprite
- **Top left**: hunger % and joy % with icons
- **Top center**: heart icon — ❤️ healthy, 💛 sick (click to buy medicine), 🖤 dead
- **Top right**: current day (0–30)
- **Right center**: coin balance 🪙
- **Bottom bar**: Food / Medicine / Toy buttons (hidden when not needed)
- **Right sidebar**: Debug Panel

### Run Tests

```bash
npm test              # Run once (19 tests)
npm run test:watch    # Watch mode, re-runs on changes
```

## Game Mechanics

### Core Stats

| Stat | Range | Decay | Description |
|---|---|---|---|
| Hunger | 0–100 | 2/hour (4 if sick) | Drops over time. Feed with food (10 coins → +30) or petting (10 taps → +1). |
| Joy | 0–100 | 3/hour (6 if sick) | Drops over time. Raise with toy (10 coins → +30) or petting (10 taps → +1). |
| Health | normal / sick / dead | — | 10% daily sickness chance (50% if neglected). Medicine costs 30 coins. 100 taps also cure. |
| Age | 0–30 days | — | Ages at midnight. Stunted if sick or both stats < 30 at day end. |
| Coins | — | — | Earn 1 coin per 100 lifetime steps. Spent at the store. |
| Steps | — | — | Read from watch sensor. Debug panel lets you add steps manually. |

### Interactions

- **Tap the koala** — petting. Every 30 taps → +1 hunger, +1 joy. 100 taps cures sickness.
- **Shop buttons** (bottom bar) — Food (+30 hunger, 10 coins), Toy (+30 joy, 10 coins), Medicine (cure, 30 coins). Appear conditionally based on need.
- **Heart icon** (top center) — click to buy medicine directly.

### Death

If hunger *and* joy both stay at 0 for 48 consecutive hours, the koala dies. The screen shows a grayscale dead sprite and a "Start Again" button. No auto-reset — the player must choose to restart.

### Neglect & Sickness

- Each day at first open: 10% chance of random sickness.
- If hunger **or** joy drops below 20: sickness chance jumps to 50%.
- Sickness doubles decay rates (4 hunger/hr, 6 joy/hr).
- A sick koala at day-end won't age (stunted growth).

## Development Guide

### Understanding the Engine

The engine (`shared/gameEngine.js`) is a factory function:

```js
const engine = createGameEngine({ storage, getTime, getSteps });
engine.init();          // Load persisted state, apply time-delta decay
engine.pet();           // Handle tap
engine.buy('food');     // Store purchase → returns boolean
engine.addSteps(500);   // Convert steps to coins
engine.getState();      // Read current state
engine.reset();         // Full reset
engine.tick(hours);     // Advance time for debug (web only)
```

Key internal flows:
1. **`init()`** — loads saved state from storage, calls `applyTimeDecay()` to catch up on missed hours, syncs step count.
2. **`applyTimeDecay()`** — computes elapsed hours since last save, subtracts hunger/joy, checks daily date rollover (aging, sickness roll).
3. **`handleDailyReset()`** — called when date changes. Ages koala unless stunted, resets daily step counter, runs sickness lottery.
4. **`checkDeath()`** — sets `health = 'dead'` when `zeroStatHours >= 48`. Does NOT auto-reset.

### Modifying Game Balance

All tunable values are in `shared/constants.js`. Change them and re-run tests:

| Constant | Default | Effect |
|---|---|---|
| `HUNGER_DECAY_PER_HOUR` | 2 | Normal hunger loss rate |
| `JOY_DECAY_PER_HOUR` | 3 | Normal joy loss rate |
| `HUNGER_DECAY_PER_HOUR_SICK` | 4 | Sick hunger loss rate |
| `JOY_DECAY_PER_HOUR_SICK` | 6 | Sick joy loss rate |
| `STORE_FOOD_COST` | 10 | Coin cost for food |
| `STORE_MEDICINE_COST` | 30 | Coin cost for medicine |
| `PET_TAPS_FOR_BONUS` | 30 | Taps needed for +1/+1 bonus |
| `SICK_PET_TAPS_TO_CURE` | 100 | Taps needed to cure sickness |
| `DEATH_ZERO_STAT_HOURS` | 48 | Hours at zero before death |
| `DAILY_SICKNESS_CHANCE` | 0.1 | Base daily sickness probability |
| `NEGLECT_SICKNESS_CHANCE` | 0.5 | Sickness chance when neglected |

### Adding Features

1. **Game logic changes** → edit `shared/gameEngine.js`, add tests to `shared/gameEngine.test.js`, run `npm test`.
2. **UI changes** → edit `page/index.js`. This is the single UI source used by both watch and web. Uses `hmUI` widget API (`@zos/ui`). Coordinates are pixel-based for the 390×450 screen.
3. **Web adapter changes** → edit files in `web/src/`. The `hmUI.js` shim captures widget creation calls during render; `WidgetRenderer.jsx` maps them to React elements; `vite.config.mjs` redirects `@zos/*` imports and watch `../utils/*` imports to web equivalents via `resolveId` + `load` hooks.

### Debug Panel Tricks

The Debug Panel (right side of web wrapper) lets you:
- **Add Steps**: Simulate walking. 100 steps = 1 coin.
- **Jump +Nh**: Advance the simulated clock by N hours. Applies hunger/joy decay, triggers midnight aging if the date changes.
- **Fast +Nd**: Jump forward by N days. Equivalent to `+24h × N`.
- **Reset Game**: Full state wipe. Use this to test the new-game experience or test death/reset flow.

**To test death quickly**: Reset → Jump +48h with 0 steps (no coins for food) → koala dies → click "Start Again".

### Adding New Sprites

Replace placeholder images in `images/koala/` with real artwork:

```
images/koala/day_0.png    → Egg/newborn
images/koala/day_1.png    → Day 1
...
images/koala/day_30.png   → Fully grown adult
images/koala/day_dead.png → Death sprite (grayscale)
```

Also replace:
- `images/bg.png` — 390×450 background
- `images/ui/food.png`, `toy.png`, `medicine.png` — icon buttons

Run `npm run dev` — the web app serves files from `web/public/images/` (symlinked to `images/`), so changes appear immediately.

### Watch App Development

```bash
# Install Zepp CLI (one-time)
npm install -g @zeppos/zeus-cli

# Build for watch
zeus build

# Preview on device (generates QR code)
zeus preview
```

The watch app loads the shared engine from `shared/gameEngine.js` via relative import:
```js
import { createGameEngine } from '../../shared/gameEngine.js';
```

### Web Wrapper Architecture

The web wrapper runs `page/index.js` directly — no separate UI implementation. The Vite config (`web/vite.config.mjs`) includes a custom plugin that:

- **`resolveId`** redirects bare Zepp OS imports (`@zos/ui`, `@zos/sensor`, `@zos/fs`) to React-based shims under `web/src/`
- **`load`** intercepts the watch adapter files (`../utils/storageAdapter.js`, etc.) and returns re-export code pointing at the canonical web adapter modules — ensuring both `page/index.js` and the DebugPanel share the same singleton instances

The render loop works as follows:
1. `page/index.js` calls `render()` → `hmUI.createWidget()` N times (captured into a module-level array)
2. `WatchPage.jsx` collects the array, maps each widget descriptor through `WidgetRenderer.jsx` to a React element
3. `setState()` triggers React reconciliation, producing the 390×450 watch viewport
4. Click handlers and the tick timer call `render()` again, repeating the cycle

### Testing

Tests live in `shared/gameEngine.test.js` and use `vitest`. They test the engine in isolation with mock adapters (in-memory storage, fixed timestamps, zero steps).

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Test pattern: each test creates a `makeSaved(overrides)` fixture, injects it into `createAdapter({ savedState })`, calls `makeEngine(adapter)`, then asserts on `engine.getState()`.

## Commands Reference

| Command | Location | Description |
|---|---|---|
| `npm run dev` | root | Start web dev server |
| `npm test` | root | Run vitest once |
| `npm run test:watch` | root | Run vitest in watch mode |
| `npm run lint` | root | Check formatting with prettier |
| `npx vite build` | web/ | Production build of web wrapper |
| `zeus build` | root | Build Zepp OS app |
| `zeus preview` | root | Deploy to watch via QR code |

## State Schema

The engine persists this JSON object to storage:

```json
{
  "hunger": 85,
  "joy": 72,
  "health": "normal",
  "age": 5,
  "coins": 12,
  "coinsSpent": 8,
  "totalLifetimeSteps": 2000,
  "todayStepCount": 350,
  "lastStepDate": "2026-06-14",
  "lastSaveTimestamp": 1718366400000,
  "sickDayCount": 0,
  "tapCounter": 4,
  "zeroStatHours": 0,
  "lastSicknessCheckDate": "2026-06-14"
}
```

- `health` is one of: `"normal"` | `"sick"` | `"dead"`
- `tapCounter` resets on midnight rollover and after a bonus/cure triggers
- `zeroStatHours` tracks consecutive hours with hunger=0 AND joy=0
- `coinsSpent` tracks cumulative spending (so balance = earned − spent)

## License

Private project. Not for redistribution.
