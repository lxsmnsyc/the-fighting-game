import { DamageType, EventType, type Game } from '../game';

export function setupDodgeMechanics(game: Game): void {
  game.on(EventType.Damage, event => {
    if (event.priority === 1) {
      // Dodge mechanics
      const currentDodge = event.target.dodgeChance;
      // Check if player can dodge it
      if (event.type === DamageType.Attack) {
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentDodge) {
          game.triggerDodge(
            DamageType.Attack,
            event.source,
            event.target,
            event.amount,
          );
        }
      }
    }
  });

  game.on(EventType.Dodge, event => {
    if (event.priority === 2) {
      event.amount = 0;
    }
  });
}
