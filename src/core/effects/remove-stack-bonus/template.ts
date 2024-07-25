import {
  type EffectCardSource,
  EventType,
  type Stack,
  createEffectCardSource,
} from '../../game';
import { StackPriority } from '../../priorities';

export interface RemoveStackBonusOptions {
  name: string;
  stat: Stack;
  multiplier?: number;
}

const DEFAULT_MULTIPLIER = 5;

export function createRemoveStackBonus(
  options: RemoveStackBonusOptions,
): EffectCardSource {
  const current = Object.assign({ multiplier: DEFAULT_MULTIPLIER }, options);
  function getLoss(level: number) {
    return current.multiplier * level;
  }
  return createEffectCardSource({
    name: current.name,
    tier: 1,
    load(game, player, level) {
      game.on(EventType.RemoveStack, StackPriority.Additive, event => {
        if (event.type === current.stat && event.source !== player) {
          event.amount -= getLoss(level);
        }
      });
    },
  });
}
