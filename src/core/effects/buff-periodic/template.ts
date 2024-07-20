import {
  BUFF_NAME,
  BUFF_STACKS,
  type BuffEventType,
  type EffectCardSource,
  EventType,
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

export interface PeriodicBuffEffectCardSourceOptions {
  name: string;
  tier: number;
  buff: BuffEventType;
  multiplier?: number;
  maxPeriod?: number;
  minPeriod?: number;
  maxSpeed?: number;
}

export default function createPeriodicBuffEffectCardSource(
  options: PeriodicBuffEffectCardSourceOptions,
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
        ` ${BUFF_STACKS[current.buff] ? 'stacks' : 'points'} of `,
        BUFF_NAME[current.buff],
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
        let period = getPeriod(player.stacks.speed);

        const cleanup = createTick(() => {
          // Calculate period
          elapsed += FRAME_DURATION;
          if (elapsed >= period) {
            elapsed -= period;
            period = getPeriod(player.stacks.speed);

            game.triggerBuff(current.buff, player, getPeriodicGain(level));
          }
        });

        game.on(EventType.Close, EventPriority.Pre, () => {
          cleanup();
        });
      });
    },
  });
}
