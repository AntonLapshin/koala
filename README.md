# Koala

A Tamagotchi-style virtual pet game for the Amazfit Bip 6 smartwatch. Hatch a koala from an egg, raise it by walking (steps → coins) or tapping (petting), feed it, play with it, rescue wild koalas, and keep it healthy through a 16-day lifecycle. Runs on the watch via Zepp OS, with a React web wrapper for local development and testing.

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
               │  80 tests   │
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
│   ├── gameEngine.test.mjs            # 19 engine unit tests (vitest)
│   ├── rescueEngine.js                # Rescue minigame logic
│   └── engineRegistry.js              # Singleton engine accessor
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
│       ├── zos-sensor.js              # No-op Vibrator + Step shim
│       ├── zos-fs.js                  # No-op @zos/fs shim
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
│   ├── index.style.js                 # Style constants
│   └── rescue.js                      # Rescue screen renderer
│
├── utils/                             # Zepp OS adapters & helpers
│   ├── storageAdapter.js              # @zos/fs wrapper
│   ├── sensorAdapter.js               # @zos/sensor wrapper
│   ├── timeAdapter.js                 # Date.now() wrapper
│   ├── constants.js                   # Device dimensions (390×450)
│   ├── createDefaultState.js          # Factory for fresh game state
│   ├── calculateCoins.js              # Coin math from steps
│   ├── clamp.js                       # Numeric clamp helper
│   ├── formatDate.js                  # YYYY-MM-DD formatter
│   ├── getTimeOfDay.js                # morning / day / evening / night
│   ├── getWeather.js                  # Random weather (rain during day)
│   ├── getHeartSrc.js                 # Heart icon selector by health
│   ├── getBgSrc.js                    # Background selector by time of day
│   ├── getNotificationMessage.js      # Critical status alert text
│   ├── isCriticalStatus.js            # Check if hunger/joy are critically low
│   ├── randomEggIndex.js              # Random egg sprite (1–16)
│   ├── hashStr.js                     # Deterministic string hash
│   └── *.test.mjs                     # 61 utility tests (vitest)
│
├── app.js                             # Zepp OS app lifecycle
├── app.json                           # Zepp OS manifest
│
├── assets/                            # Watch assets (Zepp OS build-time)
│   ├── default.b/                     # Build variant: big (480×)
│   ├── default.r/                     # Build variant: round
│   ├── default.s/                     # Build variant: square (390×)
│   ├── bg_*.png                       # Time-of-day backgrounds
│   ├── koala/ → ../images/koala/      # Growth sprites
│   ├── egg/ → ../images/egg/          # Egg sprites
│   ├── ui/ → ../images/ui/            # Icon buttons
│   └── rescue/ → ../images/rescue/    # Rescue scene sprites
│
├── images/                            # Canonical assets (shared with web/public)
│   ├── bg_day.png, bg_night.png, …    # Time-of-day backgrounds
│   ├── bg_rain.png                    # Rain overlay
│   ├── koala/koala_1.png … koala_16.png  # 16 growth sprites
│   ├── egg/egg_1.png … egg_16.png     # 16 egg sprites
│   ├── ui/food.png, toy.png, medicine.png, coin.png, rescue.png
│   ├── ui/heart_health.png, heart_sick.png, heart_dead.png
│   └── rescue/rscene_0.png … rscene_3.png
│
├── web/public/images → ../images      # Symlink so Vite serves assets
│
├── package.json                       # Root scripts (dev, test, lint)
└── vitest.config.mjs                  # Test runner config
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A modern browser (Chrome/Firefox) for local testing

### Run the Web Wrapper

```bash
# Install dependencies (root + web/)
npm install

# Start dev server
npm run dev
# or: npm run dev --prefix web

# Open http://localhost:5173 in your browser
```

You'll see a 390×450 watch viewport with:
- Full-screen background that changes with time of day (morning/day/evening/night)
- Rain overlay during daytime when weather is rainy
- **Top left**: hunger % and joy % with food/toy icons and progress bars
- **Top center**: heart icon — tap to open the **Stats screen**
- **Top right**: current age (0–16) — tap to open the **Stats screen**
- **Left center**: Rescue button with rescue count — tap to play the **Rescue minigame**
- **Right center**: coin balance 🪙
- **Bottom bar**: Food / Medicine / Toy store buttons (appear conditionally)
- **Below koala**: tap counter progress (e.g. `4/10 taps` or `15/20 taps` when sick)
- **Right sidebar**: Debug Panel

