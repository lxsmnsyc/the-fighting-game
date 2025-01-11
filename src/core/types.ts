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
  AmplificationAdd = 2,
  AmplificationMult = 3,
  Critical = 4,
  Evasion = 5,
  Armor = 6,
  Corrosion = 7,
  ReductionAdditive = 8,
  ReductionMult = 9,
  Pre = 10,
  Exact = 11,
  Post = 12,
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
  Heal = 16,
}

export const enum CardEventType {
  Trigger = 1,
  Enable = 2,
  Disable = 3,
  Acquire = 4,
  Sell = 5,
}

/**
 * Damage types
 */
export const enum DamageType {
  Magic = 1,
  Attack = 2,

  // Does not trigger normal damage events either
  Poison = 3,
  // Can trigger some damage events
  Pure = 4,
  // Does not trigger damage events
  HealthLoss = 5,
}

/**
 * Damage flags
 */
export const enum DamageFlags {
  Missed = 0b0001,
  Armor = 0b0010,
  Corrosion = 0b0100,
  Critical = 0b1000,
}

export const enum HealingFlags {
  Missed = 0b0001,
}

export const enum Stat {
  MaxHealth = 1,
  Health = 2,
}

export const enum Stack {
  Attack = 1,
  Magic = 2,
  // Deals poison damage
  Poison = 3,
  // Blocks attack/magic damage
  Armor = 4,
  // Counters Armor
  Corrosion = 5,
  // Speeds up cycles of cards/abilities
  Speed = 6,
  // Counters Slow
  Slow = 7,
  // Dodges attacks
  Evasion = 8,
  // amplifies attacks
  Critical = 9,
  // Healing
  Healing = 10,
}

export const enum Aspect {
  Universal = 1,
  Health = 2,
  Attack = 3,
  Magic = 4,
  Poison = 5,
  Armor = 6,
  Corrosion = 7,
  Speed = 8,
  Slow = 9,
  Evasion = 10,
  Critical = 11,
  Healing = 12,
}

export interface PrintSpawnChance {
  [Print.Error]: number;
  [Print.Monotone]: number;
  [Print.Negative]: number;
  [Print.Signed]: number;
}
