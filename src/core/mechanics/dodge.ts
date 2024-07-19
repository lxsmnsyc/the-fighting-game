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
          const currentAmount = event.amount;
          event.amount = 0;
          game.triggerDodge(
            DamageType.Attack,
            event.source,
            event.target,
            currentAmount,
          );
        }
      }
    }
  });
}
