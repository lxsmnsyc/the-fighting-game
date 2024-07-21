export const enum DamageType {
  Magic = 1,
  Attack = 2,

  Physical = 3,
  Magical = 4,

  // Can trigger some damage events
  Pure = 3,

  // Does not trigger normal damage events either
  Poison = 4,
}
