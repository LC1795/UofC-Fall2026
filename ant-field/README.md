# LC — Ant Field

An interactive canvas simulation on a black background, with three ant categories distinguished by size, color, and speed.

## Run locally

Install Node.js 18 or newer, then run these commands from this folder:

```sh
npm start
```

Open http://127.0.0.1:5173. No dependencies need to be installed. Set the `PORT` environment variable to use another port. You can also open `dist/index.html` directly in a browser.

## Controls

- **Place food:** click or tap on open space. Enter or Space while the canvas is focused places food randomly.
- **Food weight:** sets the maximum value of new food. Each food source receives a random integer between 20% and 100% of this value.
- **Amount of ants:** changes the population live from 10 to 3,000; the default is 1,000.
- **Draw obstacles:** drag to paint barriers. Ants cannot pass through them. Existing food and the central nest remain clear.
- **Clear obstacles:** removes all barriers. Escape switches back to food mode when the canvas is focused.

Ants collect one unit at a time and deliver it to the central nest. Food-carrying ants reinforce a shared pheromone field; searching ants sample nearby scent and turn toward stronger trails. Both visible trails and scent fade linearly over approximately 10 seconds, using quarter-second history buckets. Ants discover nearby food instead of knowing every food location.

This is a simplified, biologically inspired simulation, not a calibrated model of a specific ant species. Obstacle avoidance uses local steering, so fully enclosed food or ants can remain trapped. Reducing the ant count drops any carried food at the retiring ants' positions to preserve the food total.

## Files

- `dist/index.html` — self-contained interface, rendering, and simulation.
- `server.cjs` — local static server using Node.js built-ins.

No external libraries, accounts, or network services are required by the simulation.
