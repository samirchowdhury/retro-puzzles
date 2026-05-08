// Main game loop, state machine, input handling

import { Lake } from './lake.js';
import { Duck } from './duck.js';
import { Fox } from './fox.js';
import { Renderer } from './renderer.js';

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

const renderer = new Renderer(canvas);
const lake = new Lake(CANVAS_W, CANVAS_H);
const duck = new Duck(lake);
const fox = new Fox(lake, Duck.SPEED);

// ── Input ─────────────────────────────────────────────
const keys = new Set();

document.addEventListener('keydown', (e) => {
  keys.add(e.code);

  if (e.code === 'Enter') {
    if (state === State.TITLE || state === State.WIN || state === State.LOSE) {
      startGame();
    }
  }

  if (e.code === 'KeyH' && state === State.PLAYING) {
    showHint = !showHint;
  }

  // Prevent arrow keys from scrolling the page
  if (e.code.startsWith('Arrow')) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  keys.delete(e.code);
});

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

  // Catch threshold: the larger of the fox's per-frame angular step
  // or the angular width of the fox sprite (~14px on a perimeter of 2πR)
  const spriteAngularWidth = 14 / (2 * Math.PI * lake.radius) * (2 * Math.PI);
  const frameStep = fox.angularStepPerFrame(dt);
  const threshold = Math.max(frameStep, spriteAngularWidth);

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
      renderer.drawTitle(blinkOn);
      break;

    case State.PLAYING:
      elapsed += dt;
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
      renderer.drawHUD(elapsed, showHint);
      renderer.drawScanlines();
      break;

    case State.WIN:
      // Keep the game scene visible behind the overlay
      renderer.drawWin(elapsed);
      break;

    case State.LOSE:
      renderer.drawLose();
      break;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
