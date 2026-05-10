// Main game loop, state machine, input handling

import { Renderer } from './renderer.js';
import {
  NUM_PIRATES, TOTAL_COINS,
  computeVotes, countAyes, proposalPasses, isOptimal,
  createAllocation, remaining, adjustAllocation,
} from './game.js';
import { PIRATES } from './pirate.js';

// ── Constants ─────────────────────────────────────────
const CANVAS_W = 480;
const CANVAS_H = 640;
const VOTE_DELAY = 1.2; // seconds between each pirate's vote

// ── State ─────────────────────────────────────────────
const State = { TITLE: 0, PROPOSING: 1, VOTING: 2, WIN: 3, LOSE: 4 };

let state = State.TITLE;
let allocation = createAllocation();
let votes = [];
let currentVoter = -1;
let voteTimer = 0;
let votingDone = false;
let winOptimal = false;
let elapsed = 0;
let blinkOn = true;
let selectedPirate = 4; // default to Captain (player)
let scrollOffset = 0;
let loseTimer = 0;

// ── Setup ─────────────────────────────────────────────
const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
canvas.focus();

const renderer = new Renderer(canvas);
let piratePositions = renderer.getPiratePositions();
let buttons = []; // current clickable regions

// ── Input: Keyboard ───────────────────────────────────

window.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' || e.code === 'Space') {
    e.preventDefault();
    handleAction();
  }

  if (state === State.PROPOSING) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      selectedPirate = Math.max(0, selectedPirate - 1);
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      selectedPirate = Math.min(NUM_PIRATES - 1, selectedPirate + 1);
    }
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      allocation = adjustAllocation(allocation, selectedPirate, 1);
    }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      allocation = adjustAllocation(allocation, selectedPirate, -1);
    }
    // +10 / -10 shortcuts
    if (e.code === 'PageUp' || e.code === 'BracketRight') {
      allocation = adjustAllocation(allocation, selectedPirate, 10);
    }
    if (e.code === 'PageDown' || e.code === 'BracketLeft') {
      allocation = adjustAllocation(allocation, selectedPirate, -10);
    }
  }

  if (state === State.WIN && winOptimal) {
    if (e.code === 'ArrowDown') scrollOffset = Math.min(scrollOffset + 30, 200);
    if (e.code === 'ArrowUp') scrollOffset = Math.max(scrollOffset - 30, 0);
  }

  // Prevent scrolling
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
}, { capture: true });

// ── Input: Mouse / Touch ──────────────────────────────

function canvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_W / rect.width;
  const scaleY = CANVAS_H / rect.height;

  let clientX, clientY;
  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function hitTest(x, y) {
  for (const btn of buttons) {
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      return btn;
    }
  }
  return null;
}

// Hold-to-repeat state
let holdInterval = null;
let holdTimeout = null;

function clearHold() {
  if (holdTimeout) { clearTimeout(holdTimeout); holdTimeout = null; }
  if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
}

function handlePointerDown(e) {
  e.preventDefault();
  const pos = canvasCoords(e);

  if (state === State.TITLE || state === State.WIN || state === State.LOSE) {
    handleAction();
    return;
  }

  if (state === State.PROPOSING) {
    const btn = hitTest(pos.x, pos.y);
    if (!btn || !btn.enabled) return;

    if (btn.action === 'propose') {
      handleAction();
      return;
    }

    // Immediate adjustment
    allocation = adjustAllocation(allocation, btn.pirate, btn.delta);

    // Hold-to-repeat for ±1 buttons
    if (Math.abs(btn.delta) === 1) {
      clearHold();
      holdTimeout = setTimeout(() => {
        holdInterval = setInterval(() => {
          allocation = adjustAllocation(allocation, btn.pirate, btn.delta);
        }, 80);
      }, 500);
    }
  }

  if (state === State.VOTING) {
    // Tap to speed up voting
    if (!votingDone && voteTimer > 0.3) {
      voteTimer = VOTE_DELAY;
    }
  }
}

function handlePointerUp(e) {
  e.preventDefault();
  clearHold();
}

canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mouseup', handlePointerUp);
canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
canvas.addEventListener('touchend', handlePointerUp, { passive: false });

// Scroll for win explanation
canvas.addEventListener('wheel', (e) => {
  if (state === State.WIN && winOptimal) {
    e.preventDefault();
    scrollOffset = Math.max(0, Math.min(200, scrollOffset + e.deltaY * 0.5));
  }
}, { passive: false });

// ── Game control ──────────────────────────────────────

function handleAction() {
  switch (state) {
    case State.TITLE:
      startProposing();
      break;
    case State.PROPOSING:
      if (remaining(allocation) === 0) {
        startVoting();
      }
      break;
    case State.VOTING:
      // Speed up or skip
      break;
    case State.WIN:
    case State.LOSE:
      startProposing();
      break;
  }
}

function startProposing() {
  state = State.PROPOSING;
  allocation = createAllocation();
  selectedPirate = 4;
  votes = [];
  currentVoter = -1;
  votingDone = false;
  scrollOffset = 0;
}

function startVoting() {
  state = State.VOTING;
  votes = computeVotes(allocation);
  currentVoter = -1;
  voteTimer = 0;
  votingDone = false;
  loseTimer = 0;
}

// ── Blink timer ───────────────────────────────────────
setInterval(() => { blinkOn = !blinkOn; }, 500);

// ── Game loop ─────────────────────────────────────────
let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  elapsed += dt;

  const ctx = renderer.ctx;

  switch (state) {
    case State.TITLE:
      renderer.drawTitle(blinkOn, elapsed);
      break;

    case State.PROPOSING: {
      renderer.drawBackground(elapsed);

      // Instruction text
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DIVIDE 100 COINS AMONG THE CREW', CANVAS_W / 2, CANVAS_H * 0.40);

      renderer.drawPirates(piratePositions, elapsed, selectedPirate);
      buttons = renderer.drawAllocationUI(allocation, remaining(allocation), piratePositions);

      // Keyboard hint at bottom
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('\u2190\u2192 select  \u2191\u2193 adjust  PgUp/Dn \u00b110  Enter propose', CANVAS_W / 2, CANVAS_H - 6);

      renderer.drawScanlines();
      break;
    }

    case State.VOTING: {
      voteTimer += dt;

      if (voteTimer >= VOTE_DELAY && !votingDone) {
        currentVoter++;
        voteTimer = 0;

        if (currentVoter >= NUM_PIRATES) {
          currentVoter = NUM_PIRATES - 1;
          votingDone = true;
        }
      }

      if (votingDone) {
        voteTimer += dt; // reuse for result delay
        if (voteTimer > 1.5 && loseTimer === 0) {
          loseTimer = 1; // trigger result
          if (proposalPasses(votes)) {
            winOptimal = isOptimal(allocation);
            renderer.spawnParticles();
            state = State.WIN;
          } else {
            state = State.LOSE;
            loseTimer = 0;
          }
        }
      }

      renderer.drawBackground(elapsed);
      if (currentVoter >= 0) {
        renderer.drawVotingScene(piratePositions, votes, currentVoter, allocation, elapsed);
      }

      // Title
      ctx.fillStyle = '#FFD700';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('THE CREW VOTES...', CANVAS_W / 2, 20);

      renderer.drawScanlines();
      break;
    }

    case State.WIN:
      loseTimer += dt;
      renderer.drawBackground(elapsed);
      renderer.drawWin(elapsed, winOptimal, allocation, scrollOffset);
      break;

    case State.LOSE:
      loseTimer += dt;
      renderer.drawBackground(elapsed);
      renderer.drawLose(loseTimer, allocation);
      break;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
