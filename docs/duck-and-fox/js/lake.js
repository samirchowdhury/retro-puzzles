// Lake geometry — circular lake centered on canvas

export class Lake {
  constructor(canvasWidth, canvasHeight) {
    this.cx = canvasWidth / 2;
    this.cy = canvasHeight / 2;
    // Lake fills ~70% of the smaller canvas dimension
    this.radius = Math.min(canvasWidth, canvasHeight) * 0.35;
  }

  // Is (x, y) inside (or on) the lake?
  contains(x, y) {
    return this.distFromCenter(x, y) <= this.radius;
  }

  distFromCenter(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Angle from center to (x, y)
  angleOf(x, y) {
    return Math.atan2(y - this.cy, x - this.cx);
  }

  // Point on shore at given angle
  shorePoint(angle) {
    return {
      x: this.cx + Math.cos(angle) * this.radius,
      y: this.cy + Math.sin(angle) * this.radius,
    };
  }

  // Shortest signed angular distance from a to b (range -π to π)
  static angleDelta(a, b) {
    let d = b - a;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }

  // Shortest unsigned angular distance
  static angleDist(a, b) {
    return Math.abs(Lake.angleDelta(a, b));
  }
}
