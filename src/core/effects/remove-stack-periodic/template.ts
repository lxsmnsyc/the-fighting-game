import {
  type EffectCardSource,
  RoundEventType,
  Stack,
  createEffectCardSource,
} from '../../game';
import { lerp } from '../../lerp';
import { EventPriority } from '../../priorities';
import { Rarity } from '../../rarities';

const DEFAULT_MIN_PERIOD = 5;
const DEFAULT_MAX_PERIOD = 0.2;
const DEFAULT_MAX_SPEED = 750;
const DEFAULT_MULTIPLIER = 1;

export interface PeriodicRemoveStackOptions {
  name: string;
  stack: Stack;
  multiplier?: number;
  maxPeriod?: number;
  minPeriod?: number;
  maxSpeed?: number;
}

export function createPeriodicRemoveStack(
  options: PeriodicRemoveStackOptions,
): EffectCardSource {
  const current = Object.assign(
    {
      multiplier: DEFAULT_MULTIPLIER,
      maxPeriod: DEFAULT_MAX_PERIOD,
      minPeriod: DEFAULT_MIN_PERIOD,
      maxSpeed: DEFAULT_MAX_SPEED,
    },
    options,
  );

  function getPeriod(speed: number): number {
    return lerp(
      current.minPeriod * 1000,
      current.maxPeriod * 1000,
      Math.min(speed / current.maxSpeed, 1),
    );
  }

  return createEffectCardSource({
    name: current.name,
    rarity: Rarity.Uncommon,
    load(context) {
      // Start the timer only when game starts
      context.game.on(RoundEventType.Start, EventPriority.Post, () => {
        let elapsed = 0;
        // Get the initial period
        let period = getPeriod(context.player.stats[Stack.Speed]);
        context.game.on(RoundEventType.Tick, EventPriority.Exact, event => {
          elapsed += event.delta;
          if (elapsed >= period) {
            elapsed -= period;
            period = getPeriod(context.player.stats[Stack.Speed]);

            // Remove stack from the opposite player
            context.game.removeStack(
              current.stack,
              context.game.getOppositePlayer(context.player),
              current.multiplier,
            );
          }
        });
      });
    },
  });
}
