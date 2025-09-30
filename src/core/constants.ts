import { Energy } from './types';

export const DEFAULT_MAX_HEALTH = 1000;

export const DEFAULT_GOLD = 5;

export const DEFAULT_CRIT_MULTIPLIER = 200;

export const DEFAULT_LIFE = 3;

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
