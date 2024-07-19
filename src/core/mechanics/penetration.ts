import { EventType, type Game } from '../game';

const CONSUMABLE_PENETRATION_STACKS = 0.5;

export function setupProtectionMechanics(game: Game): void {
  // Trigger Protection consumption when about to take damage.
  game.on(EventType.Damage, event => {
    // Event priority 2 (after amount modification, before damage dealing)
    if (event.priority === 2) {
      // Get 50% of the protection
      const currentProtection = event.target.penetrationStacks;
      if (currentProtection > 0) {
        const consumable =
          (currentProtection * CONSUMABLE_PENETRATION_STACKS) | 0;
        event.amount += consumable;
        game.triggerBuff(EventType.RemovePenetration, event.target, consumable);
      }
    }
  });

  // Protection/Penetration interaction
  game.on(EventType.AddPenetration, event => {
    // Event priority 2 (exact)
    if (event.priority === 2) {
      // Get the remaining amount of stacks that can be applied to protection
      const overflow = event.amount - event.target.protectionStacks;
      // The rest we can deduct to the protectionStacks
      const deduction = Math.min(event.target.penetrationStacks, event.amount);
      // For the final amount, add it to current stacks
      if (overflow > 0) {
        event.target.penetrationStacks += overflow;
      }
      game.triggerDebuff(
        EventType.RemoveProtection,
        event.source,
        event.target,
        deduction,
      );
    }
  });

  // Re-adjust protection stacks when consumed.
  game.on(EventType.RemovePenetration, event => {
    if (event.priority === 2) {
      event.amount = Math.min(event.amount, event.source.protectionStacks);
      event.source.protectionStacks -= event.amount;
    }
  });
}
