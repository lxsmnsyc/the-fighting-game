import {
  type EffectCardSource,
  EventType,
  type Stat,
  createEffectCardSource,
} from '../../game';
import { log } from '../../log';
import { StatPriority } from '../../priorities';

export interface AddStatBonusEffectCardSourceOptions {
  name: string;
  tier: number;
  stat: Stat;
  gainMultiplier?: number;
}

const DEFAULT_GAIN_MULTIPLIER = 5;

export function createAddStatBonusEffectCardSource(
  options: AddStatBonusEffectCardSourceOptions,
): EffectCardSource {
  const current = Object.assign(
    { gainMultiplier: DEFAULT_GAIN_MULTIPLIER },
    options,
  );
  function getGain(level: number) {
    return current.gainMultiplier * level;
  }
  return createEffectCardSource({
    name: current.name,
    tier: 1,
    load(game, player, level) {
      log(`Setting up ${current.name} for ${player.name}`);
      game.on(EventType.AddStat, StatPriority.Additive, event => {
        if (event.type === current.stat && event.source === player) {
          event.amount += getGain(level);
        }
      });
    },
  });
}
