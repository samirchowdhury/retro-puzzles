// Pirate data: names, titles, quips, sprite colour palettes

export const PIRATES = [
  {
    rank: 1,
    title: 'Cabin Boy',
    name: 'Pip',
    color: '#8BC34A',
    quipYes: "A coin? I'll take it!",
    quipNo: "Nothin'?! I knew it!",
  },
  {
    rank: 2,
    title: 'Sailor',
    name: 'Salty Pete',
    color: '#2196F3',
    quipYes: 'Fair enough, Captain.',
    quipNo: "Ye be dreamin'!",
  },
  {
    rank: 3,
    title: 'Gunner',
    name: 'Big Bess',
    color: '#FF5722',
    quipYes: "Aye, I'll allow it.",
    quipNo: "I'll load the cannons!",
  },
  {
    rank: 4,
    title: 'First Mate',
    name: 'Rodrigo',
    color: '#9C27B0',
    quipYes: 'A wise proposal.',
    quipNo: 'Not a single doubloon?! MUTINY!',
  },
  {
    rank: 5,
    title: 'Captain',
    name: 'You',
    color: '#FFD700',
    quipYes: 'Aye!',
    quipNo: "...wait, that's me.",
  },
];

// Draw a pirate sprite at (x, y) — all pixel art, no images
// facing: 1 = front, dir only affects minor details
export function drawPirate(ctx, pirate, x, y, scale = 1) {
  const s = scale;
  ctx.save();
  ctx.translate(x, y);

  switch (pirate.rank) {
    case 1: drawCabinBoy(ctx, s); break;
    case 2: drawSailor(ctx, s); break;
    case 3: drawGunner(ctx, s); break;
    case 4: drawFirstMate(ctx, s); break;
    case 5: drawCaptain(ctx, s); break;
  }

  ctx.restore();
}

// ── Sprite helpers ─────────────────────────────────────

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// P1 — Cabin Boy: small, bandana, scrawny
function drawCabinBoy(ctx, s) {
  // Legs
  rect(ctx, -3 * s, 12 * s, 2 * s, 6 * s, '#8B6914');
  rect(ctx, 1 * s, 12 * s, 2 * s, 6 * s, '#8B6914');
  // Body (ragged shirt)
  rect(ctx, -4 * s, 2 * s, 8 * s, 10 * s, '#A0A060');
  // Arms
  rect(ctx, -6 * s, 3 * s, 2 * s, 8 * s, '#D2A67A');
  rect(ctx, 4 * s, 3 * s, 2 * s, 8 * s, '#D2A67A');
  // Head
  rect(ctx, -3 * s, -6 * s, 6 * s, 8 * s, '#D2A67A');
  // Bandana
  rect(ctx, -4 * s, -7 * s, 8 * s, 3 * s, '#E53935');
  // Eyes
  rect(ctx, -2 * s, -3 * s, 1 * s, 1 * s, '#000');
  rect(ctx, 1 * s, -3 * s, 1 * s, 1 * s, '#000');
  // Mouth
  rect(ctx, -1 * s, 0, 2 * s, 1 * s, '#000');
}

// P2 — Sailor: eye patch, striped shirt
function drawSailor(ctx, s) {
  // Legs
  rect(ctx, -3 * s, 14 * s, 3 * s, 6 * s, '#3E2723');
  rect(ctx, 1 * s, 14 * s, 3 * s, 6 * s, '#3E2723');
  // Body (striped shirt)
  for (let i = 0; i < 5; i++) {
    const col = i % 2 === 0 ? '#FFFFFF' : '#1565C0';
    rect(ctx, -5 * s, (2 + i * 2) * s, 10 * s, 2 * s, col);
  }
  // Arms
  rect(ctx, -7 * s, 3 * s, 2 * s, 9 * s, '#C9A86C');
  rect(ctx, 5 * s, 3 * s, 2 * s, 9 * s, '#C9A86C');
  // Head
  rect(ctx, -4 * s, -7 * s, 8 * s, 9 * s, '#C9A86C');
  // Eye patch (right eye)
  rect(ctx, 1 * s, -4 * s, 3 * s, 3 * s, '#000');
  // Left eye
  rect(ctx, -3 * s, -4 * s, 2 * s, 2 * s, '#000');
  // Mouth
  rect(ctx, -2 * s, 0, 3 * s, 1 * s, '#5D4037');
}

// P3 — Gunner: burly, bald, barrel-chested
function drawGunner(ctx, s) {
  // Legs
  rect(ctx, -4 * s, 16 * s, 3 * s, 6 * s, '#4E342E');
  rect(ctx, 1 * s, 16 * s, 3 * s, 6 * s, '#4E342E');
  // Body (big)
  rect(ctx, -6 * s, 2 * s, 12 * s, 14 * s, '#795548');
  // Belt
  rect(ctx, -6 * s, 12 * s, 12 * s, 2 * s, '#3E2723');
  rect(ctx, -1 * s, 12 * s, 2 * s, 2 * s, '#FFD700');
  // Arms (big)
  rect(ctx, -9 * s, 3 * s, 3 * s, 10 * s, '#C9A86C');
  rect(ctx, 6 * s, 3 * s, 3 * s, 10 * s, '#C9A86C');
  // Head (bald)
  rect(ctx, -4 * s, -8 * s, 8 * s, 10 * s, '#C9A86C');
  // Eyes
  rect(ctx, -3 * s, -4 * s, 2 * s, 2 * s, '#000');
  rect(ctx, 1 * s, -4 * s, 2 * s, 2 * s, '#000');
  // Scowl
  rect(ctx, -2 * s, 0, 4 * s, 1 * s, '#5D4037');
}