### Run Tests

```bash
npm test              # Run once (80 tests)
npm run test:watch    # Watch mode, re-runs on changes
```

## Game Mechanics

### Core Stats

| Stat | Range | Decay | Description |
|---|---|---|---|
| Hunger | 0–100 | 2/hour (4 if sick) | Drops over time. Feed with food (5 coins → +30) or petting (10 taps → +1). |
| Joy | 0–100 | 3/hour (6 if sick) | Drops over time. Raise with toy (5 coins → +30) or petting (10 taps → +1). |
| Health | normal / sick / dead | — | 20% daily sickness chance (50% if neglected). Medicine costs 15 coins. 20 taps also cure. |
| Age | 0–16 days | — | Ages at midnight. Stunted if sick or **both** stats < 30 at day end. Dies of old age at day 16. |
| Coins | — | — | Earn 1 coin per 100 lifetime steps. Spent at the store. |
| Steps | — | — | Read from watch sensor. Debug panel lets you add steps manually. |

### Interactions

- **Tap the koala** — petting. Every 10 taps → +1 hunger, +1 joy. 20 taps cure sickness.
- **Shop buttons** (bottom bar) — Food (+30 hunger, 5 coins), Toy (+30 joy, 5 coins), Medicine (cure, 15 coins). Appear conditionally based on need.
- **Heart icon** (top center) — tap to open the Stats screen.
- **Age button** (top right) — tap to open the Stats screen.
- **Rescue button** (left center) — tap to enter the Rescue minigame. First rescue is guaranteed; thereafter ~10% chance per hour of finding a koala to rescue.

### Rescue Minigame

A random rescue scene appears when a koala is found. Tap **Rescue** to save it. Rescued koalas are counted on your stats screen. If no koala is available, try again later.

### Death

If hunger **and** joy both stay at 0 for 48 consecutive hours (172,800 seconds), the koala dies. The screen shows a death message and a "Start Again" button. No auto-reset — the player must choose to restart.

The koala also dies of old age when it reaches day 16.

### Neglect & Sickness

- Each day at first open: 20% chance of random sickness.
- If hunger **or** joy drops below 50: sickness chance jumps to 50%.
- Sickness doubles decay rates (4 hunger/hr, 6 joy/hr).
- A sick koala at day-end won't age (stunted growth).

### Notifications

When hunger or joy drops below 20, a critical-status banner appears at the top of the screen and the watch vibrates. The banner has a 5-minute cooldown to avoid spamming.

### Stats Screen

Tap the heart or age button to view:
- Days Alive
- Coins Earned / Spent
- Food Given / Toys Played / Medicine Used
- Sick Days
- Total Steps
- Rescue Count

## Development Guide

### Understanding the Engine

The engine (`shared/gameEngine.js`) is a factory function:

```js
const engine = createGameEngine({ storage, getTime, getSteps });
engine.init();          // Load persisted state, apply time-delta decay
engine.resume();        // Apply decay + sync steps (called on app resume)
engine.pet();           // Handle tap
engine.buy('food');     // Store purchase → returns boolean
engine.addSteps(500);   // Convert steps to coins
engine.getState();      // Read current state
engine.reset();         // Full reset
engine.tick(hours);     // Advance time for debug (web only)
engine.checkRescue(nowMs);   // Check if a rescue is available
engine.recordRescue();       // Increment rescue count and clear pending flag
```

Key internal flows:
1. **`init()`** — loads saved state from storage, calls `applyTimeDecay()` to catch up on missed time, syncs step count.
2. **`applyTimeDecay()`** — computes elapsed seconds since last save, subtracts hunger/joy, checks daily date rollover (aging, sickness roll).
3. **`handleDailyReset()`** — called when date changes. Ages koala unless stunted or sick, resets daily step counter, clears tap counter.
4. **`checkDeath()`** — sets `health = 'dead'` when `zeroStatSeconds >= 172800` or `age >= MAX_AGE`. Does NOT auto-reset.

### Modifying Game Balance

All tunable values are in `shared/constants.js`. Change them and re-run tests:

