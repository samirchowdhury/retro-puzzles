// Touch input handling for mobile play

export const isTouchDevice =
  'ontouchstart' in window || navigator.maxTouchPoints > 0;

export class TouchInput {
  constructor(canvas, keys) {
    this.canvas = canvas;
    this.keys = keys;
    this.active = false; // true only during PLAYING state

    // Joystick state
    this.joyActive = false;
    this.joyX = 0; // -1 to 1
    this.joyY = 0;
    this.joyTouchId = null;

    // Orbit button state
    this.orbitActive = false;
    this.orbitTouchId = null;

    // Layout (canvas coordinates)
    this.joyCenter = { x: 90, y: 460 };
    this.joyRadius = 44;
    this.orbitCenter = { x: 390, y: 460 };
    this.orbitRadius = 34;

    // Hint toggle button (top-right)
    this.hintCenter = { x: 448, y: 20 };
    this.hintRadius = 16;
    this.hintCallback = null;

    this.deadZone = 0.2;
    this.tapCallback = null;

    if (isTouchDevice) {
      const opts = { passive: false };
      canvas.addEventListener('touchstart', e => this._start(e), opts);
      canvas.addEventListener('touchmove', e => this._move(e), opts);
      canvas.addEventListener('touchend', e => this._end(e), opts);
      canvas.addEventListener('touchcancel', e => this._end(e), opts);
    }
  }

  onTap(cb) { this.tapCallback = cb; }
  onHintToggle(cb) { this.hintCallback = cb; }

  // ── Coordinate helpers ──────────────────────────────

  _coords(touch) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - r.left) * (this.canvas.width / r.width),
      y: (touch.clientY - r.top) * (this.canvas.height / r.height),
    };
  }

  _hit(px, py, cx, cy, r) {
    return (px - cx) ** 2 + (py - cy) ** 2 <= (r * 2) ** 2;
  }

  // ── Touch event handlers ────────────────────────────

  _start(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const p = this._coords(t);

      if (this.active) {
        // Hint toggle
        if (this._hit(p.x, p.y, this.hintCenter.x, this.hintCenter.y, this.hintRadius)) {
          if (this.hintCallback) this.hintCallback();
          continue;
        }
        // Orbit button (check first — smaller, more specific)
        if (this.orbitTouchId === null &&
            this._hit(p.x, p.y, this.orbitCenter.x, this.orbitCenter.y, this.orbitRadius)) {
          this.orbitTouchId = t.identifier;
          this.orbitActive = true;
          this.keys.add('Space');
          continue;
        }
        // Joystick
        if (this.joyTouchId === null &&
            this._hit(p.x, p.y, this.joyCenter.x, this.joyCenter.y, this.joyRadius)) {
          this.joyTouchId = t.identifier;
          this.joyActive = true;
          this._updateJoy(p);
          continue;
        }
      }

      // Tap anywhere else (used for Enter on title / win / lose)
      if (this.tapCallback) this.tapCallback();
    }
  }

  _move(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === this.joyTouchId) {
        this._updateJoy(this._coords(t));
      }
    }
  }

  _end(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === this.joyTouchId) {
        this.joyTouchId = null;
        this.joyActive = false;
        this.joyX = 0;
        this.joyY = 0;
        this._clearDirs();
      }
      if (t.identifier === this.orbitTouchId) {
        this.orbitTouchId = null;
        this.orbitActive = false;
        this.keys.delete('Space');
      }
    }
  }

  // ── Joystick → key mapping ──────────────────────────

  _updateJoy(p) {
    let dx = (p.x - this.joyCenter.x) / this.joyRadius;
    let dy = (p.y - this.joyCenter.y) / this.joyRadius;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 1) { dx /= mag; dy /= mag; }
    this.joyX = dx;
    this.joyY = dy;

    this._clearDirs();
    if (mag < this.deadZone) return;

    // 8-directional mapping via angle
    const a = Math.atan2(dy, dx);
    const S = Math.PI / 8;
    if      (a > -S   && a <= S)    this.keys.add('ArrowRight');
    else if (a > S    && a <= 3*S)  { this.keys.add('ArrowRight'); this.keys.add('ArrowDown'); }
    else if (a > 3*S  && a <= 5*S)  this.keys.add('ArrowDown');
    else if (a > 5*S  && a <= 7*S)  { this.keys.add('ArrowLeft');  this.keys.add('ArrowDown'); }
    else if (a > 7*S  || a <= -7*S) this.keys.add('ArrowLeft');
    else if (a > -7*S && a <= -5*S) { this.keys.add('ArrowLeft');  this.keys.add('ArrowUp'); }
    else if (a > -5*S && a <= -3*S) this.keys.add('ArrowUp');
    else if (a > -3*S && a <= -S)   { this.keys.add('ArrowRight'); this.keys.add('ArrowUp'); }
  }

  _clearDirs() {
    this.keys.delete('ArrowUp');
    this.keys.delete('ArrowDown');
    this.keys.delete('ArrowLeft');
    this.keys.delete('ArrowRight');
  }
}