// P4 — First Mate: tricorn hat, coat
function drawFirstMate(ctx, s) {
  // Legs
  rect(ctx, -3 * s, 16 * s, 3 * s, 6 * s, '#1A237E');
  rect(ctx, 1 * s, 16 * s, 3 * s, 6 * s, '#1A237E');
  // Body (navy coat)
  rect(ctx, -5 * s, 2 * s, 10 * s, 14 * s, '#283593');
  // Coat buttons
  rect(ctx, 0, 4 * s, 1 * s, 1 * s, '#FFD700');
  rect(ctx, 0, 7 * s, 1 * s, 1 * s, '#FFD700');
  rect(ctx, 0, 10 * s, 1 * s, 1 * s, '#FFD700');
  // Arms
  rect(ctx, -7 * s, 3 * s, 2 * s, 10 * s, '#283593');
  rect(ctx, 5 * s, 3 * s, 2 * s, 10 * s, '#283593');
  // Hands
  rect(ctx, -7 * s, 13 * s, 2 * s, 2 * s, '#C9A86C');
  rect(ctx, 5 * s, 13 * s, 2 * s, 2 * s, '#C9A86C');
  // Head
  rect(ctx, -4 * s, -7 * s, 8 * s, 9 * s, '#C9A86C');
  // Tricorn hat
  rect(ctx, -6 * s, -10 * s, 12 * s, 3 * s, '#1B1B1B');
  rect(ctx, -4 * s, -13 * s, 8 * s, 3 * s, '#1B1B1B');
  rect(ctx, -3 * s, -14 * s, 6 * s, 1 * s, '#FFD700');
  // Eyes
  rect(ctx, -3 * s, -4 * s, 2 * s, 2 * s, '#000');
  rect(ctx, 1 * s, -4 * s, 2 * s, 2 * s, '#000');
  // Moustache
  rect(ctx, -3 * s, 0, 2 * s, 1 * s, '#3E2723');
  rect(ctx, 1 * s, 0, 2 * s, 1 * s, '#3E2723');
}

// P5 — Captain (player): fancy hat, red coat
function drawCaptain(ctx, s) {
  // Legs
  rect(ctx, -3 * s, 16 * s, 3 * s, 6 * s, '#1A1A1A');
  rect(ctx, 1 * s, 16 * s, 3 * s, 6 * s, '#1A1A1A');
  // Body (red captain coat)
  rect(ctx, -5 * s, 2 * s, 10 * s, 14 * s, '#B71C1C');
  // Gold trim
  rect(ctx, -5 * s, 2 * s, 1 * s, 14 * s, '#FFD700');
  rect(ctx, 4 * s, 2 * s, 1 * s, 14 * s, '#FFD700');
  // Buttons
  rect(ctx, 0, 4 * s, 1 * s, 1 * s, '#FFD700');
  rect(ctx, 0, 7 * s, 1 * s, 1 * s, '#FFD700');
  rect(ctx, 0, 10 * s, 1 * s, 1 * s, '#FFD700');
  // Arms
  rect(ctx, -7 * s, 3 * s, 2 * s, 10 * s, '#B71C1C');
  rect(ctx, 5 * s, 3 * s, 2 * s, 10 * s, '#B71C1C');
  // Epaulettes
  rect(ctx, -8 * s, 2 * s, 3 * s, 2 * s, '#FFD700');
  rect(ctx, 5 * s, 2 * s, 3 * s, 2 * s, '#FFD700');
  // Hands
  rect(ctx, -7 * s, 13 * s, 2 * s, 2 * s, '#C9A86C');
  rect(ctx, 5 * s, 13 * s, 2 * s, 2 * s, '#C9A86C');
  // Head
  rect(ctx, -4 * s, -7 * s, 8 * s, 9 * s, '#C9A86C');
  // Captain hat
  rect(ctx, -6 * s, -10 * s, 12 * s, 3 * s, '#1B1B1B');
  rect(ctx, -5 * s, -15 * s, 10 * s, 5 * s, '#1B1B1B');
  rect(ctx, -4 * s, -16 * s, 8 * s, 1 * s, '#FFD700');
  // Skull emblem on hat
  rect(ctx, -1 * s, -13 * s, 2 * s, 2 * s, '#FFFFFF');
  rect(ctx, -2 * s, -11 * s, 4 * s, 1 * s, '#FFFFFF');
  // Eyes
  rect(ctx, -3 * s, -4 * s, 2 * s, 2 * s, '#000');
  rect(ctx, 1 * s, -4 * s, 2 * s, 2 * s, '#000');
  // Beard
  rect(ctx, -3 * s, 0, 6 * s, 3 * s, '#3E2723');
}

// Draw a vote indicator (thumb up or down) above a pirate
export function drawVoteIndicator(ctx, x, y, isYes, scale = 1) {
  const s = scale;
  ctx.save();
  ctx.translate(x, y);

  if (isYes) {
    // Thumbs up — green
    rect(ctx, -3 * s, -2 * s, 6 * s, 8 * s, '#4CAF50');
    rect(ctx, -1 * s, -6 * s, 3 * s, 5 * s, '#4CAF50');
    // Outline highlight
    rect(ctx, -4 * s, -3 * s, 1 * s, 10 * s, '#388E3C');
    rect(ctx, 3 * s, -3 * s, 1 * s, 10 * s, '#388E3C');
  } else {
    // Thumbs down — red
    rect(ctx, -3 * s, -6 * s, 6 * s, 8 * s, '#F44336');
    rect(ctx, -1 * s, 1 * s, 3 * s, 5 * s, '#F44336');
    // Outline
    rect(ctx, -4 * s, -7 * s, 1 * s, 10 * s, '#C62828');
    rect(ctx, 3 * s, -7 * s, 1 * s, 10 * s, '#C62828');
  }

  ctx.restore();
}
