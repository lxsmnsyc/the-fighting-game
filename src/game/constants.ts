import { Rarity } from './types';

export const DEFAULT_GOLD = 5;

export const DEFAULT_LIFE = 3;

/**
 * Rounds in a phase. The last one is a boss.
 */
export const ROUNDS_PER_PHASE = 3;

export const SHOP_SIZE = 5;

/**
 * Cards a player can hold in the first phase.
 */
export const BASE_CARD_SLOTS = 5;

/**
 * Card slots gained for each phase beaten.
 */
export const PHASE_CARD_SLOTS = 2;

/**
 * Abilities offered to choose from.
 */
export const ABILITY_OFFER_SIZE = 5;

/**
 * Phases between ability offers. The first offer comes with the first
 * round.
 */
export const ABILITY_PHASE_INTERVAL = 8;

/**
 * Weight a card gains in rolls for each aspect it shares with an owned
 * ability. Every card starts at a weight of 1.
 */
export const ABILITY_BIAS = 2;

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

/**
 * Cards of one rarity to acquire before the next rarity unlocks: Common
 * cards unlock Uncommon ones, and Uncommon cards unlock Rare ones.
 */
export const RARITY_UNLOCK_COUNT = 10;

export const CARD_PRICES: Record<Rarity, number> = {
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
  [Rarity.Common]: 5,
  [Rarity.Uncommon]: 3,
  [Rarity.Rare]: 1,
  [Rarity.Secret]: 1,
};

/**
 * How much more gold a boss spends on cards than a regular opponent.
 */
export const BOSS_BUDGET_MULTIPLIER = 1.5;

/**
 * A battle still going after this long, in milliseconds, is a draw.
 */
export const BATTLE_TIME_LIMIT = 60_000;
