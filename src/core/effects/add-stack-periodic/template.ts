import {
  type EffectCardSource,
  EventType,
  STAT_NAME,
  Stack,
  createEffectCardSource,
} from '../../game';
import { lerp } from '../../lerp';
import { log } from '../../log';
import { EventPriority } from '../../priorities';
import { FRAME_DURATION, createTick } from '../../tick';

const DEFAULT_MIN_PERIOD = 5;
const DEFAULT_MAX_PERIOD = 0.2;
const DEFAULT_MAX_SPEED = 750;
const DEFAULT_GAIN_MULTIPLIER = 1;

export interface PeriodicAddStackEffectCardSourceOptions {
  name: string;
  tier: number;
  stack: Stack;
  multiplier?: number;
  maxPeriod?: number;
  minPeriod?: number;
  maxSpeed?: number;
}

export function createPeriodicAddStackEffectCardSource(
  options: PeriodicAddStackEffectCardSourceOptions,
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
        ' stacks of ',
        STAT_NAME[current.stack],
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
      game.on(EventType.Start, EventPriority.Post, () => {
        let elapsed = 0;
        let period = getPeriod(player.stats[Stack.Speed]);

        const cleanup = createTick(() => {
          // Calculate period
          elapsed += FRAME_DURATION;
          if (elapsed >= period) {
            elapsed -= period;
            period = getPeriod(player.stats[Stack.Speed]);

            game.addStack(current.stack, player, getPeriodicGain(level));
          }
        });

        game.on(EventType.Close, EventPriority.Pre, () => {
          cleanup();
        });
      });
    },
  });
}
