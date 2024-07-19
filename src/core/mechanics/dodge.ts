import { DamageType, EventType, type Game } from '../game';
import { log } from '../log';
import { DamagePriority } from '../priorities';

export function setupDodgeMechanics(game: Game): void {
  log('Setting up Dodge mechanics.');
  game.on(EventType.Damage, DamagePriority.Dodge, event => {
    if (!event.flags.dodged) {
      // Dodge mechanics
      const currentDodge = event.target.dodgeChance;
      // Check if player can dodge it
      if (event.type === DamageType.Attack && currentDodge > 0) {
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentDodge) {
          log(`${event.target.name} dodged ${event.amount} of damage.`);
          event.flags.dodged = true;
        }
      }
    }
  });
}
