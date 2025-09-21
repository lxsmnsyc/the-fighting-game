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

/**
 * Stat application priority
 */
export const enum StatPriority {
  Initial = 0,
  Additive = 1,
  Multiplicative = 2,
  Exact = 3,
  Post = 4,
}

/**
 * Stack application priority
 */
export const enum StackPriority {
  Initial = 0,
  Additive = 1,
  Multiplicative = 2,
  Exact = 3,
  Post = 4,
}

/**
 * Damage event priority
 */
export const enum DamagePriority {
  Initial = 0,
  AmplificationAdd = 1,
  AmplificationMult = 2,
  Critical = 3,
  Dodge = 4,
  Armor = 5,
  Corrosion = 6,
  ReductionAdditive = 7,
  ReductionMult = 8,
  Pre = 9,
  Exact = 10,
  Post = 11,
}

/**
 * Normal event priority
 */
export const enum EventPriority {
  Pre = 0,
  Exact = 1,
  Post = 2,
}

export const enum GameEvents {
  // Game
  Setup = 0,
  Start = 1,
  NextRound = 2,
  StartRound = 3,
  End = 4,
  // Card
  TriggerCard = 5,
  AcquireCard = 6,
  SellCard = 7,
  EnableCard = 8,
  DisableCard = 9,
  // Shop
  LockShop = 10,
  RerollShop = 11,
}

/**
 * Round Event types
 */
export const enum RoundEvents {
  Setup = 0,
  SetupUnit = 1,
  Start = 2,
  End = 3,
  Damage = 4,
  AddStack = 5,
  RemoveStack = 6,
  AddStat = 7,
  RemoveStat = 8,
  SetStack = 9,
  SetStat = 10,
  Tick = 11,
  ConsumeStack = 12,
  Heal = 13,
  TriggerStack = 14,
  Attack = 15,
}

/**
 * Damage types
 */
export const enum DamageType {
  Magical = 0,
  Physical = 1,

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
  /**
   * Damage missed
   */
  Missed = 0b0001,
  /**
   * Damage reduced by Armor
   */
  Armor = 0b0010,
  /**
   * Damage amplified by Corrosion
   */
  Corrosion = 0b0100,
  /**
   * Critical damage applied
   */
  Critical = 0b1000,
}

export const enum HealingFlags {
  /**
   * Healing missed
   */
  Missed = 0b0001,
}

export const enum TriggerStackFlags {
  Failed = 0b0001,
  NoConsume = 0b0010,
}

export const enum AttackFlags {
  Failed = 0b0001,
  NoConsume = 0b0010,
}

export const enum Stat {
  Health = 0,
  MaxHealth = 1,
}

export const enum PlayerStat {
  Life = 0,
  Gold = 1,
}

export const enum Stack {
  Attack = 0,
  Magic = 1,
  // Deals poison damage
  Poison = 2,
  // Blocks attack/magic damage
  Armor = 3,
  // Counters Armor
  Corrosion = 4,
  // Speeds up cycles of cards/abilities
  Speed = 5,
  // Counters Slow
  Slow = 6,
  // Dodges attacks
  Dodge = 7,
  // amplifies attacks
  Critical = 8,
  // Healing
  Healing = 9,
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
