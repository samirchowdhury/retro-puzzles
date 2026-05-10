// All canvas drawing: backgrounds, sprites, UI, screens

import { PIRATES, drawPirate, drawVoteIndicator } from './pirate.js';
import { NUM_PIRATES, TOTAL_COINS, INDUCTION_TABLE } from './game.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fontReady = false;
    document.fonts.ready.then(() => { this.fontReady = true; });

    // Pre-generate stars
    this.stars = [];
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.28,
        size: Math.random() < 0.3 ? 2 : 1,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    // Gold rain particles (win screen)
    this.particles = [];
  }

  get W() { return this.canvas.width; }
  get H() { return this.canvas.height; }

  // ── Background ──────────────────────────────────────

  drawBackground(time) {
    const ctx = this.ctx;

    // Night sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.H * 0.35);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(1, '#1a1a4e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H * 0.35);

    // Stars
    for (const star of this.stars) {
      const alpha = 0.5 + 0.5 * Math.sin(time * 2 + star.twinkle);
      ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    // Moon
    ctx.fillStyle = '#FFFDE7';
    ctx.beginPath();
    ctx.arc(this.W - 50, 40, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a2e';
    ctx.beginPath();
    ctx.arc(this.W - 44, 36, 15, 0, Math.PI * 2);
    ctx.fill();

    // Ocean
    const oceanTop = this.H * 0.30;
    const oceanGrad = ctx.createLinearGradient(0, oceanTop, 0, this.H * 0.38);
    oceanGrad.addColorStop(0, '#0a2a4a');
    oceanGrad.addColorStop(1, '#0f1a3a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, oceanTop, this.W, this.H * 0.08);

    // Wave line
    ctx.strokeStyle = '#1a4a6a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < this.W; x += 2) {
      const wy = oceanTop + 2 + Math.sin(x * 0.03 + time * 1.5) * 2;
      x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
    }
    ctx.stroke();

    // Ship deck (wooden planks)
    const deckTop = this.H * 0.35;
    ctx.fillStyle = '#5D3A1A';
    ctx.fillRect(0, deckTop, this.W, this.H - deckTop);

    // Plank lines
    ctx.strokeStyle = '#4A2E14';
    ctx.lineWidth = 1;
    for (let py = deckTop; py < this.H; py += 12) {
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(this.W, py);
      ctx.stroke();
    }
    // Vertical plank seams
    ctx.strokeStyle = '#4A2E14';
    for (let px = 30; px < this.W; px += 60) {
      const offset = (Math.floor(px / 60) % 2) * 6;
      for (let py = deckTop + offset; py < this.H; py += 24) {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + 12);
        ctx.stroke();
      }
    }

    // Ship railing
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, deckTop - 4, this.W, 6);
    // Railing posts
    for (let rx = 20; rx < this.W; rx += 50) {
      ctx.fillRect(rx, deckTop - 14, 4, 14);
    }
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(0, deckTop - 14, this.W, 3);
  }

  // ── Treasure chest (title screen) ───────────────────

  drawTreasureChest(x, y) {
    const ctx = this.ctx;
    // Chest body
    ctx.fillStyle = '#6D4C1A';
    ctx.fillRect(x - 20, y, 40, 24);
    // Lid
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(x - 22, y - 8, 44, 10);
    // Metal bands
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x - 22, y - 8, 44, 2);
    ctx.fillRect(x - 20, y + 10, 40, 2);
    // Lock
    ctx.fillRect(x - 3, y + 4, 6, 6);
    // Gold coins spilling out
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x - 12 + i * 5, y - 2 + (i % 2) * 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFA000';
      ctx.beginPath();
      ctx.arc(x - 12 + i * 5, y - 2 + (i % 2) * 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Coin pile below pirate ──────────────────────────

  drawCoinPile(x, y, count) {
    const ctx = this.ctx;
    if (count <= 0) return;

    const maxCoins = Math.min(count, 20); // visual cap
    const rows = Math.ceil(maxCoins / 5);
    for (let r = 0; r < rows; r++) {
      const inRow = Math.min(5, maxCoins - r * 5);
      for (let c = 0; c < inRow; c++) {
        const cx = x - (inRow - 1) * 3 + c * 6;
        const cy = y + r * 5;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA000';
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ── Allocation UI buttons ───────────────────────────
  // Returns array of button hit-rects for input handling

  drawAllocationUI(allocation, remainingCoins, piratePositions) {
    const ctx = this.ctx;
    const buttons = [];

    // "Remaining" counter at top
    ctx.fillStyle = remainingCoins > 0 ? '#FFD700' : '#4CAF50';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`REMAINING: ${remainingCoins}`, this.W / 2, this.H * 0.42);

    const btnH = 24;
    const btnW = 34;
    const btnGap = 2;

    for (let i = 0; i < NUM_PIRATES; i++) {
      const px = piratePositions[i].x;
      const baseY = piratePositions[i].y + 40;

      // Coin count
      ctx.fillStyle = '#FFD700';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`${allocation[i]}`, px, baseY);

      // Draw coin pile (grows downward)
      this.drawCoinPile(px, baseY + 14, allocation[i]);

      // 2×2 button grid: row 0 = [-10, +10], row 1 = [-1, +1]
      const gridTop = baseY + 40;
      const btnLayout = [
        { label: '-10', delta: -10, col: 0, row: 0 },
        { label: '+10', delta: 10,  col: 1, row: 0 },
        { label: '-1',  delta: -1,  col: 0, row: 1 },
        { label: '+1',  delta: 1,   col: 1, row: 1 },
      ];
      const gridW = 2 * btnW + btnGap;
      const gridStartX = px - gridW / 2;

      for (const bl of btnLayout) {
        const bx = gridStartX + bl.col * (btnW + btnGap);
        const by = gridTop + bl.row * (btnH + btnGap);

        const canDec = allocation[i] > 0 && bl.delta < 0;
        const canInc = remainingCoins > 0 && bl.delta > 0;
        const enabled = bl.delta < 0 ? canDec : canInc;

        ctx.fillStyle = enabled ? '#3E2723' : '#2A1A0A';
        ctx.fillRect(bx, by, btnW, btnH);
        ctx.strokeStyle = enabled ? '#8D6E63' : '#4A3020';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, btnW, btnH);

        ctx.fillStyle = enabled ? '#FFFFFF' : '#5A4A3A';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bl.label, bx + btnW / 2, by + btnH / 2);

        buttons.push({
          x: bx, y: by, w: btnW, h: btnH,
          pirate: i, delta: bl.delta, enabled,
        });
      }
    }

    ctx.textBaseline = 'alphabetic';

    // PROPOSE button
    const propW = 160;
    const propH = 36;
    const propX = (this.W - propW) / 2;
    const propY = this.H - 50;
    const propEnabled = remainingCoins === 0;

    ctx.fillStyle = propEnabled ? '#1B5E20' : '#2A1A0A';
    ctx.fillRect(propX, propY, propW, propH);
    ctx.strokeStyle = propEnabled ? '#4CAF50' : '#4A3020';
    ctx.lineWidth = 2;
    ctx.strokeRect(propX, propY, propW, propH);

    ctx.fillStyle = propEnabled ? '#FFFFFF' : '#5A4A3A';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PROPOSE!', this.W / 2, propY + propH / 2 + 4);

    buttons.push({
      x: propX, y: propY, w: propW, h: propH,
      action: 'propose', enabled: propEnabled,
    });

    return buttons;
  }

  // ── Pirates row ─────────────────────────────────────

  getPiratePositions() {
    const positions = [];
    const spacing = this.W / (NUM_PIRATES + 1);
    const y = this.H * 0.56;
    for (let i = 0; i < NUM_PIRATES; i++) {
      positions.push({ x: Math.round(spacing * (i + 1)), y });
    }
    return positions;
  }

  drawPirates(positions, time, selectedIndex) {
    const ctx = this.ctx;
    for (let i = 0; i < NUM_PIRATES; i++) {
      const p = positions[i];
      const bob = Math.sin(time * 2 + i * 1.2) * 2;

      // Selection highlight
      if (i === selectedIndex) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(p.x - 14, p.y - 22 + bob - 4, 28, 50);
        ctx.setLineDash([]);
      }

      drawPirate(ctx, PIRATES[i], p.x, p.y + bob, 1.2);

      // Name label
      ctx.fillStyle = PIRATES[i].color;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(PIRATES[i].title, p.x, p.y - 28 + bob);
    }
  }

  // ── Voting scene ────────────────────────────────────

  drawVotingScene(positions, votes, currentVoter, allocation, time) {
    const ctx = this.ctx;

    // Draw pirates with vote indicators
    for (let i = 0; i < NUM_PIRATES; i++) {
      const p = positions[i];
      drawPirate(ctx, PIRATES[i], p.x, p.y, 1.2);

      // Label
      ctx.fillStyle = PIRATES[i].color;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(PIRATES[i].title, p.x, p.y - 28);

      // Allocation number
      ctx.fillStyle = '#FFD700';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText(`${allocation[i]}`, p.x, p.y + 36);

      // Vote indicator if already voted
      if (i < currentVoter) {
        drawVoteIndicator(ctx, p.x + 16, p.y - 18, votes[i], 1.2);
      }

      // Current voter — speech bubble
      if (i === currentVoter) {
        const quip = votes[i] ? PIRATES[i].quipYes : PIRATES[i].quipNo;
        this.drawSpeechBubble(p.x, p.y - 50, quip);

        // Blinking vote indicator
        if (Math.sin(time * 6) > 0) {
          drawVoteIndicator(ctx, p.x + 16, p.y - 18, votes[i], 1.2);
        }
      }
    }

    // Tally
    const ayes = votes.slice(0, currentVoter + 1).filter(v => v).length;
    const nays = (currentVoter + 1) - ayes;
    ctx.fillStyle = '#4CAF50';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`AYE: ${ayes}`, 16, this.H - 16);
    ctx.fillStyle = '#F44336';
    ctx.textAlign = 'right';
    ctx.fillText(`NAY: ${nays}`, this.W - 16, this.H - 16);
  }

  drawSpeechBubble(x, y, text) {
    const ctx = this.ctx;
    ctx.font = '6px "Press Start 2P", monospace';
    const tw = ctx.measureText(text).width;
    const bw = tw + 16;
    const bh = 20;
    const bx = Math.max(4, Math.min(this.W - bw - 4, x - bw / 2));
    const by = y - bh;

    // Bubble
    ctx.fillStyle = '#FFFDE7';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    // Pointer
    ctx.fillStyle = '#FFFDE7';
    ctx.beginPath();
    ctx.moveTo(x - 4, by + bh);
    ctx.lineTo(x + 4, by + bh);
    ctx.lineTo(x, by + bh + 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.beginPath();
    ctx.moveTo(x - 4, by + bh);
    ctx.lineTo(x, by + bh + 6);
    ctx.lineTo(x + 4, by + bh);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#3E2723';
    ctx.textAlign = 'center';
    ctx.fillText(text, bx + bw / 2, by + 13);
  }

  // ── CRT scanlines ──────────────────────────────────

  drawScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < this.H; y += 3) {
      ctx.fillRect(0, y, this.W, 1);
    }
  }

  // ── Title screen ───────────────────────────────────

  drawTitle(blink, time) {
    const ctx = this.ctx;

    this.drawBackground(time);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pirates and', this.W / 2, this.H * 0.08);
    ctx.fillText('Treasure', this.W / 2, this.H * 0.12);

    // Decorative line
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.W * 0.15, this.H * 0.145);
    ctx.lineTo(this.W * 0.85, this.H * 0.145);
    ctx.stroke();

    // Treasure chest
    this.drawTreasureChest(this.W / 2, this.H * 0.17);

    // Rules text
    ctx.fillStyle = '#ddd';
    ctx.font = '11px monospace';
    const lines = [
      'Five pirates must divide',
      '100 gold coins.',
      '',
      'You are the Captain (rank 5).',
      'Propose a split, then all vote.',
      '',
      'If at least 50% agree,',
      'the gold is divided.',
      '',
      'If not... you walk the plank,',
      'and the next pirate tries.',
      '',
      'All pirates are extremely',
      'smart and extremely greedy.',
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, this.W / 2, this.H * 0.32 + i * 17);
    });

    // Mini pirates preview
    const previewY = this.H * 0.82;
    const spacing = this.W / 6;
    for (let i = 0; i < 5; i++) {
      drawPirate(ctx, PIRATES[i], spacing * (i + 1), previewY, 0.8);
    }

    // Blinking prompt
    if (blink) {
      ctx.fillStyle = '#44ff44';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('PRESS ENTER / TAP TO START', this.W / 2, this.H * 0.95);
    }

    this.drawScanlines();
  }

  // ── Win screen ─────────────────────────────────────

  drawWin(time, isOptimalSolution, allocation, scrollOffset) {
    const ctx = this.ctx;

    // Darken
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, this.W, this.H);

    // Gold rain particles
    this.updateParticles(time);
    for (const p of this.particles) {
      ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isOptimalSolution) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PERFECT!', this.W / 2, 40);

      ctx.fillStyle = '#fff';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText('Maximum loot secured!', this.W / 2, 64);

      // Show the proposal
      ctx.fillStyle = '#ccc';
      ctx.font = '11px monospace';
      ctx.fillText(`Your split: [${allocation.join(', ')}]`, this.W / 2, 90);

      // Backward induction explanation
      ctx.fillStyle = '#FFD700';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('HOW IT WORKS:', this.W / 2, 120);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#ddd';

      const explanationLines = [
        'Think backwards from 2 pirates:',
        '',
        'If only P1 & P2 remain:',
        '  P2 takes 100, P1 gets 0.',
        '  (P2\'s own vote = 50%)',
        '',
        'If P1, P2 & P3 remain:',
        '  P3 offers P1 just 1 coin.',
        '  P1 votes YES (beats 0).',
        '  Split: [1, 0, 99]',
        '',
        'If P1–P4 remain:',
        '  P4 offers P2 just 1 coin.',
        '  P2 votes YES (beats 0).',
        '  Split: [0, 1, 0, 99]',
        '',
        'With all 5 pirates (you):',
        '  Offer P1 and P3 just 1 each.',
        '  Both vote YES (beats 0).',
        '  You keep 98!',
        '  Split: [1, 0, 1, 0, 98]',
      ];

      const startY = 140 - scrollOffset;
      explanationLines.forEach((line, i) => {
        const ly = startY + i * 16;
        if (ly > 110 && ly < this.H - 40) {
          ctx.textAlign = line.startsWith('  ') ? 'left' : 'center';
          const lx = line.startsWith('  ') ? 40 : this.W / 2;
          ctx.fillText(line, lx, ly);
        }
      });

      // Scroll hint if content overflows
      const contentH = explanationLines.length * 16;
      if (contentH > this.H - 180) {
        ctx.fillStyle = '#888';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SCROLL FOR MORE', this.W / 2, this.H - 48);
      }

      ctx.fillStyle = '#44ff44';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS ENTER / TAP TO PLAY AGAIN', this.W / 2, this.H - 20);
    } else {
      // Suboptimal win
      ctx.fillStyle = '#4CAF50';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU SURVIVED!', this.W / 2, this.H * 0.25);

      ctx.fillStyle = '#ccc';
      ctx.font = '11px monospace';
      ctx.fillText(`Your split: [${allocation.join(', ')}]`, this.W / 2, this.H * 0.34);
      ctx.fillText(`You kept: ${allocation[4]} coins`, this.W / 2, this.H * 0.39);

      ctx.fillStyle = '#FFD700';
      ctx.font = '10px monospace';
      const tease = [
        'But a shrewder captain',
        'would keep more gold...',
        '',
        'Can you do better?',
      ];
      tease.forEach((line, i) => {
        ctx.fillText(line, this.W / 2, this.H * 0.48 + i * 20);
      });

      ctx.fillStyle = '#44ff44';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('PRESS ENTER / TAP TO TRY AGAIN', this.W / 2, this.H * 0.75);
    }

    this.drawScanlines();
  }

  // ── Lose screen ────────────────────────────────────

  drawLose(time, allocation) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.fillStyle = '#F44336';
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WALK THE PLANK!', this.W / 2, this.H * 0.22);

    // Plank animation
    const plankW = 80;
    const plankX = this.W / 2 - plankW / 2;
    const plankY = this.H * 0.32;
    ctx.fillStyle = '#6D4C1A';
    ctx.fillRect(plankX, plankY, plankW, 8);

    // Captain walking off
    const walkProgress = Math.min(1, (time % 3) / 2);
    const captX = plankX + walkProgress * (plankW + 20);
    const captY = plankY - 20 + (walkProgress > 0.8 ? (walkProgress - 0.8) * 100 : 0);
    if (walkProgress < 0.95) {
      drawPirate(ctx, PIRATES[4], captX, captY, 0.8);
    }

    // Splash
    if (walkProgress > 0.85) {
      ctx.fillStyle = '#1a4a6a';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('SPLASH!', this.W / 2, this.H * 0.48);
    }

    ctx.fillStyle = '#ccc';
    ctx.font = '11px monospace';
    ctx.fillText(`Your proposal: [${allocation.join(', ')}]`, this.W / 2, this.H * 0.58);
    ctx.fillText('The crew rejected your plan.', this.W / 2, this.H * 0.63);

    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    ctx.fillText('Think about what each pirate', this.W / 2, this.H * 0.72);
    ctx.fillText('would get if you were gone...', this.W / 2, this.H * 0.76);

    ctx.fillStyle = '#44ff44';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('PRESS ENTER / TAP TO RETRY', this.W / 2, this.H * 0.90);

    this.drawScanlines();
  }

  // ── Gold rain particles ────────────────────────────

  spawnParticles() {
    this.particles = [];
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.W,
        y: -Math.random() * this.H,
        vy: 30 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 20,
        size: 2 + Math.random() * 3,
        alpha: 0.6 + Math.random() * 0.4,
      });
    }
  }

  updateParticles(time) {
    for (const p of this.particles) {
      p.y += p.vy * 0.016;
      p.x += p.vx * 0.016;
      if (p.y > this.H) {
        p.y = -10;
        p.x = Math.random() * this.W;
      }
    }
  }
}
