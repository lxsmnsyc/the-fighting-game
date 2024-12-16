import type { Player } from './player';
import type { Round, Unit } from './round';
import type { Edition, Rarity } from './types';

export interface LoadContext {
  round: Round;
  player: Player;
  unit: Unit;
}

export interface EffectCardSourceContext extends LoadContext {
  card: EffectCard;
}

export interface EffectCardSource {
  name: string;
  load: (context: EffectCardSourceContext) => void;
}

export interface AbilityCardSourceContext extends LoadContext {
  card: AbilityCard;
}

export interface AbilityCardSource {
  name: string;
  load: (context: AbilityCardSourceContext) => void;
}

export interface EffectCard {
  source: EffectCardSource;
  rarity: Rarity;
  edition: Edition;
  print: number;
}

export interface AbilityCard {
  source: AbilityCardSource;
  edition: Edition;
  print: number;
}

export function createEffectCardSource(
  source: EffectCardSource,
): EffectCardSource {
  return source;
}

export function createAbilityCardSource(
  source: AbilityCardSource,
): AbilityCardSource {
  return source;
}

export function createEffectCard(source: EffectCard): EffectCard {
  return source;
}

export function createAbilityCard(source: AbilityCard): AbilityCard {
  return source;
}
