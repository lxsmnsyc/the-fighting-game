import { EventPriority } from '../../core/event-emitter';
import type Battle from '../core';
import { BattleEvents } from '../events';
import type Unit from '../unit';

export default function setupTargetMechanics(battle: Battle): void {
  // A random enemy that is still standing. Listeners on `Pre` may pick
  // one first, and listeners on `Post` may override it.
  battle.on(BattleEvents.CheckUnitEnemy, EventPriority.Exact, (event) => {
    if (event.target) {
      return;
    }
    const enemies: Unit[] = [];
    for (const unit of battle.units(event.source.team.alliance)) {
      if (unit.alive) {
        enemies.push(unit);
      }
    }
    // Skips the roll when there is no choice to make
    if (enemies.length === 1) {
      event.target = enemies[0];
    } else if (enemies.length > 1) {
      event.target = enemies[Math.floor(event.source.rng.random() * enemies.length)];
    }
  });
}
