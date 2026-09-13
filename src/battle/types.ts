/**
 * Priority scale for events that carry a value. `Initial` is where a
 * mechanic writes the base value. `Additive` and `Multiplicative` are
 * for modifiers, applied in that order.
 */
export const enum ValuePriority {
  Initial = 0,
  Additive = 1,
  Multiplicative = 2,
  Pre = 3,
  Exact = 4,
  Post = 5,
}

/**
 * Priority scale for `UnitDamage`. Each defensive or offensive energy
 * resolves at its own step, before the damage lands on `Exact`.
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

export const enum DamageType {
  Magical = 0,
  Physical = 1,
  // Skips Armor and Corrosion
  Poison = 3,
  // Skips Armor and Corrosion
  Pure = 4,
  // Skips Armor and Corrosion
  HealthLoss = 5,
}

export const enum Stat {
  Health = 0,
  MaxHealth = 1,
}

export const enum Energy {
  Attack = 0,
  Magic = 1,
  // Deals poison damage
  Poison = 2,
  // Blocks attack/magic damage
  Armor = 3,
  // Counters Armor
  Corrosion = 4,
  // Speeds up cooldown of cards/abilities
  Speed = 5,
  // Counters Speed
  Slow = 6,
  // Dodges attacks
  Dodge = 7,
  // Amplifies attacks
  Critical = 8,
  // Healing
  Healing = 9,
}

export const ENERGIES: Energy[] = [
  Energy.Attack,
  Energy.Magic,
  Energy.Poison,
  Energy.Armor,
  Energy.Corrosion,
  Energy.Speed,
  Energy.Slow,
  Energy.Dodge,
  Energy.Critical,
  Energy.Healing,
];

export type UnitStats = Record<Stat, number>;

export type UnitEnergy = Record<Energy, number>;

export function createEnergyField(): UnitEnergy {
  return {
    [Energy.Attack]: 0,
    [Energy.Magic]: 0,
    [Energy.Poison]: 0,
    [Energy.Armor]: 0,
    [Energy.Corrosion]: 0,
    [Energy.Speed]: 0,
    [Energy.Slow]: 0,
    [Energy.Dodge]: 0,
    [Energy.Critical]: 0,
    [Energy.Healing]: 0,
  };
}
