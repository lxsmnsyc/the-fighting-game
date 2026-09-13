import { DamageType, Energy, Stat } from './types';

export const ENERGY_NAMES: Record<Energy, string> = {
  [Energy.Attack]: 'Attack',
  [Energy.Magic]: 'Magic',
  [Energy.Poison]: 'Poison',
  [Energy.Armor]: 'Armor',
  [Energy.Corrosion]: 'Corrosion',
  [Energy.Speed]: 'Speed',
  [Energy.Slow]: 'Slow',
  [Energy.Dodge]: 'Dodge',
  [Energy.Critical]: 'Critical',
  [Energy.Healing]: 'Healing',
};

export const DAMAGE_TYPE_NAMES: Record<DamageType, string> = {
  [DamageType.Magical]: 'Magical',
  [DamageType.Physical]: 'Physical',
  [DamageType.Poison]: 'Poison',
  [DamageType.Pure]: 'Pure',
  [DamageType.HealthLoss]: 'Health Loss',
};

export const STAT_NAMES: Record<Stat, string> = {
  [Stat.Health]: 'Health',
  [Stat.MaxHealth]: 'Max Health',
};
