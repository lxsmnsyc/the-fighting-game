import type AleaRNG from './alea';

const EPSILON = 0.0000001;

/**
 * The average chance of success for a PRD constant.
 */
function chanceFromConstant(c: number): number {
  const fails = Math.ceil(1 / c);
  let sum = 0;
  let previous = 0;

  // Simulate n successions
  for (let n = 1; n <= fails; n++) {
    const current = Math.min(1, n * c) * (1 - previous);
    previous += current;
    sum += n * current;
  }

  return 1 / sum;
}

// Binary search for the constant that averages out to `p`
function constantFromChance(p: number): number {
  let hi = p;
  let lo = 0;
  let mid = p * 0.5;
  let p1 = chanceFromConstant(mid);
  let p2 = 1;

  while (Math.abs(p1 - p2) > EPSILON) {
    if (p1 > p) {
      hi = mid;
    } else {
      lo = mid;
    }
    p2 = p1;
    mid = (hi + lo) * 0.5;
    p1 = chanceFromConstant(mid);
  }

  return mid;
}

/**
 * Pseudo-random distribution. Each failure raises the chance of the
 * next roll, so streaks of failures and successes stay short.
 */
export default class PRD {
  private readonly constant: number;

  // Rolls since the last success
  private progress = 1;

  constructor(
    private readonly rng: AleaRNG,
    public readonly chance: number,
  ) {
    this.constant = constantFromChance(chance);
  }

  next(): boolean {
    if (this.rng.random() < this.progress * this.constant) {
      this.progress = 1;
      return true;
    }
    this.progress++;
    return false;
  }

  reset(): void {
    this.progress = 1;
  }
}
