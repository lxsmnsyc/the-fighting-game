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
 * How often every unit gains energy on its own, in milliseconds.
 */
export const ENERGY_GAIN_PERIOD = 1000;

/**
 * How much of each energy a unit gains on its own every period, before
 * anything changes it.
 */
export const BASE_ENERGY_GAIN = 5;

/**
 * Speed or Slow at which an ability's cooldown is changed the most.
 */
export const MAX_COOLDOWN_STACKS = 1000;

/**
 * Share of an ability's cooldown that Speed can take off.
 */
export const MAX_COOLDOWN_REDUCTION = 0.5;

/**
 * Share of an ability's cooldown that Slow can add.
 */
export const MAX_COOLDOWN_INCREASE = 0.5;

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
