const boardSize = 20;
const tileSize = 20;
const tickMs = 120;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const themeToggleEl = document.getElementById("theme-toggle");

const swipeThreshold = 24;
const themeStorageKey = "snake-theme-mode";
const themeModes = ["light", "dark", "auto"];

let themeMode = "auto";
let systemThemeMediaQuery = null;

let snake;
let direction;
let queuedDirection;
let food;
let score;
let best;
let started;
let paused;
let gameOver;
let rafId;
let lastFrameTime = 0;
let accumulator = 0;

let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;
let activePointerId = null;

function randomCell() {
  return {
    x: Math.floor(Math.random() * boardSize),
    y: Math.floor(Math.random() * boardSize),
  };
}

function placeFood() {
  let cell = randomCell();
  while (snake.some((segment) => segment.x === cell.x && segment.y === cell.y)) {
    cell = randomCell();
  }
  food = cell;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  queuedDirection = direction;
  score = 0;
  started = false;
  paused = false;
  gameOver = false;
  accumulator = 0;
  scoreEl.textContent = "0";
  statusEl.textContent = "Press Space to start";
  placeFood();
  draw();
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
}

function cssVar(name, fallback) {
  const value = getComputedStyle(document.body).getPropertyValue(name).trim();
  return value || fallback;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = cssVar("--board-bg", "#edf6ff");
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCell(food.x, food.y, cssVar("--food-color", "#38bdf8"));

  snake.forEach((segment, index) => {
    const color =
      index === 0
        ? cssVar("--snake-head-color", "#2563eb")
        : cssVar("--snake-body-color", "#1d4ed8");
    drawCell(segment.x, segment.y, color);
  });
}


function resolveTheme(mode) {
  if (mode === "auto") {
    return systemThemeMediaQuery && systemThemeMediaQuery.matches ? "dark" : "light";
  }
  return mode;
}

function updateThemeToggleLabel(mode) {
  if (!themeToggleEl) {
    return;
  }

  if (mode === "light") {
    themeToggleEl.textContent = "☀️ Light";
    return;
  }

  if (mode === "dark") {
    themeToggleEl.textContent = "🌙 Dark";
    return;
  }

  themeToggleEl.textContent = "🖥️ Auto";
}

function applyThemeMode(mode, persist = true) {
  const nextMode = themeModes.includes(mode) ? mode : "auto";
  themeMode = nextMode;

  if (persist) {
    localStorage.setItem(themeStorageKey, nextMode);
  }

  document.body.dataset.theme = resolveTheme(nextMode);
  updateThemeToggleLabel(nextMode);

  if (snake) {
    draw();
  }
}

function cycleThemeMode() {
  const index = themeModes.indexOf(themeMode);
  const nextMode = themeModes[(index + 1) % themeModes.length];
  applyThemeMode(nextMode);
}

function initTheme() {
  if (window.matchMedia) {
    systemThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (themeMode === "auto") {
        applyThemeMode("auto", false);
      }
    };

    if (systemThemeMediaQuery.addEventListener) {
      systemThemeMediaQuery.addEventListener("change", handleSystemThemeChange);
    } else if (systemThemeMediaQuery.addListener) {
      systemThemeMediaQuery.addListener(handleSystemThemeChange);
    }
  }

  const savedThemeMode = localStorage.getItem(themeStorageKey);
  applyThemeMode(savedThemeMode || "auto", false);

  if (themeToggleEl) {
    themeToggleEl.addEventListener("click", cycleThemeMode);
  }
}

function isOpposite(next, current) {
  return next.x === -current.x && next.y === -current.y;
}

function step() {
  if (!isOpposite(queuedDirection, direction)) {
    direction = queuedDirection;
  }

  const head = snake[0];
  const newHead = {
    x: (head.x + direction.x + boardSize) % boardSize,
    y: (head.y + direction.y + boardSize) % boardSize,
  };

  if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
    gameOver = true;
    statusEl.textContent = "Game over! Press R to restart";
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 1;
    scoreEl.textContent = String(score);
    if (score > best) {
      best = score;
      localStorage.setItem("snake-best", String(best));
      bestEl.textContent = String(best);
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function loop(timestamp) {
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const delta = Math.min(timestamp - lastFrameTime, 250);
  lastFrameTime = timestamp;

  if (!started || paused || gameOver) {
    accumulator = 0;
    rafId = requestAnimationFrame(loop);
    return;
  }

  accumulator += delta;

  while (accumulator >= tickMs) {
    step();
    accumulator -= tickMs;
    if (gameOver) {
      accumulator = 0;
      break;
    }
  }

  rafId = requestAnimationFrame(loop);
}

function startLoop() {
  if (!rafId) {
    rafId = requestAnimationFrame(loop);
  }
}

function handleDirection(key) {
  const map = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const next = map[key];
  if (next) {
    queuedDirection = next;
  }
}

function triggerPrimaryAction() {
  if (!started) {
    started = true;
    paused = false;
    accumulator = 0;
    statusEl.textContent = "Good luck!";
    return;
  }

  if (!gameOver) {
    paused = !paused;
    accumulator = 0;
    statusEl.textContent = paused ? "Paused" : "Good luck!";
  }
}

function applySwipe(deltaX, deltaY) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < swipeThreshold && absY < swipeThreshold) {
    triggerPrimaryAction();
    return;
  }

  if (absX > absY) {
    handleDirection(deltaX > 0 ? "ArrowRight" : "ArrowLeft");
  } else {
    handleDirection(deltaY > 0 ? "ArrowDown" : "ArrowUp");
  }
}

function onPointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }
  event.preventDefault();
  touchStartX = event.clientX;
  touchStartY = event.clientY;
  touchActive = true;
  activePointerId = event.pointerId;
}

function onPointerUp(event) {
  if (!touchActive || event.pointerId !== activePointerId) {
    return;
  }
  event.preventDefault();
  const deltaX = event.clientX - touchStartX;
  const deltaY = event.clientY - touchStartY;
  touchActive = false;
  activePointerId = null;
  applySwipe(deltaX, deltaY);
}

function onTouchStart(event) {
  if (event.touches.length !== 1) {
    return;
  }
  event.preventDefault();
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchActive = true;
}

function onTouchEnd(event) {
  if (!touchActive || event.changedTouches.length === 0) {
    return;
  }
  event.preventDefault();
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  touchActive = false;
  applySwipe(deltaX, deltaY);
}

function registerTouchControls() {
  if (window.PointerEvent) {
    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
    canvas.addEventListener("pointerup", onPointerUp, { passive: false });
    canvas.addEventListener("pointercancel", onPointerUp, { passive: false });
    return;
  }

  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: false });
  canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });
}

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (key === "r") {
    resetGame();
    return;
  }

  if (key === " ") {
    triggerPrimaryAction();
    return;
  }

  handleDirection(key);
});

initTheme();
registerTouchControls();
best = Number(localStorage.getItem("snake-best") || 0);
bestEl.textContent = String(best);
resetGame();
startLoop();
