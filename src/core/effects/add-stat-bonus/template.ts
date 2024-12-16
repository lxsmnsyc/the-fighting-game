import {
  type EffectCardSource,
  RoundEventType,
  type Stat,
  createEffectCardSource,
} from '../../game';
import { StatPriority } from '../../priorities';
import { Rarity } from '../../rarities';

export interface AddStatBonusOptions {
  name: string;
  stat: Stat;
  multiplier?: number;
}

const DEFAULT_MULTIPLIER = 5;

export function createAddStatBonus(
  options: AddStatBonusOptions,
): EffectCardSource {
  const current = Object.assign({ multiplier: DEFAULT_MULTIPLIER }, options);
  return createEffectCardSource({
    name: current.name,
    rarity: Rarity.Common,
    load(game, player) {
      game.on(RoundEventType.AddStat, StatPriority.Additive, event => {
        if (event.type === current.stat && event.source === player) {
          event.amount += current.multiplier;
        }
      });
    },
  });
}
