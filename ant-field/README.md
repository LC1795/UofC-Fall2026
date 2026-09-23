# LC — Ant Field

An interactive ant colony on a black canvas, with three sizes and colors. The default population is 400, all spawning at the central nest.

## Run locally

With Node.js 18 or newer, run `npm start` from this folder and open http://127.0.0.1:5173. No dependency installation is needed. Set `PORT` to choose another port, or open `dist/index.html` directly in a browser.

## Controls

- **Food / Walls:** click to place food or drag to draw solid barriers.
- **Generate food:** adds up to eight random sources in open space, using the current food weight.
- **Generate walls:** replaces walls with a smooth random-noise pattern, keeping the nest and existing food clear.
- **Restart ants:** respawns the colony at the nest and clears trails and delivery counters, preserving remaining food, walls, and settings.
- **Reset environment:** clears food, walls, trails, carried food, and counters without moving ants or changing settings.
- **Food weight:** maximum new-source value; each source randomly receives 20–100% of it.
- **Ants:** 10–3,000; default 400.
- **Scent decay:** 1–30 seconds; default 10.
- **Randomness:** 0–100%; default 30%. Controls additional wandering and exploratory trail breaks.
- **Dashboard arrow:** hides or restores the controls while the simulation continues.

With the canvas focused, Enter or Space adds random food in Food mode. Escape selects Food mode.

## Behavior

Each ant carries one food unit at a time. Loaded ants follow blue scent deposited by unloaded ants; unloaded ants follow amber scent deposited by loaded ants. Source strength is highest after nest contact or food pickup, decreases with time, and stops after 30 seconds without source renewal. Maximum-strength blending prevents repeated circling from amplifying a false source. Scent and visible trails fade using quarter-second history buckets.

Ants detect food or the nest within twice their own diameter, measured from the target edge; pickup and delivery require contact. There is no global homeward bias or timed return-home behavior. Ants retain up to 12 seconds of position samples to detect looping or confinement, then break away from scent for three seconds toward less-visited open space. This escape behavior works even at zero additional randomness.

Walls block movement for every ant size. Drawing or generating walls relocates any embedded ants to open space. Navigation is local, so enclosed regions can still trap ants or make food inaccessible. This is a simplified simulation rather than a calibrated biological model.

## Files

- `dist/index.html` — self-contained interface, rendering, and simulation.
- `server.cjs` — local static server using Node.js built-ins.

No external libraries, accounts, or network services are required.
