// Core puzzle logic: voting, backward induction, coin allocation

// ── Constants ─────────────────────────────────────────
export const NUM_PIRATES = 5;
export const TOTAL_COINS = 100;

// Fallback values: what each pirate gets if P5's proposal is rejected
// and P4 becomes the proposer.  Derived from backward induction:
//
//  2 pirates (P1, P2): P2 proposes [0, 100] — P2's own vote suffices.
//  3 pirates (P1–P3): P3 proposes [1, 0, 99] — buys P1 (would get 0).
//  4 pirates (P1–P4): P4 proposes [0, 1, 0, 99] — buys P2 (would get 0).
//  5 pirates (P1–P5): P5 proposes [1, 0, 1, 0, 98] — buys P1 & P3.
//
// Index 0 = P1 (Cabin Boy), … Index 4 = P5 (Captain)
export const FALLBACK = [0, 1, 0, 99, -1]; // P5 has no fallback (gets thrown off)

// Full backward induction table for the explanation screen
export const INDUCTION_TABLE = [
  { pirates: 2, proposer: 'P2', split: [0, 100],       votes: '1/2', pass: true },
  { pirates: 3, proposer: 'P3', split: [1, 0, 99],     votes: '2/3', pass: true },
  { pirates: 4, proposer: 'P4', split: [0, 1, 0, 99],  votes: '2/4', pass: true },
  { pirates: 5, proposer: 'P5', split: [1, 0, 1, 0, 98], votes: '3/5', pass: true },
];

// ── Voting logic ──────────────────────────────────────

// proposal: array of 5 integers [P1, P2, P3, P4, P5] summing to 100
// Returns: array of 5 booleans (true = AYE)
export function computeVotes(proposal) {
  return proposal.map((coins, i) => {
    // P5 (Captain, index 4) always votes for their own proposal
    if (i === 4) return true;
    // A pirate votes YES if they get strictly more than their fallback
    return coins > FALLBACK[i];
  });
}

// Count AYE votes
export function countAyes(votes) {
  return votes.filter(v => v).length;
}

// Does the proposal pass? (≥ 50% of 5 = ≥ 3)
export function proposalPasses(votes) {
  return countAyes(votes) >= 3;
}

// Is this the optimal proposal? (P5 keeps 98)
export function isOptimal(proposal) {
  return proposal[4] === 98;
}

// ── Allocation state ──────────────────────────────────

export function createAllocation() {
  return [0, 0, 0, 0, 0];
}

export function remaining(allocation) {
  return TOTAL_COINS - allocation.reduce((a, b) => a + b, 0);
}

// Adjust pirate i's allocation by delta, clamped to [0, remaining + current]
export function adjustAllocation(allocation, i, delta) {
  const alloc = [...allocation];
  const maxAdd = remaining(allocation);
  const newVal = Math.max(0, Math.min(TOTAL_COINS, alloc[i] + delta));
  // Don't allow total to exceed TOTAL_COINS
  const actualDelta = newVal - alloc[i];
  if (actualDelta > 0 && actualDelta > maxAdd) {
    alloc[i] += maxAdd;
  } else {
    alloc[i] = newVal;
  }
  return alloc;
}
