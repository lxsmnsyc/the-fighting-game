import { DamageType, EventType, type Game } from '../game';

export function setupCriticalMechanics(game: Game): void {
  game.on(EventType.Damage, event => {
    if (event.priority === 1) {
      // Dodge mechanics
      const currentCrit = event.source.critChance;
      // Check if player can crit it
      if (event.type === DamageType.Attack) {
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentCrit) {
          event.amount *= event.source.critMultiplier;
          game.triggerCritical(
            DamageType.Attack,
            event.source,
            event.target,
            event.amount,
          );
        }
      }
    }
  });
}
