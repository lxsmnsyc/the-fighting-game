import { DamageType, EventType, type Game } from '../game';
import { DamagePriority } from '../priorities';

export function setupCriticalMechanics(game: Game): void {
  game.on(EventType.Damage, DamagePriority.Critical, event => {
    // Event priority 1 (before protection)
    if (!(event.flags.dodged || event.flags.critical)) {
      // Dodge mechanics
      const currentCrit = event.source.critChance;
      // Check if player can crit it
      if (event.type === DamageType.Attack) {
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentCrit) {
          event.amount *= event.source.critMultiplier;
          event.flags.critical = true;
        }
      }
    }
  });
}
