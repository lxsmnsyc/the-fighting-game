import { DamageType, EventType, type Game } from '../game';
import { DamagePriority } from '../priorities';

export function setupDodgeMechanics(game: Game): void {
  game.on(EventType.Damage, DamagePriority.Dodge, event => {
    if (!event.flags.dodged) {
      // Dodge mechanics
      const currentDodge = event.target.dodgeChance;
      // Check if player can dodge it
      if (event.type === DamageType.Attack) {
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentDodge) {
          event.flags.dodged = true;
        }
      }
    }
  });
}
