# Squarea Gardening — Developer Notes

## What this is
A Square Foot Gardening planner. Single-page React app, no backend, all data in browser IndexedDB via Dexie.js. The user is actively using this for real garden planning and plans to share it publicly.

## Stack
- React 18 + TypeScript 5, Vite 5
- react-konva (canvas rendering)
- Tailwind CSS 3
- Zustand + immer (UI state only)
- Dexie.js + dexie-react-hooks (all domain data)
- date-fns, lucide-react, vite-plugin-pwa

## Running
```
npm run dev       # start dev server (port 5173)
npx tsc --noEmit  # type check
```
In WSL interactive terminal, nvm is already loaded — just `npm run dev`. The long `export NVM_DIR=...` form is only needed in non-interactive shells (e.g. Claude Code's Bash tool).

## Architecture
- No routing. Three views (canvas, calendar, plants) switched via Zustand.
- Zustand holds **UI state only**: tool, viewport, selection, modal flags.
- All domain data (gardens, beds, squares, plantings, plants) lives in Dexie. Components subscribe via `useLiveQuery`.
- Viewport transform is on the `<Stage>` element, not on individual layers — this keeps grid, beds, and overlays in sync.

## Key constants & rules
- `CELL_PX = 48` — 1 foot = 48 world pixels
- `Squares` are lazy-created: a square record is only written to DB when a cell is first interacted with.
- `expectedHarvestDate` is always derived from `transplantOrSowDate + plant.daysToHarvest`; never set by the user directly.
- `Plant.footprintFt` (optional, default 1): side length of a square footprint. `2` = 2×2 block (tomatoes, squash, melons). One planting record is stored at the anchor square; satellite cells are derived at render time.
- `Planting.variety` (optional): per-instance cultivar name. Shown on canvas as "PlantName (Variety)".

## Database migration pattern
`src/db/seedPlants.ts` runs on every app startup:
1. `dedupDefaultPlants()` — removes duplicate default plants from React StrictMode double-runs, remapping any plantings first.
2. `migrateDefaultPlants()` — syncs `footprintFt` and `spacingDensity` from `defaultPlants.ts` into existing DB records (so changes to default data propagate to users).
3. Seeds 48 default plants if count is 0.

A module-level `seeding` flag prevents double execution (StrictMode safety).

## Canvas rendering details
- `GridLayer`: major grid every 1ft (CELL_PX), minor grid every 6in (CELL_PX/2, shown at scale ≥ 0.8). Both scale with the Stage transform.
- `SquareCell`: pip markers at dice positions based on `spacingDensity`. Label shows variety if set: "Tomato (Mortgage Lifter)" at high zoom, variety initial at medium zoom.
- `BedShape`: computes `largePlantAnchors` (footprintFt > 1) and `largeSatelliteCells` each render. Satellite cells are skipped in the normal cell loop; large plants render as a unified block with one border, one center pip, one label.
- `PlantStampOverlay`: ghost stamp shown when paint-plant tool is active and selected plant has footprintFt > 1. Dashed outline, grey when outside a bed or invalid.

## Interaction model
| Tool | Click | Ctrl+Click | Space (any tool) |
|------|-------|------------|-----------------|
| Select | Select planting | Add/remove from multi-select | Pan |
| Paint | Place plant (1×1 or stamp) | — | Pan |
| Erase | Remove planting | — | Pan |
| Bed | Draw bed (drag) | — | Pan |

Multi-select triggers `BatchEditPanel` in the sidebar (>1 planting selected). Only touched fields are applied on save.

## SFG spacing corrections made
Plants with `footprintFt: 2` (1 plant per 2×2 ft block):
- Tomato (Indeterminate), Tomato (Determinate), Cherry Tomato
- Zucchini, Yellow Summer Squash, Butternut Squash, Pumpkin
- Watermelon, Cantaloupe

Cucumber (Vining) corrected to `spacingDensity: 2` (was 1).

## What's not done yet (as of 2026-05-09)
- PWA hardening / Lighthouse audit (intentionally deferred)
- Unit tests
- 3×3 footprint plants (e.g. large pumpkins)
- Subgrid multi-select
- Mobile/touch support