| Constant | Default | Effect |
|---|---|---|
| `HUNGER_DECAY_PER_HOUR` | 2 | Normal hunger loss rate |
| `JOY_DECAY_PER_HOUR` | 3 | Normal joy loss rate |
| `HUNGER_DECAY_PER_HOUR_SICK` | 4 | Sick hunger loss rate |
| `JOY_DECAY_PER_HOUR_SICK` | 6 | Sick joy loss rate |
| `STORE_FOOD_COST` | 5 | Coin cost for food |
| `STORE_TOY_COST` | 5 | Coin cost for toy |
| `STORE_MEDICINE_COST` | 15 | Coin cost for medicine |
| `PET_TAPS_FOR_BONUS` | 10 | Taps needed for +1/+1 bonus |
| `SICK_PET_TAPS_TO_CURE` | 20 | Taps needed to cure sickness |
| `DEATH_ZERO_STAT_SECONDS` | 172800 | Seconds at zero before death (48h) |
| `DAILY_SICKNESS_CHANCE` | 0.2 | Base daily sickness probability |
| `NEGLECT_SICKNESS_CHANCE` | 0.5 | Sickness chance when neglected |
| `MAX_AGE` | 16 | Maximum lifespan in days |
| `RESCUE_CHANCE_PER_HOUR` | 0.1 | Chance of rescue encounter per hour |

### Adding Features

1. **Game logic changes** → edit `shared/gameEngine.js`, add tests to `shared/gameEngine.test.mjs`, run `npm test`.
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

Replace placeholder images in `images/` with real artwork:

```
images/koala/koala_1.png    → Day 1
...
images/koala/koala_16.png   → Fully grown adult
images/egg/egg_1.png … egg_16.png  → Egg sprites (randomized at hatch)
images/rescue/rscene_0.png … rscene_3.png  → Rescue scene backgrounds
```

Also replace:
- `images/bg_day.png`, `bg_night.png`, `bg_morning.png`, `bg_evening.png` — time-of-day backgrounds
- `images/bg_rain.png` — rain overlay
- `images/ui/food.png`, `toy.png`, `medicine.png`, `coin.png`, `rescue.png` — icon buttons
- `images/ui/heart_health.png`, `heart_sick.png`, `heart_dead.png` — health icons

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

Tests live in `shared/gameEngine.test.mjs` and `utils/*.test.mjs` and use `vitest`. They test the engine and utilities in isolation with mock adapters (in-memory storage, fixed timestamps, zero steps).

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Test pattern: each engine test creates a `makeSaved(overrides)` fixture, injects it into `createAdapter({ savedState })`, calls `makeEngine(adapter)`, then asserts on `engine.getState()`.

## Commands Reference

| Command | Location | Description |
|---|---|---|
| `npm run dev` | root | Start web dev server |
| `npm run build` | root | Production build of web wrapper |
| `npm test` | root | Run vitest once |
| `npm run test:watch` | root | Run vitest in watch mode |
| `npm run lint` | root | Check formatting with prettier |
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
  "eggIndex": 7,
  "coins": 12,
  "coinsSpent": 8,
  "totalLifetimeSteps": 2000,
  "todayStepCount": 350,
  "lastStepDate": "2026-06-14",
  "lastSaveTimestamp": 1718366400000,
  "lastDecayTimestamp": 1718366400000,
  "sickDayCount": 0,
  "tapCounter": 4,
  "zeroStatSeconds": 0,
  "lastSicknessCheckDate": "2026-06-14",
  "totalFoodBought": 3,
  "totalToysBought": 2,
  "totalMedicineBought": 1,
  "rescueCount": 0,
  "lastRescueCheckHour": "",
  "rescuePending": false,
  "rescueSceneIndex": 0
}
```

- `health` is one of: `"normal"` | `"sick"` | `"dead"`
- `eggIndex` is a random 1–16 sprite shown while `age === 0`
- `tapCounter` resets on midnight rollover and after a bonus/cure triggers
- `zeroStatSeconds` tracks consecutive seconds with hunger=0 AND joy=0
- `coinsSpent` tracks cumulative spending (so balance = earned − spent)
- `rescuePending` / `rescueSceneIndex` track an active rescue encounter

## License

Private project. Not for redistribution.
