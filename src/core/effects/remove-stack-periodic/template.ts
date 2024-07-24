import {
  type EffectCardSource,
  EventType,
  Stack,
  createEffectCardSource,
} from '../../game';
import { lerp } from '../../lerp';
import { log } from '../../log';
import { EventPriority } from '../../priorities';

const DEFAULT_MIN_PERIOD = 5;
const DEFAULT_MAX_PERIOD = 0.2;
const DEFAULT_MAX_SPEED = 750;
const DEFAULT_LOSS_MULTIPLIER = 1;

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
      multiplier: DEFAULT_LOSS_MULTIPLIER,
      maxPeriod: DEFAULT_MAX_PERIOD,
      minPeriod: DEFAULT_MIN_PERIOD,
      maxSpeed: DEFAULT_MAX_SPEED,
    },
    options,
  );

  function getPeriodicLoss(level: number) {
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
    tier: 1,
    load(game, player, level) {
      log(`Setting up ${current.name} for ${player.name}`);
      game.on(EventType.Start, EventPriority.Post, () => {
        let elapsed = 0;
        let period = getPeriod(player.stats[Stack.Speed]);
        game.on(EventType.Tick, EventPriority.Exact, event => {
          elapsed += event.delta;
          if (elapsed >= period) {
            elapsed -= period;
            period = getPeriod(player.stats[Stack.Speed]);
            game.removeStack(
              current.stack,
              game.getOppositePlayer(player),
              getPeriodicLoss(level),
            );
          }
        });
      });
    },
  });
}
