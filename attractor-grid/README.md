# LC — Attractor Grid

An interactive grid, initially 12 columns × 18 rows: stationary blue points, black square outlines, and a white background. Untransformed squares touch edge-to-edge.

## Run locally

With Node.js 18 or newer, open a terminal in this folder and run:

```sh
npm start
```

Open http://127.0.0.1:5174. No dependency installation is required. The grid uses port **5174**, while the separate ant simulation uses **5173**, so both can run together. Set the `PORT` environment variable to override the default.

You can open `dist/index.html` directly for basic pointer controls. Use localhost for camera and microphone permissions.

## Controls

- Move the cursor or drag across the grid to attract the squares.
- **Columns / Rows:** 1–40 each, with live counts while dragging.
- **Influence Radius:** 1–40 grid cells; default 6.
- **Rotation Influence:** 0–180 degrees.
- **Shift Influence:** 0–2 grid cells.
- **Enable mic / Use sliders:** microphone volume controls rotation and shift up to their slider limits. The meter shows audio intensity.
- **Mic sensitivity:** 0.1×–10× audio multiplier, capped at the rotation/shift limits.
- **Enable camera / Use mouse:** track the palm to position the attractor, using a mirrored preview and smoothed movement. Losing the hand holds the last position.
- **Proximity vibration:** a larger apparent palm produces stronger square vibration inside the influence radius. The percentage shows smoothed proximity. This estimates closeness from image size, not measured depth. Vibration settles when the hand disappears.
- Focus the canvas and use arrow keys to move the attractor; Escape resets it (mouse mode).

Each square receives stable, seeded random-uniform rotation and displacement values. Cursor proximity modulates those values without resampling them every frame. The blue points stay fixed, and the layout preserves equal horizontal and vertical spacing as the canvas resizes.

## Camera and microphone

Both inputs start only after their buttons are clicked and browser permission is granted. They work together: the camera controls position and proximity vibration, while microphone volume controls rotation and shift intensity. Turning an input off or leaving the page releases it. Permission errors leave manual control available.

Audio and video are processed in the browser without recording or upload. Camera tracking downloads MediaPipe Tasks Vision 0.10.21 and its hand-landmarker model from jsDelivr and Google storage, so it requires internet access for those assets.

## Files

- `dist/index.html` — interface and styling.
- `dist/grid.js` — canvas drawing and interaction.
- `server.cjs` — local server using Node.js built-ins.

This project is independent of `../ant-field/` and does not change its files or behavior.
