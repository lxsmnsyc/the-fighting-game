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
  Common = 1,
  Uncommon = 2,
  Rare = 3,
  Secret = 4,
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
  CritMultiplier = 5,
}

export const enum Stack {
  // Counters Poison
  Cure = 1,
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
  // Improves chances
  Luck = 7,
  // Counters Luck
  Curse = 8,
  // Healing
  Recovery = 9,
  // Counters Recovery
  Plague = 10,
}
