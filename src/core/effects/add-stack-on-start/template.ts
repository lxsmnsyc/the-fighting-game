import {
  type EffectCardSource,
  RoundEventType,
  type Stack,
  createEffectCardSource,
} from '../../game';
import { EventPriority } from '../../priorities';
import { Rarity } from '../../rarities';

const DEFAULT_MULTIPLIER = 100;

export interface AddStackOnStartOptions {
  name: string;
  stack: Stack;
  multiplier?: number;
}

export function createAddStackOnStart(
  options: AddStackOnStartOptions,
): EffectCardSource {
  const current = Object.assign({ multiplier: DEFAULT_MULTIPLIER }, options);
  return createEffectCardSource({
    name: current.name,
    rarity: Rarity.Common,
    load(game, player, level) {
      game.on(RoundEventType.Start, EventPriority.Post, () => {
        game.addStack(current.stack, player, level * DEFAULT_MULTIPLIER);
      });
    },
  });
}
