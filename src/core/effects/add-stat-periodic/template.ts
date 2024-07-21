import {
  type EffectCardSource,
  EventType,
  STAT_NAME,
  Stack,
  type Stat,
  createEffectCardSource,
} from '../../game';
import { lerp } from '../../lerp';
import { log } from '../../log';
import { EventPriority } from '../../priorities';

const DEFAULT_MIN_PERIOD = 5;
const DEFAULT_MAX_PERIOD = 0.2;
const DEFAULT_MAX_SPEED = 750;
const DEFAULT_GAIN_MULTIPLIER = 1;

export interface PeriodicAddStatEffectCardSourceOptions {
  name: string;
  tier: number;
  stat: Stat;
  multiplier?: number;
  maxPeriod?: number;
  minPeriod?: number;
  maxSpeed?: number;
}

export function createPeriodicAddStatEffectCardSource(
  options: PeriodicAddStatEffectCardSourceOptions,
): EffectCardSource {
  const current = Object.assign(
    {
      multiplier: DEFAULT_GAIN_MULTIPLIER,
      maxPeriod: DEFAULT_MAX_PERIOD,
      minPeriod: DEFAULT_MIN_PERIOD,
      maxSpeed: DEFAULT_MAX_SPEED,
    },
    options,
  );

  function getPeriodicGain(level: number) {
    return current.multiplier * level;
  }

  function getPeriod(speed: number): number {
    return lerp(
      current.minPeriod * 1000,
      current.maxPeriod * 1000,
      Math.min(speed / current.maxSpeed, 1),
    );
  }

  return createEffectCardSource({
    name: current.name,
    tier: current.tier,
    getDescription(level) {
      return [
        'Periodically gains ',
        getPeriodicGain(level),
        ' points of ',
        STAT_NAME[current.stat],
        '. Period ranges from',
        current.minPeriod,
        ' seconds to ',
        current.maxPeriod,
        ' seconds based on ',
        'Speed',
        '.',
      ];
    },
    load(game, player, level) {
      log(`Setting up ${current.name} for ${player.name}`);
      let elapsed = 0;
      let period = getPeriod(player.stats[Stack.Speed]);
      game.on(EventType.Tick, EventPriority.Exact, event => {
        elapsed += event.delta;
        if (elapsed >= period) {
          elapsed -= period;
          period = getPeriod(player.stats[Stack.Speed]);
          game.addStat(current.stat, player, getPeriodicGain(level));
        }
      });
    },
  });
}
