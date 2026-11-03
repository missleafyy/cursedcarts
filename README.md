# Carl's Cursed Cartridges
Pawn-shop sim using the mechanics studied in ~/probably-stolen-study. Run: `./play.sh` on Linux, or double-click `play.bat` on Windows (opens Edge or Chrome as an app window; opening `index.html` in any modern browser also works). F11 fullscreen. Mouse, R rotates.
All art is the user's PNGs in art/raw, cropped by tools/cut_*.py. Pixels are never edited. Ask before changing them or adding art.
- game/data.js: items, conditions, clients, events, upgrades, names
- game/sim.js: price, haggle, heat, night tick (no drawing)
- game/story.js: scripted visits, Linda, inspector, endings
- game/ui.js: storefront, panels, grids. Hotspot coordinates are in `R`.
Tests: `tools/shot.sh "index.html?auto=150" x.png 1672,941 4000` balance bot; `?eval=...SMOKE()` clicks through a day (tools/smoke.js).

## Story and UI (added 2026-11-02)
- Story scenes: `STORY.BEATS` in game/story.js, each with a first day and optional condition. A scene counts only once the person reaches the window. Choices write to `G.story`; `STORY.NEWS` and `STORY.epilogue` read it. Dennis's handheld entries are `STORY.LOGS`.
- UI art: art/raw/ui.png, cut by tools/cut_ui.py (crop + background mask only) to art/ui/, drawn with `nine()` in game/ui.js.
- The Lot is art/raw/garbage_lot.png; searchable spots are `SPOTS` in game/ui.js.
- Tests: `?eval=SMOKE()`, `?eval=LOTSMOKE()`, `?eval=STORYTEST(pick,lot,only)` (see tools/).

## Inventory
Cells are 30px. Shapes come from each PNG's alpha: `python3 tools/make_shapes.py` writes game/shapes.js. `tools/item_sizes.json` holds final cell sizes; update it when an item's size changes.
