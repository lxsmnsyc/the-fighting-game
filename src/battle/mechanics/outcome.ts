import { EventPriority } from '../../core/event-emitter';
import type Alliance from '../alliance';
import type Battle from '../core';
import { BattleEvents } from '../events';

/**
 * Ends the battle once one alliance or none has units standing. It is
 * checked after each tick so everything in that tick has resolved.
 */
export default function setupOutcomeMechanics(battle: Battle): void {
  let started = false;

  battle.on(BattleEvents.Start, EventPriority.Post, () => {
    started = true;
  });

  battle.on(BattleEvents.Tick, EventPriority.Post, () => {
    if (!started || battle.settled) {
      return;
    }

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

    if (standing.size > 1) {
      return;
    }

    battle.settled = true;
    battle.winner = standing.size === 1 ? [...standing][0] : null;
    battle.end();
  });
}
