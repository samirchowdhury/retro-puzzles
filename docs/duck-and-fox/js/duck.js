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
    // Trail of recent positions for visual effect
    this.trail = [];
  }

  update(dt, keys) {
    const orbiting = keys.has('Space');
    let moving = false;

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
}
