import { Stack } from './types';

export const DEFAULT_MAX_HEALTH = 1000;

export const DEFAULT_GOLD = 5;

export const DEFAULT_CRIT_MULTIPLIER = 200;

export const DEFAULT_LIFE = 3;

export const SELF_STACK: Record<Stack, boolean> = {
  [Stack.Attack]: true,
  [Stack.Magic]: true,
  [Stack.Armor]: true,
  [Stack.Corrosion]: false,
  [Stack.Critical]: true,
  [Stack.Dodge]: true,
  [Stack.Poison]: false,
  [Stack.Healing]: true,
  [Stack.Slow]: false,
  [Stack.Speed]: true,
};
