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
  InitialAdditive = 2,
  InitialMultiplicative = 3,
  Critical = 3,
  Evasion = 4,
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

export const enum EventPriority {
  Pre = 1,
  Exact = 2,
  Post = 3,
}
