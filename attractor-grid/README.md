# LC — Attractor Grid

The original interactive 12-column × 18-row grid: stationary blue points, black square outlines, and a white background. Untransformed squares touch edge-to-edge.

## Run locally

With Node.js 18 or newer, open a terminal in this folder and run:

```sh
npm start
```

Open http://127.0.0.1:5174. No dependency installation is required. The grid uses port **5174**, while the separate ant simulation uses **5173**, so both can run together. Set the `PORT` environment variable to override the default.

You can also open `dist/index.html` directly in a browser.

## Controls

- Move the cursor or drag across the grid to attract the squares.
- **Rotation Influence:** 0–180 degrees.
- **Shift Influence:** 0–2 grid cells.
- Focus the canvas and use arrow keys to move the attractor; Escape resets it.

Each square receives stable, seeded random-uniform rotation and displacement values. Cursor proximity modulates those values without resampling them every frame. The blue points stay fixed, and the layout preserves equal horizontal and vertical spacing as the canvas resizes.

## Files

- `dist/index.html` — interface and styling.
- `dist/grid.js` — canvas drawing and interaction.
- `server.cjs` — local server using Node.js built-ins.

This project is independent of `../ant-field/` and does not change its files or behavior.
