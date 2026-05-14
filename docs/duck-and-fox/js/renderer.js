// All canvas drawing: lake, entities, HUD, screens

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fontReady = false;
    // Check for font availability (Press Start 2P)
    document.fonts.ready.then(() => { this.fontReady = true; });
  }

  get W() { return this.canvas.width; }
  get H() { return this.canvas.height; }

  clear() {
    this.ctx.fillStyle = '#1a3a1a';
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  // ── Lake ──────────────────────────────────────────────

  drawLake(lake) {
    const ctx = this.ctx;

    // Shore border (sandy)
    ctx.beginPath();
    ctx.arc(lake.cx, lake.cy, lake.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#8B7355';
    ctx.fill();

    // Water
    ctx.beginPath();
    ctx.arc(lake.cx, lake.cy, lake.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f2a4a';
    ctx.fill();
  }

  // ── Hint overlay (R/4 circle) ─────────────────────────

  drawHint(lake) {
    const ctx = this.ctx;
    const hintRadius = lake.radius / 4;

    ctx.beginPath();
    ctx.arc(lake.cx, lake.cy, hintRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 100, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;

    // Label
    ctx.fillStyle = 'rgba(255, 255, 100, 0.6)';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('R/4', lake.cx, lake.cy - hintRadius - 6);
  }

  // ── Duck trail ────────────────────────────────────────

  drawTrail(trail) {
    const ctx = this.ctx;
    for (const p of trail) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 200, 255, ${p.t * 0.4})`;
      ctx.fill();
    }
  }

  // ── Duck sprite ───────────────────────────────────────

  drawDuck(duck) {
    const ctx = this.ctx;
    const x = Math.round(duck.x);
    const y = Math.round(duck.y);
    const s = 6; // half-size of sprite

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(duck.facing());

    // Body (yellow)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-s, -s + 2, s * 2 - 2, s * 2 - 4);

    // Head
    ctx.fillStyle = '#FFE44D';
    ctx.fillRect(s - 2, -s + 1, 4, 5);

    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(s, -s + 2, 2, 2);

    // Beak
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(s + 2, -s + 3, 3, 2);

    // Wing
    ctx.fillStyle = '#E6BE00';
    ctx.fillRect(-s + 1, -1, s - 1, 4);

    ctx.restore();
  }

  // ── Fox sprite ────────────────────────────────────────

  drawFox(fox) {
    const ctx = this.ctx;
    const pos = fox.pos();
    const x = Math.round(pos.x);
    const y = Math.round(pos.y);

    // Fox faces inward (toward lake center)
    const faceAngle = fox.angle + Math.PI;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(faceAngle);

    const s = 7;

    // Body (orange)
    ctx.fillStyle = '#E05500';
    ctx.fillRect(-s, -s + 2, s * 2 - 2, s * 2 - 4);

    // Head
    ctx.fillStyle = '#FF7722';
    ctx.fillRect(s - 3, -s, 6, 7);

    // Ears
    ctx.fillStyle = '#CC4400';
    ctx.fillRect(s - 2, -s - 3, 2, 4);
    ctx.fillRect(s + 1, -s - 3, 2, 4);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(s, -s + 2, 2, 2);

    // Snout
    ctx.fillStyle = '#FFE0C0';
    ctx.fillRect(s + 1, -s + 4, 3, 2);

    // Tail
    ctx.fillStyle = '#FFE0C0';
    ctx.fillRect(-s - 3, -2, 4, 3);
    ctx.fillStyle = '#E05500';
    ctx.fillRect(-s - 3, -2, 4, 1);

    ctx.restore();
  }

  // ── HUD ───────────────────────────────────────────────

  drawHUD(elapsed, showHintActive, isTouch, foxPolicyLabel = 'normal') {
    const ctx = this.ctx;
    const t = elapsed.toFixed(1);

    ctx.fillStyle = '#fff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`TIME: ${t}s`, this.W / 2, 20);

    if (!isTouch) {
      ctx.fillStyle = '#ccc';
      ctx.font = '12px monospace';
      ctx.fillText('WASD/Arrows: swim   Space: orbit', this.W / 2, this.H - 44);
      ctx.fillText(`H: hint ${showHintActive ? '(ON)' : '(OFF)'}`, this.W / 2, this.H - 28);
      ctx.fillStyle = foxPolicyLabel === 'smart' ? '#ffcc66' : '#ccc';
      ctx.fillText(`F: ${foxPolicyLabel.toUpperCase()} FOX`, this.W / 2, this.H - 12);
    }
  }

  // ── Touch controls overlay ─────────────────────────────

  drawTouchControls(touch, showHint) {
    const ctx = this.ctx;

    // Joystick base
    ctx.beginPath();
    ctx.arc(touch.joyCenter.x, touch.joyCenter.y, touch.joyRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Joystick thumb
    const tx = touch.joyCenter.x + touch.joyX * touch.joyRadius;
    const ty = touch.joyCenter.y + touch.joyY * touch.joyRadius;
    ctx.beginPath();
    ctx.arc(tx, ty, 14, 0, Math.PI * 2);
    ctx.fillStyle = touch.joyActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)';
    ctx.fill();

    // Orbit button
    ctx.beginPath();
    ctx.arc(touch.orbitCenter.x, touch.orbitCenter.y, touch.orbitRadius, 0, Math.PI * 2);
    ctx.fillStyle = touch.orbitActive ? 'rgba(100,200,255,0.35)' : 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Orbit label
    ctx.fillStyle = touch.orbitActive ? 'rgba(200,240,255,0.8)' : 'rgba(255,255,255,0.5)';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ORBIT', touch.orbitCenter.x, touch.orbitCenter.y);
    ctx.textBaseline = 'alphabetic';

    // Hint toggle button (top-right)
    ctx.beginPath();
    ctx.arc(touch.hintCenter.x, touch.hintCenter.y, touch.hintRadius, 0, Math.PI * 2);
    ctx.fillStyle = showHint ? 'rgba(255,255,100,0.3)' : 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = showHint ? 'rgba(255,255,100,0.6)' : 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = showHint ? 'rgba(255,255,150,0.9)' : 'rgba(255,255,255,0.5)';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', touch.hintCenter.x, touch.hintCenter.y);
    ctx.textBaseline = 'alphabetic';
  }

  // ── CRT scanline overlay ──────────────────────────────

  drawScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < this.H; y += 3) {
      ctx.fillRect(0, y, this.W, 1);
    }
  }

  // ── Title screen ─────────────────────────────────────

  drawTitle(blink, isTouch) {
    const ctx = this.ctx;

    this.clear();

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Duck and Fox', this.W / 2, this.H * 0.22);

    // Decorative line
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.W * 0.2, this.H * 0.27);
    ctx.lineTo(this.W * 0.8, this.H * 0.27);
    ctx.stroke();

    // Puzzle description — use a readable system font at a legible size
    ctx.fillStyle = '#ccc';
    ctx.font = '14px monospace';
    const lines = [
      'A duck sits at the center',
      'of a circular lake.',
      '',
      'A fox waits at the shore.',
      'It cannot swim, but runs',
      'at 3.5x the duck\'s speed.',
      '',
      'The duck must reach shore',
      'to fly away. Can it escape?',
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, this.W / 2, this.H * 0.35 + i * 20);
    });

    // Mini duck
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(this.W / 2 - 5, this.H * 0.80, 10, 8);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(this.W / 2 + 5, this.H * 0.80 + 2, 3, 2);

    // Mini fox
    ctx.fillStyle = '#E05500';
    ctx.fillRect(this.W / 2 - 5, this.H * 0.85, 10, 8);
    ctx.fillStyle = '#FFE0C0';
    ctx.fillRect(this.W / 2 + 5, this.H * 0.85 + 3, 3, 2);

    // Blinking prompt
    if (blink) {
      ctx.fillStyle = '#44ff44';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(isTouch ? 'TAP TO START' : 'PRESS ENTER TO START', this.W / 2, this.H * 0.92);
    }

    this.drawScanlines();
  }

  // ── Win screen ────────────────────────────────────────

  drawWin(elapsed, isTouch) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.fillStyle = '#44ff44';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU ESCAPED!', this.W / 2, this.H * 0.38);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Time: ${elapsed.toFixed(1)}s`, this.W / 2, this.H * 0.50);

    ctx.fillStyle = '#ccc';
    ctx.font = '14px monospace';
    ctx.fillText(isTouch ? 'Tap to play again' : 'Press Enter to play again', this.W / 2, this.H * 0.65);
  }

  // ── Lose screen ───────────────────────────────────────

  drawLose(isTouch) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.fillStyle = '#ff4444';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!', this.W / 2, this.H * 0.40);

    ctx.fillStyle = '#ccc';
    ctx.font = '14px monospace';
    ctx.fillText(isTouch ? 'Tap to retry' : 'Press Enter to retry', this.W / 2, this.H * 0.55);
  }
}
