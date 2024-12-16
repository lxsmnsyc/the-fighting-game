import {
  type EffectCardSource,
  RoundEventType,
  type Stack,
  createEffectCardSource,
} from '../../game';
import { EventPriority } from '../../priorities';
import { Rarity } from '../../rarities';

const DEFAULT_MULTIPLIER = 100;

export interface AddStackOnCastAbilityOptions {
  name: string;
  stack: Stack;
  multiplier?: number;
}

export function createAddStackOnCastAbility(
  options: AddStackOnCastAbilityOptions,
): EffectCardSource {
  const current = Object.assign({ multiplier: DEFAULT_MULTIPLIER }, options);
  return createEffectCardSource({
    name: current.name,
    rarity: Rarity.Common,
    load(game, player, level) {
      game.on(RoundEventType.CastAbility, EventPriority.Post, event => {
        if (event.source === player) {
          game.addStack(current.stack, player, level * DEFAULT_MULTIPLIER);
        }
      });
    },
  });
}
