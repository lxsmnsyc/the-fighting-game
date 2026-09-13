import { BASE_ROUND_INCOME, DEFAULT_GOLD, PHASE_INCOME, ROUNDS_PER_PHASE } from './constants';

/**
 * Gold earned when a battle in `phase` ends.
 */
export function getRoundIncome(phase: number): number {
  return BASE_ROUND_INCOME + PHASE_INCOME * (phase - 1);
}

/**
 * All the gold a player could have to spend by the shop of `round`: the
 * starting gold, plus the income of every round before it.
 */
export function getRoundBudget(round: number): number {
  let budget = DEFAULT_GOLD;
  for (let previous = 1; previous < round; previous++) {
    budget += getRoundIncome(Math.ceil(previous / ROUNDS_PER_PHASE));
  }
  return budget;
}
