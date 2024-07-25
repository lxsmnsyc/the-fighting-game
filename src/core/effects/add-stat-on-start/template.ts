import {
  type EffectCardSource,
  EventType,
  type Stat,
  createEffectCardSource,
} from '../../game';
import { EventPriority } from '../../priorities';

const DEFAULT_MULTIPLIER = 100;

export interface AddStatOnStartOptions {
  name: string;
  stat: Stat;
  multiplier?: number;
}

export function createAddStatOnStart(
  options: AddStatOnStartOptions,
): EffectCardSource {
  const current = Object.assign({ multiplier: DEFAULT_MULTIPLIER }, options);
  return createEffectCardSource({
    name: current.name,
    tier: 1,
    load(game, player, level) {
      game.on(EventType.Start, EventPriority.Post, () => {
        game.addStat(current.stat, player, level * DEFAULT_MULTIPLIER);
      });
    },
  });
}
