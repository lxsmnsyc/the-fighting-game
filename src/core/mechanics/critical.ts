import { DamageType, EventType, type Game } from '../game';
import { log } from '../log';
import { DamagePriority } from '../priorities';

export function setupCriticalMechanics(game: Game): void {
  log('Setting up Critical mechanics.');
  game.on(EventType.Damage, DamagePriority.Critical, event => {
    // Event priority 1 (before protection)
    if (!(event.flags.dodged || event.flags.critical)) {
      // Dodge mechanics
      const currentCrit = event.source.critChance;
      // Check if player can crit it
      if (event.type === DamageType.Attack && currentCrit > 0) {
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentCrit) {
          event.amount *= event.source.critMultiplier;
          log(`${event.target.name} triggered a  ${event.amount} of critical.`);
          event.flags.critical = true;
        }
      }
    }
  });
}
