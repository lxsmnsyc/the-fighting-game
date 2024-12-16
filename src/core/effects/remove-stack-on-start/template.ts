import {
  type EffectCardSource,
  RoundEventType,
  type Stack,
  createEffectCardSource,
} from '../../game';
import { EventPriority } from '../../priorities';
import { Rarity } from '../../rarities';

const DEFAULT_MULTIPLIER = 100;

export interface RemoveStackOnStartOptions {
  name: string;
  stack: Stack;
  multiplier?: number;
}

export function createRemoveStackOnStart(
  options: RemoveStackOnStartOptions,
): EffectCardSource {
  const current = Object.assign({ multiplier: DEFAULT_MULTIPLIER }, options);
  return createEffectCardSource({
    name: current.name,
    rarity: Rarity.Common,
    load(game, player) {
      game.on(RoundEventType.Start, EventPriority.Post, () => {
        game.removeStack(
          current.stack,
          game.getOppositePlayer(player),
          current.multiplier,
        );
      });
    },
  });
}
