import {
  type EffectCardSource,
  RoundEventType,
  type Stack,
  createEffectCardSource,
} from '../../game';
import { StackPriority } from '../../priorities';
import { Rarity } from '../../rarities';

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
  return createEffectCardSource({
    name: current.name,
    rarity: Rarity.Common,
    load(game, player) {
      game.on(RoundEventType.RemoveStack, StackPriority.Additive, event => {
        if (event.type === current.stat && event.source !== player) {
          event.amount -= current.multiplier;
        }
      });
    },
  });
}
