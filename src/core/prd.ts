import type { AleaRNG } from "./alea";

const EPSILON = 0.0000001;

/**
 * Calculate for P(C)
 */
function PfromC(c: number) {
  let sum = 0;

  /**
   * Simulate n successions
   */
  for (
    let n = 1, fails = Math.ceil(1 / c), ppon = 0, ppbn = 0;
    n <= fails;
    n++
  ) {
    ppon = Math.min(1, n * c) * (1 - ppbn);
    ppbn += ppon;

    sum += n * ppon;
  }

  return 1 / sum;
}

function CfromP(p: number) {
  let hi = p;
  let lo = 0;
  let mid = 0;
  let p1 = 0;
  let p2 = 1;

  while (true) {
    mid = (hi + lo) * 0.5;
    p1 = PfromC(mid);
    if (Math.abs(p1 - p2) <= EPSILON) {
      break;
    }

    if (p1 > p) {
      hi = mid;
    } else {
      lo = mid;
    }

    p2 = p1;
  }

  return mid;
}

export default class PRD {
  private constantC: number;

  /**
   * Keeps track of the iterations
   */
  private progress = 1;

  constructor(private rng: AleaRNG, public chance: number) {
    this.chance = chance;
    this.constantC = CfromP(chance);
  }

  /**
   * Gets the next success from the PRD
   */
  next() {
    // Roll
    const r = this.rng.random();

    // Check for the random success
    if (r < this.progress * this.constantC) {
      return true;
    }

    // Increment progress
    this.progress++;
    return false;
  }

  reset() {
    this.progress = 1;
  }
}
