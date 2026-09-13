import { DamageType, Energy } from '../battle/types';
import { Aspect, Rarity } from '../game/types';

export const DAMAGE_COLORS: Record<DamageType, string> = {
  [DamageType.Physical]: '#fb923c',
  [DamageType.Magical]: '#a78bfa',
  [DamageType.Poison]: '#4ade80',
  [DamageType.Pure]: '#fde047',
  [DamageType.HealthLoss]: '#f43f5e',
};

export const ENERGY_COLORS: Record<Energy, string> = {
  [Energy.Attack]: '#ef4444',
  [Energy.Magic]: '#8b5cf6',
  [Energy.Poison]: '#22c55e',
  [Energy.Armor]: '#94a3b8',
  [Energy.Corrosion]: '#a3e635',
  [Energy.Speed]: '#22d3ee',
  [Energy.Slow]: '#6366f1',
  [Energy.Dodge]: '#38bdf8',
  [Energy.Critical]: '#f59e0b',
  [Energy.Healing]: '#f472b6',
};

// Stand-ins until the energy icons exist
export const ENERGY_LABELS: Record<Energy, string> = {
  [Energy.Attack]: 'AT',
  [Energy.Magic]: 'MG',
  [Energy.Poison]: 'PS',
  [Energy.Armor]: 'AR',
  [Energy.Corrosion]: 'CR',
  [Energy.Speed]: 'SP',
  [Energy.Slow]: 'SL',
  [Energy.Dodge]: 'DG',
  [Energy.Critical]: 'CT',
  [Energy.Healing]: 'HL',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.Starter]: '#a1a1aa',
  [Rarity.Common]: '#e4e4e7',
  [Rarity.Uncommon]: '#4ade80',
  [Rarity.Rare]: '#60a5fa',
  [Rarity.Secret]: '#facc15',
};

export const STAT_COLOR = '#f87171';

// Each energy aspect takes its energy's color
export const ASPECT_COLORS: Record<Aspect, string> = {
  [Aspect.Universal]: '#a1a1aa',
  [Aspect.Health]: STAT_COLOR,
  [Aspect.Attack]: ENERGY_COLORS[Energy.Attack],
  [Aspect.Magic]: ENERGY_COLORS[Energy.Magic],
  [Aspect.Poison]: ENERGY_COLORS[Energy.Poison],
  [Aspect.Armor]: ENERGY_COLORS[Energy.Armor],
  [Aspect.Corrosion]: ENERGY_COLORS[Energy.Corrosion],
  [Aspect.Speed]: ENERGY_COLORS[Energy.Speed],
  [Aspect.Slow]: ENERGY_COLORS[Energy.Slow],
  [Aspect.Dodge]: ENERGY_COLORS[Energy.Dodge],
  [Aspect.Critical]: ENERGY_COLORS[Energy.Critical],
  [Aspect.Healing]: ENERGY_COLORS[Energy.Healing],
};
