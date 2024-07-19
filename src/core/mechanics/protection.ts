import { EventType, type Game } from '../game';

const CONSUMABLE_PROTECTION_STACKS = 0.5;

export function setupProtectionMechanics(game: Game): void {
  // Trigger Protection consumption when about to take damage.
  game.on(EventType.Damage, event => {
    if (event.priority === 2) {
      // Get 50% of the protection
      const currentProtection = event.target.protectionStacks;
      if (currentProtection > 0) {
        game.triggerDebuff(
          EventType.RemoveProtection,
          event.source,
          event.target,
          currentProtection * CONSUMABLE_PROTECTION_STACKS,
        );
        event.amount -= currentProtection;
      }
    }
  });

  // Re-adjust protection stacks when consumed.
  game.on(EventType.RemoveProtection, event => {
    if (event.priority === 2) {
      event.target.protectionStacks = Math.max(
        0,
        event.target.protectionStacks - event.amount,
      );
    }
  });
}
