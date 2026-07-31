# LazyVim Learn Tool — Design Spec

**Date:** 2026-07-31
**Status:** Approved

## Overview

An interactive browser-based tool for learning and practicing LazyVim keymaps. Three modes in one page: browse/search reference, flashcard-style practice + timed drills, and a sandbox editor that simulates real LazyVim behavior.

## Architecture

Single-page tool under `pages/tools/lazyvim-learn/index.js`, following the existing vibe-tools pattern. Core logic split into two reusable modules:

```
pages/tools/lazyvim-learn/index.js   ← page component with tab state
utils/lazyvim-keymaps.js              ← structured keymap data (expandable)
utils/lazyvim-engine.js               ← virtual editor buffer + key handler
```

## File Structure

### `utils/lazyvim-keymaps.js`

Exports a flat array of keymap objects. Each object:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `keys` | string | Key sequence (e.g., `"dd"`, `"ciw"`, `"<leader>ff"`) |
| `description` | string | Human-readable action description |
| `category` | string | Grouping: `movement`, `editing`, `window`, `search`, `lsp`, `git`, `telescope`, `ui` |
| `tags` | string[] | Search keywords |
| `engineAction` | string | Action name for the sandbox engine to execute |

### `utils/lazyvim-engine.js`

A class-based virtual editor buffer:

- **State:** lines (string array), cursor row/col, mode (normal/insert/visual)
- **`handleKey(key: string)`** — looks up the key sequence in the keymap registry, executes the corresponding action, returns `{ action, description, buffer, cursor }`
- **Actions:** `deleteLine`, `deleteWord`, `changeInnerWord`, `yankLine`, `paste`, `undo`, `moveCursor`, `enterInsert`, `escapeNormal`, `visualSelect`, etc.
- **Key sequence buffer** — accumulates keystrokes for multi-key sequences (e.g., `<leader>`, `ciw`, `d$`), resolves when a complete match is found or on timeout

### `pages/tools/lazyvim-learn/index.js`

Single page with three tabs. Tab state is a React state variable (`reference | practice | sandbox`).

**Shared state:**
- `activeTab` — which tab is shown
- `keymaps` — imported from the data file

**Reference tab state:**
- `searchQuery` — filter text
- `selectedCategory` — category filter
- `selectedKeymap` — expanded detail view (optional)

**Practice tab state:**
- `mode` — `flashcard` or `speedrun`
- `currentQuestion` — random keymap from pool
- `score`, `streak`, `totalAttempts`
- `timer` — for speedrun mode
- `inputBuffer` — user's typed keys
- `feedback` — correct/incorrect + correct answer

**Sandbox tab state:**
- `engine` — instance of LazyVimEngine
- `displayBuffer` — rendered lines
- `cursorPos` — visual cursor position
- `modeIndicator` — current mode display
- `actionLog` — recent actions with descriptions (the key inspector sidebar)

## Data Flow

```
┌─────────────────────┐
│ lazyvim-keymaps.js  │  ← flat array of keymap objects
└────────┬────────────┘
         │ imported by
         ▼
┌─────────────────────┐     ┌──────────────────┐
│  index.js (page)    │────▶│ Reference Tab     │  browse, search, filter
│                     │     │                  │
│  activeTab state    │────▶│ Practice Tab      │  quiz + speedrun
│                     │     │                  │
│  engine instance    │────▶│ Sandbox Tab       │  virtual editor
└────────┬────────────┘     └──────────────────┘
         │ instantiates
         ▼
┌─────────────────────┐
│ lazyvim-engine.js   │  virtual buffer + cursor + key handler
│                     │
│ - handleKey(key)    │
│ - executeAction()   │
│ - keyBuffer/timeout │
└─────────────────────┘
```

## Component Design

### Reference Tab

- Category sidebar/chips to filter (movement, editing, window, search, etc.)
- Search input with live filtering
- Keymap list: each row shows `keys` (in a styled keystroke badge) + `description`
- Click to expand: shows full details, tags, related keymaps
- Responsive: category chips scroll horizontally on mobile, sidebar on desktop

### Practice Tab

