# Classic Snake Game Starter

This repo now contains a small, complete starter for a classic Snake game built with plain HTML, CSS, and JavaScript.

## Quick start

1. From this project folder, start a local static server:
   ```bash
   cd /workspace/Test
   python3 -m http.server 8000
   ```
2. Open one of these URLs in your browser:
   - <http://localhost:8000>
   - <http://127.0.0.1:8000>
   - <http://localhost:8000/index.html>
3. Press **Space** to start/pause, use **Arrow keys** or **WASD** to move. On mobile, **swipe on the game board** to move and **tap** to start/pause.
4. If you lose, press **R** to restart.
5. Use the **theme button** near the title to cycle modes in order: **Auto → Light → Dark → Auto** (`Auto` follows your system theme).

## How to test it

### Manual smoke test (30 seconds)

1. Confirm the page title says **Classic Snake**.
2. Click the **theme switch** and verify it cycles **Light / Dark / Auto**.
3. Press **Space** and verify the snake starts moving.
4. Press **Space** again and verify status shows **Paused**.
5. Press **R** and verify score resets to `0`.
6. Eat at least 1 food and verify score increases.

### If you see “Not Found”

This usually means the server was started from the wrong folder.

Fix:
```bash
# Stop old server (Ctrl+C), then run from repo root:
cd /workspace/Test
python3 -m http.server 8000
```

Or run with an explicit directory from anywhere:
```bash
python3 -m http.server 8000 --directory /workspace/Test
```

Then open:
- <http://localhost:8000/index.html>


## Step-by-step (Google Chrome)

1. Open **Terminal**.
2. Run:
   ```bash
   cd /workspace/Test
   python3 -m http.server 8000
   ```
3. Keep that terminal window open (it is now serving your game files).
4. Open **Google Chrome**.
5. In Chrome, go to: <http://localhost:8000/index.html>
6. Start testing controls:
   - Press **Space** to start.
   - Use **Arrow keys** (or **WASD**) to move.
   - Press **Space** to pause/resume.
   - Press **R** to restart after losing.
7. Verify expected behavior:
   - Score increases when snake eats food.
   - Best score is saved between refreshes (localStorage).
8. When done, return to terminal and press **Ctrl+C** to stop the server.

### Chrome troubleshooting

- If Chrome shows `Not Found`, make sure you opened exactly:
  - <http://localhost:8000/index.html>
- If Chrome says site can’t be reached, ensure the server is running and terminal has no errors.
- If port 8000 is in use, run:
  ```bash
  python3 -m http.server 8080
  ```
  Then open <http://localhost:8080/index.html>.


### Mobile touch controls

- **Swipe** on the canvas to change direction (up/down/left/right).
- **Tap** the canvas to start or pause/resume.
- On iPad/mobile browsers, controls use **Pointer Events** when available, with **Touch Events** fallback.
- Small movements are ignored (swipe threshold) to avoid accidental turns.
- Keyboard controls still work on desktop browsers.

## Project structure

- `index.html` – Game layout and UI labels.
- `style.css` – Simple retro styling.
- `script.js` – Core game loop and snake logic.

## How to extend

- Add walls/obstacles.
- Add increasing speed based on score milestones.
- Add touch controls for mobile.
- Add sounds and themes.
