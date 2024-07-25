import {
  type EffectCardSource,
  EventType,
  type Stat,
  createEffectCardSource,
} from '../../game';
import { StatPriority } from '../../priorities';

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
  function getGain(level: number) {
    return current.multiplier * level;
  }
  return createEffectCardSource({
    name: current.name,
    tier: 1,
    load(game, player, level) {
      game.on(EventType.AddStat, StatPriority.Additive, event => {
        if (event.type === current.stat && event.source === player) {
          event.amount += getGain(level);
        }
      });
    },
  });
}
