import {
  BASE_CARD_SLOTS,
  BASE_ROUND_INCOME,
  DEFAULT_GOLD,
  PHASE_CARD_SLOTS,
  PHASE_INCOME,
  ROUNDS_PER_PHASE,
  SELL_RATIO,
} from './constants';

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

/**
 * How many cards a player can hold in `phase`: `BASE_CARD_SLOTS`, plus
 * `PHASE_CARD_SLOTS` for each phase beaten.
 */
export function getCardSlots(phase: number): number {
  return BASE_CARD_SLOTS + PHASE_CARD_SLOTS * (phase - 1);
}

/**
 * Gold refunded for selling a card worth `price`.
 */
export function getSellPrice(price: number): number {
  return Math.floor(price * SELL_RATIO);
}
