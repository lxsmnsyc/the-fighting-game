import { EventType, type Game } from '../game';

const CONSUMABLE_PROTECTION_STACKS = 0.5;

export function setupProtectionMechanics(game: Game): void {
  // Trigger Protection consumption when about to take damage.
  game.on(EventType.Damage, event => {
    if (event.priority === 2) {
      // Get 50% of the protection
      const currentProtection = event.target.protectionStacks;
      if (currentProtection > 0) {
        const consumable =
          (currentProtection * CONSUMABLE_PROTECTION_STACKS) | 0;
        game.triggerDebuff(
          EventType.RemoveProtection,
          event.source,
          event.target,
          consumable,
        );
        event.amount -= consumable;
      }
    }
  });

  // Protection/Penetration interaction
  game.on(EventType.AddProtection, event => {
    if (event.priority === 2) {
      // Get the remaining amount of stacks that can be applied to protection
      const overflow = event.amount - event.source.penetrationStacks;
      // The rest we can deduct to the penetrationStacks
      const deduction = Math.min(event.source.penetrationStacks, event.amount);
      game.triggerBuff(EventType.RemovePenetration, event.source, deduction);
      // For the final amount, add it to current stacks
      if (overflow > 0) {
        event.source.protectionStacks += overflow;
      }
    }
  });

  // Re-adjust protection stacks when consumed.
  game.on(EventType.RemoveProtection, event => {
    if (event.priority === 2) {
      event.amount = Math.min(event.amount, event.target.protectionStacks);
      event.target.protectionStacks -= event.amount;
    }
  });
}
