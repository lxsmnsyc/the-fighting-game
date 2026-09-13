import { EventPriority } from '../../core/event-emitter';
import type Battle from '../core';
import { BattleEvents } from '../events';

const FPS = 60;
const FPS_DURATION = 1000 / FPS;

// A stalled frame hands the battle at most this much time, so a
// hidden tab does not play out the fight in one go
const MAX_FRAME = 250;

/**
 * Drives the battle from animation frames in fixed steps, so it runs
 * at the same rate on every machine.
 */
export default function setupRealtimeMechanics(battle: Battle): void {
  let frame: number | undefined;
  let elapsed = 0;

  const update = (): void => {
    frame = requestAnimationFrame(update);
    const current = performance.now();
    let diff = Math.min(current - elapsed, MAX_FRAME);
    elapsed = current;

    while (diff >= FPS_DURATION) {
      battle.tick(FPS_DURATION);
      diff -= FPS_DURATION;
    }

    // The remainder carries over to the next frame
    elapsed -= diff;
  };

  battle.on(BattleEvents.Start, EventPriority.Post, () => {
    elapsed = performance.now();
    frame = requestAnimationFrame(update);
  });

  battle.on(BattleEvents.End, EventPriority.Exact, () => {
    if (frame != null) {
      cancelAnimationFrame(frame);
    }
  });
}
