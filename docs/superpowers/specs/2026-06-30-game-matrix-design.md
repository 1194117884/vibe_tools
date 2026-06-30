# Game Matrix Tool — Design Spec

## Summary

Convert the standalone `docs/game_position_matrix.html` into a Next.js page at
`pages/tools/game-matrix/index.js`, integrated into the Vibe Tools app with
Apple-inspired design system styling.

## Architecture

Single-file React component. No sub-components extracted — the scope is one
self-contained tool page. All state lives in the component via `useState`.

```
pages/tools/game-matrix/index.js   ← React page component
components/SidebarLayout.js        ← add "Game Matrix" entry
pages/index.js                     ← add "Game Matrix" card
```

## Component Layout

```
┌──────────────────────────────────────────────┐
│ Toolbar                                      │
│ [🔍 Search...] [Platform ▼] [Category ▼]     │
│ [Type ▼]  | 12 rows | avg dev 3.2 | ...      │
│ [+ New] [Compare] [Export JSON] [Import JSON] │
├──────────────────────────────────────────────┤
│ Compare panel (collapsible, shown on demand)  │
├──────────────────────────────────────────────┤
│ Horizontally scrollable <table>              │
│ Sticky left column (name + one-line)          │
│ All 20 data columns scroll horizontally       │
│ Click row → open edit drawer                  │
│ Checkbox column for compare selection         │
└──────────────────────────────────────────────┘

Drawer (fixed right slide-in):
  - 38 fields in 2-column grid
  - Save / Clone / Delete buttons

JSON Modal (centered overlay):
  - Textarea + Copy / Apply buttons
```

## Design Tokens (Apple System Mapping)

| Element | Tailwind |
|---------|----------|
| Page bg | `bg-[var(--background)]` |
| Cards/panels | `bg-[var(--surface)] border border-[var(--border)] rounded-2xl` |
| Primary button | `bg-[var(--primary)] text-white rounded-xl` |
| Secondary button | `bg-[var(--surfaceHover)] border border-[var(--border)] rounded-xl` |
| Text | `text-[var(--text)]` |
| Muted text | `text-[var(--textMuted)]` |
| Score bar fill | `bg-[var(--primary)]` gradient |
| Selected row | `ring-2 ring-[var(--primary)]` |

## Data & Logic

- **Storage:** `localStorage` key `game_position_matrix_v1` (unchanged)
- **Default data:** Same 10 demo entries (unchanged)
- **FIELD_CONFIG:** Same 38 fields (unchanged)
- **Operations:** list/filter, add, edit, clone, delete, compare-two, JSON export/import, reset demo
- **No backend** — 100% client-side

## Tool Registration

- **Sidebar:** `{ id: 'game-matrix', name: 'Game Matrix', icon: '🎮' }`
- **Homepage:** `{ id: 'game-matrix', name: 'Game Matrix', desc: 'Manage game positioning & competitive analysis', icon: '🎮' }`
- **Not protected** — available to all users

## What Changes

1. **New file:** `pages/tools/game-matrix/index.js` — the tool page
2. **Edit:** `components/SidebarLayout.js` — add tool to nav list
3. **Edit:** `pages/index.js` — add tool to homepage grid

## What Stays the Same

- All data fields and default demo data
- localStorage key and schema
- All CRUD operations
- Table column order
- Form field layout
- Chinese UI text
