import { EventPriority } from '../../core/event-emitter';
import type Alliance from '../alliance';
import type Battle from '../core';
import { BattleEvents } from '../events';

/**
 * Ends the battle once one alliance or none has units standing, or once
 * its time limit runs out, which is a draw. It is checked after each
 * tick so everything in that tick has resolved.
 */
export default function setupOutcomeMechanics(battle: Battle): void {
  battle.on(BattleEvents.Tick, EventPriority.Post, () => {
    if (!battle.fighting || battle.settled) {
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

    const expired = battle.timeLimit > 0 && battle.elapsed >= battle.timeLimit;
    if (standing.size > 1 && !expired) {
      return;
    }

    battle.settled = true;
    battle.winner = standing.size === 1 ? [...standing][0] : null;
    battle.end();
  });
}
