// Fox entity — AI-controlled, runs along the lake perimeter

import { Lake } from './lake.js';

export class Fox {
  // Fox speed = 3.5× duck speed. Fox travels along the perimeter, so its
  // angular velocity = linear_speed / radius.  We store linear speed here
  // and convert in update().
  static SPEED_RATIO = 3.5;

  static POLICY_PROJECTION = 'projection';
  static POLICY_EXIT_AWARE = 'exit_aware';

  constructor(lake, duckSpeed, policy = Fox.POLICY_PROJECTION) {
    this.lake = lake;
    this.linearSpeed = duckSpeed * Fox.SPEED_RATIO;
    this.policy = policy;
    this.reset();
  }

  togglePolicy() {
    this.policy = this.policy === Fox.POLICY_PROJECTION
      ? Fox.POLICY_EXIT_AWARE
      : Fox.POLICY_PROJECTION;
  }

  policyLabel() {
    return this.policy === Fox.POLICY_EXIT_AWARE ? 'smart' : 'normal';
  }

  reset() {
    // Start at the top of the lake (angle = -π/2)
    this.angle = -Math.PI / 2;
  }

  update(dt, duck) {
    // Target: the angle from lake center toward the duck (its radial projection)
    const targetAngle = this.targetAngle(duck);

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

  targetAngle(duck) {
    const projectionAngle = duck.angle();
    if (this.policy !== Fox.POLICY_EXIT_AWARE) return projectionAngle;

    const exitAngle = duck.predictedExitAngle();
    if (exitAngle === null) return projectionAngle;

    const projectionDistance = Lake.angleDist(this.angle, projectionAngle);
    const exitDistance = Lake.angleDist(this.angle, exitAngle);

    // Tie-break toward the exit-aware target; it is the stricter fox.
    return exitDistance <= projectionDistance ? exitAngle : projectionAngle;
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
