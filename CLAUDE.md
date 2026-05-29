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
- `Planting.batchId` (optional): UUID shared by all plantings created in the same paint session. Assigned when a plant is selected from the picker; resets each time `setActivePlantId` is called. Indexed in Dexie (version 2) for `where('batchId').equals(...)` queries. Older plantings have `batchId: undefined`. `newPaintBatch()` store action generates a fresh batch ID without changing the active plant.

## Database migration pattern
`src/db/seedPlants.ts` runs on every app startup:
1. `dedupDefaultPlants()` — removes duplicate default plants from React StrictMode double-runs, remapping any plantings first.
2. `migrateDefaultPlants()` — syncs `footprintFt` and `spacingDensity` from `defaultPlants.ts` into existing DB records (so changes to default data propagate to users).
3. Seeds 48 default plants if count is 0.

A module-level `seeding` flag prevents double execution (StrictMode safety).

## Canvas rendering details
- `GridLayer`: major grid every 1ft (CELL_PX), minor grid every 6in (CELL_PX/2, shown at scale ≥ 0.8). Both scale with the Stage transform.
- `SquareCell`: pip markers at dice positions based on `spacingDensity`. Label shows variety if set: "Tomato (Mortgage Lifter)" at high zoom, variety initial at medium zoom.
- `BedShape`: computes `largePlantAnchors` (footprintFt > 1) and `largeSatelliteCells` each render. Satellite cells are skipped in the normal cell loop; large plants render as a unified block with one border, one center pip, one label. Bed name renders as a clickable pill (faint color fill + border) in the top-left corner — clicking it sets `activeBedId` and switches to select tool, opening BedPanel from any tool mode.
- `PlantStampOverlay`: ghost stamp shown when paint-plant tool is active and selected plant has footprintFt > 1. Dashed outline, grey when outside a bed or invalid.

## Interaction model
| Tool | Click | Ctrl+Click | Space (any tool) |
|------|-------|------------|-----------------|
| Select | Select planting | Add/remove from multi-select | Pan |
| Paint | Place plant (1×1 or stamp) | — | Pan |
| Erase | Remove planting | — | Pan |
| Bed | Draw bed (drag) | — | Pan |

Multi-select triggers `BatchEditPanel` in the sidebar (>1 planting selected). Only touched fields are applied on save.

## Plant spacing model
Two orthogonal fields on `Plant`:
- `spacingDensity: SpacingDensity` (1 | 2 | 4 | 8 | 9 | 16) — plants **per** sq ft, used for 1×1 footprint plants. Drives pip markers in `SquareCell`.
- `footprintFt?: number` (default 1) — side length of footprint in feet. `2` = 2×2 block. When set ≥ 2, `spacingDensity` is always 1.

These are mutually exclusive in practice. The `PlantEditModal` unifies them into a single **Spacing** selector: `16/sqft … 1/sqft | 1 per 4sqft`. Selecting `1 per 4sqft` stores `{ spacingDensity: 1, footprintFt: 2 }`.

Plants with `footprintFt: 2` (1 plant per 2×2 ft block):
- Tomato (Indeterminate), Tomato (Determinate), Cherry Tomato
- Zucchini, Yellow Summer Squash, Butternut Squash, Pumpkin
- Watermelon, Cantaloupe

Cucumber (Vining) corrected to `spacingDensity: 2` (was 1).

## Plant Library editing
- **Edit modal** (`PlantEditModal`): unified spacing selector covers both per-sqft densities and 2×2 footprint. Saves `footprintFt` correctly — previously editing any large-footprint plant stripped `footprintFt`.
- **Restore Defaults** button: appears for built-in plants (matched by name against `defaultPlants.ts`). Resets all fields to defaults and sets `isCustom: false` so startup migration applies again.
- **Duplicate**: Copy icon on plant cards in `PlantsView`. Creates `"Copy of [name]"` with `isCustom: true`.
- Editing a default plant sets `isCustom: true`, forking it from the default. Restore Defaults reverts this.

## Calendar view
- Left label pane + right Gantt pane scroll in sync via `labelScrollRef` + `onScroll` handler.
- Batches (plantings sharing a `batchId`) group into a collapsible composite row:
  - Collapsed: shows batch summary (plant name, variety, ×N count, bed count), composite Gantt bar (min seed start → max expected harvest)
  - Expanded: indented sub-rows per individual planting, each with its own Gantt bar
- Batches of size 1 render as regular singles (no batch UI chrome).

## Deployment
- Live on Netlify (auto-deploys on every push to `master`)
- `.gitignore` excludes `dist/` — Netlify builds from source on their servers
- Netlify free tier: 300 build minutes/month — batch pushes to conserve

## Bed undo/redo
- `src/store/bedHistory.ts`: module-level undo/redo stacks (not in Zustand — no need to be reactive)
- Captures: `add-bed`, `delete-bed` (with full squares + plantings snapshot), `edit-bed` (before/after property save)
- Keyboard: Ctrl+Z / Ctrl+Y (or Ctrl+Shift+Z) in `GardenStage` keyboard handler
- Undo of delete-bed restores bed + all squares + plantings and re-selects the bed
- Max 20 entries

## ZIP frost date lookup
- `src/data/frostDates.ts`: ~90 range entries covering all US ZIP codes, keyed by 3-digit prefix
- `lookupFrostDates(zip)` returns `{ lastFrost, firstFrost }` as `YYYY-MM-DD` for current year, or null (frost-free / no data)
- Wired into `GardenSettingsModal`: auto-fills dates if fields are empty; shows "Apply" banner if dates already set
- Data is NOAA 32°F / 50% probability approximations — users are advised to verify locally

## Onboarding tooltip
- `AppShell` queries bed count via `useLiveQuery`
- Shows a bouncing green tooltip pointing at the Bed button when: garden exists + 0 beds + canvas view + not dismissed
- Dismissed permanently via `localStorage` key `hasEverCreatedBed` — only set when tooltip was actually visible and user drew their first bed
- Bed button gets a green ring highlight while tip is showing
- `bedButtonRef` passed from AppShell → Toolbar, positioned via `getBoundingClientRect()`

## Canvas sizing fix
- `CanvasView` ResizeObserver effect now depends on `[activeGardenId]` so it re-runs after garden creation (previously fired once on mount when `containerRef` was null)

## What's not done yet (as of 2026-05-25)
- Batch features: batch delete/move, plant-type change on a batch member with "change all or split" option
- PWA hardening / Lighthouse audit (intentionally deferred)
- Unit tests
- 3×3 footprint plants (e.g. large pumpkins)
- Subgrid multi-select
- Mobile/touch support
