// Fox entity — AI-controlled, runs along the lake perimeter

import { Lake } from './lake.js';

export class Fox {
  // Fox speed = 4× duck speed. Fox travels along the perimeter, so its
  // angular velocity = linear_speed / radius.  We store linear speed here
  // and convert in update().
  static SPEED_RATIO = 4;

  constructor(lake, duckSpeed) {
    this.lake = lake;
    this.linearSpeed = duckSpeed * Fox.SPEED_RATIO;
    this.reset();
  }

  reset() {
    // Start at the top of the lake (angle = -π/2)
    this.angle = -Math.PI / 2;
  }

  update(dt, duck) {
    // Target: the angle from lake center toward the duck (its radial projection)
    const targetAngle = duck.angle();

    // Shortest angular direction to target
    const delta = Lake.angleDelta(this.angle, targetAngle);

    // Angular speed = linear speed / radius
    const angularSpeed = this.linearSpeed / this.lake.radius;
    const maxStep = angularSpeed * dt;

    if (Math.abs(delta) <= maxStep) {
      // Can reach the target this frame
      this.angle = targetAngle;
    } else {
      // Move toward target along the shorter arc
      this.angle += Math.sign(delta) * maxStep;
    }

    // Normalize to [-π, π]
    while (this.angle > Math.PI) this.angle -= 2 * Math.PI;
    while (this.angle < -Math.PI) this.angle += 2 * Math.PI;
  }

  // Position on shore
  pos() {
    return this.lake.shorePoint(this.angle);
  }

  // Per-frame angular travel (used for catch threshold)
  angularStepPerFrame(dt) {
    return (this.linearSpeed / this.lake.radius) * dt;
  }
}
