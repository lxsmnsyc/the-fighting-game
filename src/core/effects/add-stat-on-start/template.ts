import {
  type EffectCardSource,
  RoundEventType,
  type Stat,
  createEffectCardSource,
} from '../../game';
import { EventPriority } from '../../priorities';
import { Rarity } from '../../rarities';

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
    rarity: Rarity.Common,
    load(game, player, level) {
      game.on(RoundEventType.Start, EventPriority.Post, () => {
        game.addStat(current.stat, player, level * DEFAULT_MULTIPLIER);
      });
    },
  });
}
