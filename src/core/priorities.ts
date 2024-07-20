export const enum BuffPriority {
  Initial = 1,
  Additive = 2,
  Multiplicative = 3,
  Exact = 4,
  Post = 5,
}

export const enum DebuffPriority {
  Initial = 1,
  Additive = 2,
  Multiplicative = 3,
  Exact = 4,
  Post = 5,
}

export const enum DamagePriority {
  Initial = 1,
  Critical = 2,
  Evasion = 3,
  Custom = 4,
  Armor = 5,
  Pre = 6,
  Exact = 7,
  Post = 8,
}

export const enum EventPriority {
  Pre = 1,
  Exact = 2,
  Post = 3,
}
