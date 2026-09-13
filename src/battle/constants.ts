import { Energy } from './types';

export const DEFAULT_MAX_HEALTH = 1000;

export const DEFAULT_CRITICAL_MULTIPLIER = 2;

/**
 * Share of the consumable energy spent each time it is consumed.
 */
export const CONSUMABLE_STACKS = 0.4;

/**
 * How often energies without their own cooldown tick, in milliseconds.
 */
export const NATURAL_PERIOD = 1000;

/**
 * Whether an energy goes on the unit that gains it. The rest are put
 * on an enemy instead.
 */
export const SELF_STACK: Record<Energy, boolean> = {
  [Energy.Attack]: true,
  [Energy.Magic]: true,
  [Energy.Armor]: true,
  [Energy.Corrosion]: false,
  [Energy.Critical]: true,
  [Energy.Dodge]: true,
  [Energy.Poison]: false,
  [Energy.Healing]: true,
  [Energy.Slow]: false,
  [Energy.Speed]: true,
};

/**
 * Gaining one of these first removes consumable energy of its pair.
 */
export const COUNTERS: Partial<Record<Energy, Energy>> = {
  [Energy.Armor]: Energy.Corrosion,
  [Energy.Corrosion]: Energy.Armor,
  [Energy.Speed]: Energy.Slow,
  [Energy.Slow]: Energy.Speed,
};
