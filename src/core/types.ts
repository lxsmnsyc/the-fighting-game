/**
 * Editions of a card
 */
export const enum Edition {
  Common = 1,
}

/**
 * Print types, stackable
 */
export const enum Print {
  Error = 0b0001,
  Negative = 0b0010,
  Monotone = 0b0100,
  Signed = 0b1000,
}

/**
 * Rarity of a card
 */
export const enum Rarity {
  // Starter cards are the cards that are offered
  // initially by the card pool. Purchasing a starter
  // card of an aspect unlocks Common cards of the same
  // aspect
  Starter = 1,
  // 5 copies of Common cards are added to the card pool after being
  // unlocked by the starter card of the same aspect.
  // Unlocks Uncommon cards.
  Common = 2,
  // 3 copies of Uncommon cards are added to the card pool after
  // purchasing a common card.
  // Unlocks rare cards.
  Uncommon = 3,
  // A single copy of rare card is added to the card pool
  // after purchasing an uncommon card.
  // Unlocks secret card.
  Rare = 4,
  // Only a selected set of secret cards is added to the card pool
  // (not all of the secret cards of the same aspect).
  Secret = 5,
}

/**
 * Stat application priority
 */
export const enum StatPriority {
  Initial = 1,
  Additive = 2,
  Multiplicative = 3,
  Exact = 4,
  Post = 5,
}

/**
 * Stack application priority
 */
export const enum StackPriority {
  Initial = 1,
  Additive = 2,
  Multiplicative = 3,
  Exact = 4,
  Post = 5,
}

/**
 * Damage event priority
 */
export const enum DamagePriority {
  Initial = 1,
  InitialAdditive = 2,
  InitialMultiplicative = 3,
  Critical = 3,
  Custom = 5,
  CustomAdditive = 6,
  CustomMultiplicative = 7,
  Armor = 8,
  Pre = 9,
  PreAdditive = 10,
  PreMultiplicative = 11,
  Exact = 12,
  Post = 13,
}

/**
 * Normal event priority
 */
export const enum EventPriority {
  Pre = 1,
  Exact = 2,
  Post = 3,
}

/**
 *
 */
export const enum GameEventType {
  Setup = 1,
  Start = 2,
  End = 3,
  NextRound = 4,
  OpenShop = 5,
}

/**
 * Round Event types
 */
export const enum RoundEventType {
  Setup = 3,
  Start = 4,
  End = 5,
  Damage = 7,
  AddStack = 8,
  RemoveStack = 9,
  AddStat = 10,
  RemoveStat = 11,
  SetStack = 12,
  SetStat = 13,
  Tick = 14,
  ConsumeStack = 15,
}

/**
 * Damage types
 */
export const enum DamageType {
  Magic = 1,
  Attack = 2,

  Physical = 3,
  Magical = 4,

  // Can trigger some damage events
  Pure = 5,
  // Does not trigger damage events
  HealthLoss = 6,

  // Does not trigger normal damage events either
  Poison = 7,
}

/**
 * Damage flags
 */
export const enum DamageFlags {
  Critical = 0b0001,
  Missed = 0b0010,
  Reduced = 0b0100,
}

export const enum Stat {
  MaxHealth = 1,
  Health = 2,
  Attack = 3,
  Magic = 4,
}

export const enum Stack {
  // Deals poison damage
  Poison = 1,
  // Blocks attack/magic damage
  Armor = 2,
  // Counters Armor
  Corrosion = 3,
  // Speeds up cycles of cards/abilities
  Speed = 4,
  // Counters Slow
  Slow = 5,
  // Improves chances
  Luck = 6,
  // Counters Luck
  Curse = 7,
  // Healing
  Recovery = 8,
}
