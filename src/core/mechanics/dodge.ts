import { DamageType, EventType, type Game } from '../game';

export function setupDodgeMechanics(game: Game): void {
  game.on(EventType.Damage, event => {
    // Event priority 1 (before protection)
    if (event.priority === 1 && !event.flags.dodged) {
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
