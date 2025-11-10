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

export class Timer {
  private elapsed = 0;

  private ready = false;

  private paused = false;

  private lastPeriod: number;

  constructor(
    public round: Round,
    public period: number | (() => number),
    public callback: () => void,
  ) {
    const readPeriod = typeof period === 'function' ? period : () => period;
    this.lastPeriod = readPeriod();

    round.on(RoundEvents.Tick, EventPriority.Exact, event => {
      if (!(this.paused || this.ready)) {
        this.elapsed += event.delta;
        if (this.elapsed >= this.lastPeriod) {
          this.elapsed -= this.lastPeriod;
          this.ready = true;
        }
      }
      if (this.ready) {
        callback();

        this.ready = false;
        this.lastPeriod = readPeriod();
      }
    });
  }

  reset(): void {
    this.paused = false;
    this.ready = true;
  }

  start(): void {
    this.paused = false;
    this.elapsed = 0;
  }

  stop(): void {
    this.paused = true;
    this.elapsed = 0;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }
}

const MAX_SPEED = 1000;
const MAX_SLOW = 1000;

export function createCooldown(
  round: Round,
  unit: Unit,
  min: number,
  max: number,
  callback: () => void,
): Timer {
  return new Timer(
    round,
    () => {
      const currentSpeed = unit.getTotalEnergy(Energy.Speed);
      const currentSlow = unit.getTotalEnergy(Energy.Slow);
      const total = Math.max(
        -MAX_SLOW,
        Math.min(currentSpeed - currentSlow, MAX_SPEED),
      );
      return lerp(
        max * 1000,
        min * 1000,
        (MAX_SLOW + total) / (MAX_SPEED + MAX_SLOW),
      );
    },
    callback,
  );
}
