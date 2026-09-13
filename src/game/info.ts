import {
  CONSUMABLE_STACKS,
  DEFAULT_CRITICAL_MULTIPLIER,
  MAX_COOLDOWN_INCREASE,
  MAX_COOLDOWN_REDUCTION,
  MAX_COOLDOWN_STACKS,
  NATURAL_PERIOD,
} from '../battle/constants';
import { MAX_CRITICAL_STACKS } from '../battle/mechanics/critical';
import { MAX_DODGE_STACKS } from '../battle/mechanics/dodge';
import { DamageType, Energy, Stat } from '../battle/types';
import { MAX_ERROR_VALUE, MIN_ERROR_VALUE, MONOTONE_MULTIPLIER } from './card';
import { COPY_LIMITS } from './constants';
import { type Description, describe, token } from './description';
import { Aspect, Print, Rarity } from './types';

export const ASPECT_NAMES: Record<Aspect, string> = {
  [Aspect.Universal]: 'Universal',
  [Aspect.Health]: 'Health',
  [Aspect.Attack]: 'Attack',
  [Aspect.Magic]: 'Magic',
  [Aspect.Poison]: 'Poison',
  [Aspect.Armor]: 'Armor',
  [Aspect.Corrosion]: 'Corrosion',
  [Aspect.Speed]: 'Speed',
  [Aspect.Slow]: 'Slow',
  [Aspect.Dodge]: 'Dodge',
  [Aspect.Critical]: 'Critical',
  [Aspect.Healing]: 'Healing',
};

export const RARITY_NAMES: Record<Rarity, string> = {
  [Rarity.Common]: 'Common',
  [Rarity.Uncommon]: 'Uncommon',
  [Rarity.Rare]: 'Rare',
  [Rarity.Secret]: 'Secret',
};

export const PRINT_NAMES: Record<Print, string> = {
  [Print.Error]: 'Error',
  [Print.Negative]: 'Negative',
  [Print.Monotone]: 'Monotone',
};

export const PRINTS: Print[] = [Print.Error, Print.Monotone, Print.Negative];

export function describeRarity(rarity: Rarity): Description {
  const limit = COPY_LIMITS[rarity];
  const copies = describe`${token.value(limit)} ${limit === 1 ? 'copy' : 'copies'}`;
  if (rarity === Rarity.Secret) {
    return describe`Unlocks once you own every rare card of its aspect. Own up to ${copies}.`;
  }
  return describe`Own up to ${copies}.`;
}

export function describePrint(print: Print): Description {
  if (print === Print.Error) {
    return describe`Values roll between ${token.percent(MIN_ERROR_VALUE)} and ${token.percent(MAX_ERROR_VALUE)} on every use.`;
  }
  if (print === Print.Monotone) {
    return describe`Values are multiplied by ${token.multiplier(MONOTONE_MULTIPLIER)}.`;
  }
  return describe`No effect yet.`;
}

const physical = token.damage(DamageType.Physical);
const magical = token.damage(DamageType.Magical);

export const ENERGY_DESCRIPTIONS: Record<Energy, Description> = {
  [Energy.Attack]: describe`Attacks an enemy for ${physical} equal to your ${token.energy(Energy.Attack)}. ${token.energy(Energy.Speed)} attacks faster and ${token.energy(Energy.Slow)} slower.`,
  [Energy.Magic]: describe`When triggered, deals ${magical} equal to your ${token.energy(Energy.Magic)} to an enemy.`,
  [Energy.Poison]: describe`Every ${token.seconds(NATURAL_PERIOD)}, you take ${token.damage(DamageType.Poison)} equal to your ${token.energy(Energy.Poison)}.`,
  [Energy.Armor]: describe`Reduces ${physical} and ${magical} taken by your ${token.energy(Energy.Armor)}. Gaining it removes ${token.energy(Energy.Corrosion)}.`,
  [Energy.Corrosion]: describe`Increases ${physical} and ${magical} taken by your ${token.energy(Energy.Corrosion)}. Gaining it removes ${token.energy(Energy.Armor)}.`,
  [Energy.Speed]: describe`Shortens the time between attacks, and ability cooldowns by up to ${token.percent(MAX_COOLDOWN_REDUCTION)} at ${token.energy(Energy.Speed, MAX_COOLDOWN_STACKS)}. Gaining it removes ${token.energy(Energy.Slow)}.`,
  [Energy.Slow]: describe`Lengthens the time between attacks, and ability cooldowns by up to ${token.percent(MAX_COOLDOWN_INCREASE)} at ${token.energy(Energy.Slow, MAX_COOLDOWN_STACKS)}. Gaining it removes ${token.energy(Energy.Speed)}.`,
  [Energy.Dodge]: describe`Chance to dodge attacks, reaching ${token.percent(1)} at ${token.energy(Energy.Dodge, MAX_DODGE_STACKS)}.`,
  [Energy.Critical]: describe`Chance for attacks to deal ${token.multiplier(DEFAULT_CRITICAL_MULTIPLIER)} damage, reaching ${token.percent(1)} at ${token.energy(Energy.Critical, MAX_CRITICAL_STACKS)}.`,
  [Energy.Healing]: describe`Every ${token.seconds(NATURAL_PERIOD)}, heals ${token.stat(Stat.Health)} equal to your ${token.energy(Energy.Healing)}.`,
};

export const ENERGY_CONSUMPTION: Description = describe`Each time it takes effect, ${token.percent(CONSUMABLE_STACKS)} of the consumable amount is spent.`;
