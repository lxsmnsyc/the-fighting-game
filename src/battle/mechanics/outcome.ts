import { EventPriority } from '../../core/event-emitter';
import type Alliance from '../alliance';
import type Battle from '../core';
import { BattleEvents } from '../events';

/**
 * Ends the battle once one alliance or none has units standing, or once
 * `timeLimit` runs out, which is a draw. It is checked after each tick
 * so everything in that tick has resolved.
 */
export default function setupOutcomeMechanics(battle: Battle, timeLimit: number): void {
  let started = false;
  let elapsed = 0;

  battle.on(BattleEvents.Start, EventPriority.Post, () => {
    started = true;
  });

  battle.on(BattleEvents.Tick, EventPriority.Post, (event) => {
    if (!started || battle.settled) {
      return;
    }
    elapsed += event.duration;

    const standing = new Set<Alliance>();
    for (const alliance of battle.alliances) {
      for (const team of alliance.teams) {
        for (const unit of team.units) {
          if (unit.alive) {
            standing.add(alliance);
          }
        }
      }
    }

    const expired = timeLimit > 0 && elapsed >= timeLimit;
    if (standing.size > 1 && !expired) {
      return;
    }

    battle.settled = true;
    battle.winner = standing.size === 1 ? [...standing][0] : null;
    battle.end();
  });
}
