// Duck entity — player-controlled, swims inside the lake

export class Duck {
  // Speed in pixels per second
  static SPEED = 80;

  constructor(lake) {
    this.lake = lake;
    this.reset();
  }

  reset() {
    this.x = this.lake.cx;
    this.y = this.lake.cy;
    this.vx = 0;
    this.vy = 0;
    this.orbiting = false;
    // Trail of recent positions for visual effect
    this.trail = [];
  }

  update(dt, keys) {
    const orbiting = keys.has('Space');
    let moving = false;
    this.orbiting = false;

    if (orbiting) {
      // Orbit mode: swim tangentially (CCW) at current radius
      const rx = this.x - this.lake.cx;
      const ry = this.y - this.lake.cy;
      const r = Math.sqrt(rx * rx + ry * ry);

      if (r > 1) { // need some radius to orbit
        // Tangent direction (CCW): perpendicular to radial, rotated 90° left
        const tx = -ry / r;
        const ty = rx / r;

        this.vx = tx * Duck.SPEED;
        this.vy = ty * Duck.SPEED;

        // Move along the circle: advance angle, keep radius fixed
        const angularStep = (Duck.SPEED / r) * dt;
        const currentAngle = Math.atan2(ry, rx);
        const newAngle = currentAngle + angularStep;
        this.orbiting = true;
        this.x = this.lake.cx + Math.cos(newAngle) * r;
        this.y = this.lake.cy + Math.sin(newAngle) * r;
        moving = true;
      }
    } else {
      // Normal movement: arrow keys / WASD
      let dx = 0;
      let dy = 0;
      if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1;
      if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1;
      if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;

      const mag = Math.sqrt(dx * dx + dy * dy);
      if (mag > 0) {
        dx /= mag;
        dy /= mag;
        moving = true;
      }

      this.vx = dx * Duck.SPEED;
      this.vy = dy * Duck.SPEED;

      const newX = this.x + this.vx * dt;
      const newY = this.y + this.vy * dt;

      const dist = this.lake.distFromCenter(newX, newY);
      if (dist <= this.lake.radius) {
        this.x = newX;
        this.y = newY;
      } else {
        const angle = Math.atan2(newY - this.lake.cy, newX - this.lake.cx);
        this.x = this.lake.cx + Math.cos(angle) * this.lake.radius;
        this.y = this.lake.cy + Math.sin(angle) * this.lake.radius;
      }
    }

    // Record trail
    if (moving) {
      this.trail.push({ x: this.x, y: this.y, t: 1.0 });
      if (this.trail.length > 60) this.trail.shift();
    }
    // Fade trail
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].t -= dt * 1.5;
      if (this.trail[i].t <= 0) this.trail.splice(i, 1);
    }
  }

  // Is the duck at the shore?
  isAtShore() {
    return this.lake.distFromCenter(this.x, this.y) >= this.lake.radius - 1;
  }

  // Angle of the duck relative to lake center
  angle() {
    return this.lake.angleOf(this.x, this.y);
  }

  // Facing angle (direction of movement), or 0 if stationary
  facing() {
    if (this.vx === 0 && this.vy === 0) return 0;
    return Math.atan2(this.vy, this.vx);
  }

  predictedExitAngle() {
    if (this.orbiting) return null;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed <= 1e-9) return null;

    const x = this.x - this.lake.cx;
    const y = this.y - this.lake.cy;
    const ux = this.vx / speed;
    const uy = this.vy / speed;
    const r2 = x * x + y * y;
    const dot = x * ux + y * uy;
    const radius = this.lake.radius;
    const discriminant = Math.max(0, dot * dot + radius * radius - r2);
    const t = -dot + Math.sqrt(discriminant);

    if (t < -1e-9) return null;

    const exitX = x + Math.max(0, t) * ux;
    const exitY = y + Math.max(0, t) * uy;
    return Math.atan2(exitY, exitX);
  }
}
