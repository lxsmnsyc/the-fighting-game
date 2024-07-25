import {
  type EffectCardSource,
  EventType,
  type Stack,
  createEffectCardSource,
} from '../../game';
import { EventPriority } from '../../priorities';

const DEFAULT_GAIN_MULTIPLIER = 100;

export interface AddStackOnCastAbilityOptions {
  name: string;
  stack: Stack;
  gainMultiplier?: number;
}

export function createAddStackOnCastAbility(
  options: AddStackOnCastAbilityOptions,
): EffectCardSource {
  const current = Object.assign(
    { gainMultiplier: DEFAULT_GAIN_MULTIPLIER },
    options,
  );
  return createEffectCardSource({
    name: current.name,
    tier: 1,
    load(game, player, level) {
      game.on(EventType.CastAbility, EventPriority.Post, event => {
        if (event.source === player) {
          game.addStack(current.stack, player, level * DEFAULT_GAIN_MULTIPLIER);
        }
      });
    },
  });
}
