import type { Game } from '../game';
import { lerp } from '../lerp';
import type { Player } from '../player';
import type { Round } from '../round';
import { EventPriority, GameEvents, RoundEvents, Stack } from '../types';

const FPS = 60;
const FPS_DURATION = 1000 / FPS;

export function setupTickMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Post, ({ round }) => {
    round.on(RoundEvents.Start, EventPriority.Post, () => {
      let elapsed = Date.now();
      let raf = requestAnimationFrame(update);

      function update() {
        raf = requestAnimationFrame(update);
        const current = Date.now();
        let diff = current - elapsed;
        elapsed = current;

        while (diff >= FPS_DURATION && !round.closed) {
          round.tick(FPS_DURATION);
          diff -= FPS_DURATION;
        }

        if (diff > 0) {
          elapsed -= diff;
        }
      }

      round.on(RoundEvents.End, EventPriority.Pre, () => {
        cancelAnimationFrame(raf);
      });
    });
  });
}

const MAX_SPEED = 750;

function getPeriod(
  speed: number,
  minPeriod: number,
  maxPeriod: number,
): number {
  return lerp(
    minPeriod * 1000,
    maxPeriod * 1000,
    Math.min(speed / MAX_SPEED, 1),
  );
}

export interface UsePeriodOptions {
  round: Round;
  player: Player;
  period: { min: number; max: number };
  run(): void;
}

export function useScalingPeriod(options: UsePeriodOptions): void {
  let elapsed = 0;
  let period = getPeriod(
    options.player.stats[Stack.Speed],
    options.period.min,
    options.period.max,
  );
  options.round.on(RoundEvents.Tick, EventPriority.Exact, event => {
    elapsed += event.delta;
    if (elapsed >= period) {
      elapsed -= period;
      period = getPeriod(
        options.player.stats[Stack.Speed],
        options.period.min,
        options.period.max,
      );
      options.run();
    }
  });
}