**Flashcard mode:**
- Shows a description prompt (e.g., "Delete the current line")
- Hidden key capture input (or direct keyboard listener)
- User types the key sequence; on match (or timeout), shows result
- Score tracking: correct/incorrect, streak counter, total attempted
- After each answer, shows the correct keybinding as a badge
- "Next" button or auto-advance

**Speedrun mode:**
- Timer countdown (e.g., 60 seconds)
- Rapid-fire prompts, one after another
- Score = correct answers within time limit
- Results screen at end with accuracy %, WPM, slowest/fastest answers

**Shared practice config:**
- Category selector — which keymap categories to include in the pool
- Difficulty filter — exclude advanced keymaps for beginners

### Sandbox Tab

**Virtual editor pane (left ~60%):**
- Monospace font, line numbers, syntax-highlighting-like appearance
- Visual cursor block (blinking, positioned at current row/col)
- Mode indicator in the statusline area (NORMAL / INSERT / VISUAL)
- Buffer content rendered as lines of text

**Key inspector sidebar (right ~40%):**
- Log of recent key presses and their matched actions
- Each entry: `keys pressed → action description`
- Latest entry highlighted

**How it works:**
- An invisible input captures keyboard input (or a global `keydown` listener)
- Keystrokes are sent to `engine.handleKey()`
- Engine returns updated buffer, cursor, and action description
- React state updates → re-render editor + log

## Keymap Data (Initial Set)

Core LazyVim keymaps to ship with v1:

| Category | Count | Examples |
|----------|-------|----------|
| Movement | ~15 | `h/j/k/l`, `w/b/e`, `0/$`, `gg/G`, `{/}`, `Ctrl+d/u`, `%` |
| Editing | ~15 | `i/a/o/O`, `x`, `dd`, `yy`, `p/P`, `ciw`, `diw`, `u/Ctrl+r`, `>>`, `<<` |
| Visual | ~5 | `v`, `V`, `Ctrl+v`, `>`, `<` |
| Window | ~8 | `<leader>wv`, `<leader>ws`, `<leader>wd`, `<C-w>h/j/k/l`, `<leader>we` |
| Search | ~5 | `/`, `?`, `n/N`, `*`, `#` |
| Telescope | ~5 | `<leader>ff`, `<leader>fg`, `<leader>fb`, `<leader>fh`, `<leader>fr` |
| LSP | ~6 | `K`, `gd`, `gr`, `[d/]d`, `<leader>ca`, `<leader>rn` |
| Git | ~4 | `<leader>gg`, `<leader>gb`, `<leader>gh`, `]h/[h` |
| UI | ~4 | `<leader>e`, `<leader>th`, `<leader>bd`, `<leader>gg` |

Total: ~67 keymaps for v1. Data file is structured as a flat array — easy to add more.

## Error Handling & Edge Cases

- **Key sequence conflicts:** If two keymaps share a prefix (e.g., `d` and `dd`), the engine waits for a timeout (300ms) before resolving the shorter one. If more keys arrive, continues buffering.
- **Unknown keys:** Logged as "no mapping" in the sandbox log. In practice mode, counted as incorrect.
- **Empty buffer in sandbox:** Prevent cursor from going out of bounds. Minimum 1 line always present.
- **Browser shortcuts:** Capture `preventDefault()` on recognized key sequences. Allow `Ctrl+t`/`Ctrl+n` etc. to pass through.
- **Mobile:** Show an on-screen key grid for the sandbox (virtual keyboard with common Vim keys). Practice mode shows multiple-choice buttons instead of key capture on touch devices.

## Testing

- **Unit tests:** `lazyvim-engine.js` — test each action (deleteLine, changeWord, yank, paste, cursor movement, mode transitions, key buffer resolution)
- **Unit tests:** `lazyvim-keymaps.js` — validate all entries have required fields, no duplicate IDs, all `engineAction` values are valid
- **Component tests:** tab switching, search filtering, practice scoring logic, sandbox buffer rendering

## Out of Scope for v1

- Custom keymap importing (user adds their own mappings)
- Spaced repetition (SM2 algorithm for practice scheduling)
- Multiplayer/leaderboard
- Audio feedback
- Tutorial/guided walkthrough mode
- Neovim API integration (talking to a real Neovim instance)