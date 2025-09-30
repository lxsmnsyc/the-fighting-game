import type { Game } from '../game';
import { lerp } from '../lerp';
import type { Round, Unit } from '../round';
import { Energy, EventPriority, GameEvents, RoundEvents } from '../types';

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

/**
 * Return `true` if timer should be reset. Return `false` if
 * it should re-run immediately on next tick.
 */
type TimerCallback = () => boolean;

export function createTimer(
  round: Round,
  period: number,
  callback: TimerCallback,
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
  callback: TimerCallback,
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

const MAX_SPEED = 1000;

export function createCooldown(
  round: Round,
  unit: Unit,
  min: number,
  max: number,
  callback: TimerCallback,
): void {
  createDynamicTimer(
    round,
    () =>
      lerp(
        min * 1000,
        max * 1000,
        Math.min(unit.getTotalEnergy(Energy.Speed) / MAX_SPEED, 1),
      ),
    callback,
  );
}
