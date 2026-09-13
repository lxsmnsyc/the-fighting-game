/**
 * Editions of a card
 */
export const enum Edition {
  Common = 0,
}

/**
 * Print types, stackable
 */
export const enum Print {
  Error = 0b00001,
  Negative = 0b00010,
  Monotone = 0b00100,
}

/**
 * Rarity of a card
 */
export const enum Rarity {
  // Starter cards are the cards that are offered
  // initially by the card pool. Purchasing a starter
  // card of an aspect unlocks Common cards of the same
  // aspect
  Starter = 0,
  // 5 copies of Common cards are added to the card pool after being
  // unlocked by the starter card of the same aspect.
  // Unlocks Uncommon cards.
  Common = 1,
  // 3 copies of Uncommon cards are added to the card pool after
  // purchasing a common card.
  // Unlocks rare cards.
  Uncommon = 2,
  // A single copy of rare card is added to the card pool
  // after purchasing an uncommon card.
  // Unlocks secret card.
  Rare = 3,
  // The highest rarity
  Secret = 4,
}

export const enum PlayerStat {
  Life = 0,
  Gold = 1,
}

export const enum Aspect {
  Universal = 0,
  Health = 1,
  Attack = 2,
  Magic = 3,
  Poison = 4,
  Armor = 5,
  Corrosion = 6,
  Speed = 7,
  Slow = 8,
  Dodge = 9,
  Critical = 10,
  Healing = 11,
}

export interface PrintSpawnChance {
  [Print.Error]: number;
  [Print.Monotone]: number;
  [Print.Negative]: number;
}
