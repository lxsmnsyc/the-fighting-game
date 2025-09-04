import type { Game } from '../game';
import type { Round } from '../round';
import { EventPriority, GameEvents, RoundEvents } from '../types';

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

export function createTimer(
  round: Round,
  period: number,
  callback: () => boolean,
): void {
  let elapsed = 0;
  let ready = true;

  round.on(RoundEvents.Tick, EventPriority.Exact, event => {
    if (!ready) {
      elapsed += event.delta;
      if (elapsed >= period) {
        elapsed -= period;
        ready = true;
      }
    }
    if (ready) {
      ready = !callback();
    }
  });
}


export function createDynamicTimer(
  round: Round,
  period: () => number,
  callback: () => boolean,
): void {
  let elapsed = 0;
  let lastPeriod = period();
  let ready = true;

  round.on(RoundEvents.Tick, EventPriority.Exact, event => {
    if (!ready) {
      elapsed += event.delta;
      if (elapsed >= lastPeriod) {
        elapsed -= lastPeriod;
        ready = true;
      }
    }
    if (ready) {
      ready = !callback();
      lastPeriod = period();
    }
  });
}
