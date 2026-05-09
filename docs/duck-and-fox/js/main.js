// Main game loop, state machine, input handling

import { Lake } from './lake.js';
import { Duck } from './duck.js';
import { Fox } from './fox.js';
import { Renderer } from './renderer.js';
import { TouchInput, isTouchDevice } from './touch.js';

// ── Constants ─────────────────────────────────────────
const CANVAS_W = 480;
const CANVAS_H = 520;

// ── State ─────────────────────────────────────────────
const State = { TITLE: 0, PLAYING: 1, WIN: 2, LOSE: 3 };

let state = State.TITLE;
let elapsed = 0;       // seconds in current round
let showHint = false;
let blinkOn = true;

// ── Setup ─────────────────────────────────────────────
const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
canvas.focus();

const renderer = new Renderer(canvas);
const lake = new Lake(CANVAS_W, CANVAS_H);
const duck = new Duck(lake);
const fox = new Fox(lake, Duck.SPEED);

// ── Touch (mobile) ────────────────────────────────────
const touchInput = new TouchInput(canvas, keys);
touchInput.onTap(() => {
  if (state === State.TITLE || state === State.WIN || state === State.LOSE) {
    startGame();
  }
});

// ── Input ─────────────────────────────────────────────
const keys = new Set();

// Use capture phase on window to intercept Space/arrows before browser scrolls
window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  // Also track by e.key for browsers where Space e.code differs
  if (e.key === ' ') keys.add('Space');

  if (e.code === 'Enter') {
    if (state === State.TITLE || state === State.WIN || state === State.LOSE) {
      startGame();
    }
  }

  if (e.code === 'KeyH' && state === State.PLAYING) {
    showHint = !showHint;
  }

  // Prevent arrow keys and space from scrolling the page
  if (e.code.startsWith('Arrow') || e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
  }
}, { capture: true });

window.addEventListener('keyup', (e) => {
  keys.delete(e.code);
  if (e.key === ' ') keys.delete('Space');
}, { capture: true });

// ── Game control ──────────────────────────────────────

function startGame() {
  state = State.PLAYING;
  elapsed = 0;
  showHint = false;
  duck.reset();
  fox.reset();
}

function checkWinLose(dt) {
  if (!duck.isAtShore()) return;

  const duckAngle = duck.angle();
  const gap = Lake.angleDist(duckAngle, fox.angle);

  // Catch threshold: fox's per-frame angular travel (handles discrete time
  // steps). The puzzle models duck and fox as points, so the threshold is
  // only what's needed for frame-rate discretisation — not sprite overlap.
  const threshold = fox.angularStepPerFrame(dt);

  if (gap <= threshold) {
    state = State.LOSE;
  } else {
    state = State.WIN;
  }
}

// ── Blink timer for title/prompt text ─────────────────
setInterval(() => { blinkOn = !blinkOn; }, 500);

// ── Game loop ─────────────────────────────────────────
let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
  lastTime = now;

  switch (state) {
    case State.TITLE:
      renderer.drawTitle(blinkOn, isTouchDevice);
      break;

    case State.PLAYING:
      elapsed += dt;
      touchInput.active = true;
      duck.update(dt, keys);
      fox.update(dt, duck);
      checkWinLose(dt);

      // Draw
      renderer.clear();
      renderer.drawLake(lake);
      if (showHint) renderer.drawHint(lake);
      renderer.drawTrail(duck.trail);
      renderer.drawDuck(duck);
      renderer.drawFox(fox);
      renderer.drawHUD(elapsed, showHint, isTouchDevice);
      if (isTouchDevice) renderer.drawTouchControls(touchInput);
      renderer.drawScanlines();
      break;

    case State.WIN:
      touchInput.active = false;
      renderer.drawWin(elapsed, isTouchDevice);
      break;

    case State.LOSE:
      touchInput.active = false;
      renderer.drawLose(isTouchDevice);
      break;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
