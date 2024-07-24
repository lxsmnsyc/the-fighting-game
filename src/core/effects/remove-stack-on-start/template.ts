import {
  type EffectCardSource,
  EventType,
  type Stack,
  createEffectCardSource,
} from '../../game';
import { EventPriority } from '../../priorities';

const DEFAULT_GAIN_MULTIPLIER = 100;

export interface RemoveStackOnStartOptions {
  name: string;
  stack: Stack;
  gainMultiplier?: number;
}

export function createRemoveStackOnStart(
  options: RemoveStackOnStartOptions,
): EffectCardSource {
  const current = Object.assign(
    { gainMultiplier: DEFAULT_GAIN_MULTIPLIER },
    options,
  );
  return createEffectCardSource({
    name: current.name,
    tier: 1,
    load(game, player, level) {
      game.on(EventType.Start, EventPriority.Post, () => {
        game.removeStack(
          current.stack,
          game.getOppositePlayer(player),
          level * DEFAULT_GAIN_MULTIPLIER,
        );
      });
    },
  });
}
