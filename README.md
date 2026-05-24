# Squarea Gardening

A Square Foot Gardening planner that runs entirely in the browser — no account, no backend, no sync. All data lives in your browser's IndexedDB via Dexie.js.

## Features

### Canvas View
- Draw raised or in-ground beds by dragging
- Paint plants into 1×1 ft squares or 2×2 ft blocks (tomatoes, squash, melons)
- Subgrid mode (right-click a square): divide one square foot into a 4×4 grid for high-density crops
- Select tool with multi-select (Ctrl+click) for batch editing
- Batch painting: plants placed in the same session share a batch ID for coordinated tracking
- Zoom (scroll wheel) and pan (Space+drag or click+drag in select mode)
- Keyboard shortcuts: `S` select, `B` bed, `P` paint, `E` erase, `Esc` clear

### Sidebar Panels
- **Bed Panel**: rename, recolor, switch type; click the bed name pill on the canvas to open from any tool mode
- **Plant Panel**: per-planting details — variety, status, dates, expected harvest
- **Batch Edit Panel**: edit variety, status, seed start, transplant/sow, actual harvest, and notes across an entire batch at once; fields left blank are skipped

### Calendar View
- Gantt timeline showing seed start → transplant → harvest windows per planting
- Batches appear as collapsed composite rows; click to expand individual plantings
- Scroll the timeline and the label pane stay in sync

### Plant Library
- 48 built-in plants with SFG-correct spacing (1–16/sqft) and large-footprint support (1 per 4sqft for 2×2 block plants)
- Edit any plant — spacing selector covers both small-density and large-footprint options
- **Restore Defaults** button resets a built-in plant to its original values
- **Duplicate** creates a custom copy ("Copy of …") you can freely modify
- Add fully custom plants with colors, sun requirements, days-to-harvest, and indoor start timing

## Stack

| Layer | Library |
|-------|---------|
| UI | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Canvas | react-konva (Konva.js) |
| Styling | Tailwind CSS 3 |
| UI State | Zustand + immer |
| Data | Dexie.js (IndexedDB) + dexie-react-hooks |
| Date math | date-fns |
| Icons | lucide-react |
| PWA | vite-plugin-pwa |

## Running locally

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npx tsc --noEmit   # type check
npm run build      # production build → dist/
```

> WSL users: `nvm` is already loaded in interactive terminals. The long `export NVM_DIR=…` form is only needed in non-interactive shells.

## Data model

```
Garden
  └─ Bed (x/y/widthFt/heightFt, color, bedType)
       └─ Square (col/row, useSubgrid) — lazy-created on first interaction
            └─ Planting (plantId, batchId?, variety?, status, dates…)
                         └─ Plant (spacingDensity, footprintFt?, daysToHarvest…)
```

Key rules:
- `expectedHarvestDate` is always `transplantOrSowDate + daysToHarvest` — never set directly
- `Plant.footprintFt: 2` means one planting occupies a 2×2 ft block; only the anchor square stores the record
- `Planting.batchId` groups all plantings from a single paint session for bulk selection and editing

## What's not done yet

- Batch delete / move as a unit
- Plant-type change on a batch member (change all vs. split to new batch)
- Subgrid multi-select
- 3×3 footprint plants (large pumpkins)
- Mobile / touch support
- Unit tests
- PWA icons + Lighthouse audit
