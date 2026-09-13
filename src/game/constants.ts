import { Rarity } from './types';

export const DEFAULT_GOLD = 5;

export const DEFAULT_LIFE = 3;

/**
 * Phases to clear to win the run.
 */
export const PHASES = 8;

/**
 * Rounds in a phase. The last one is a boss.
 */
export const ROUNDS_PER_PHASE = 3;

export const SHOP_SIZE = 5;

/**
 * Gold earned when a battle ends, before the phase bonus.
 */
export const BASE_ROUND_INCOME = 5;

/**
 * Extra income for each phase past the first.
 */
export const PHASE_INCOME = 1;

export const BASE_REROLL_COST = 1;

/**
 * How much each reroll in one shop visit adds to the next.
 */
export const REROLL_COST_STEP = 1;

export const CARD_PRICES: Record<Rarity, number> = {
  [Rarity.Starter]: 1,
  [Rarity.Common]: 3,
  [Rarity.Uncommon]: 5,
  [Rarity.Rare]: 8,
  [Rarity.Secret]: 12,
};

/**
 * Share of a card's price refunded when it is sold.
 */
export const SELL_RATIO = 0.5;

/**
 * How many copies of one card the player can own.
 */
export const COPY_LIMITS: Record<Rarity, number> = {
  [Rarity.Starter]: 1,
  [Rarity.Common]: 5,
  [Rarity.Uncommon]: 3,
  [Rarity.Rare]: 1,
  [Rarity.Secret]: 1,
};

export const BOSS_BONUS_CARDS = 2;

/**
 * A battle still going after this long, in milliseconds, is a draw.
 */
export const BATTLE_TIME_LIMIT = 60_000;
