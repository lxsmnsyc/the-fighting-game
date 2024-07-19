import { EventType, type Game } from '../game';
import { BuffPriority, DamagePriority } from '../priorities';

const CONSUMABLE_PROTECTION_STACKS = 0.5;

export function setupProtectionMechanics(game: Game): void {
  // Trigger Protection consumption when about to take damage.
  game.on(EventType.Damage, DamagePriority.Protection, event => {
    if (!event.flags.dodged) {
      // Get 50% of the protection
      const currentProtection = event.target.protectionStacks;
      if (currentProtection > 0) {
        const consumable =
          (currentProtection * CONSUMABLE_PROTECTION_STACKS) | 0;
        event.amount -= consumable;
        game.triggerDebuff(
          EventType.RemoveProtection,
          event.source,
          event.target,
          consumable,
        );
      }
    }
  });

  // Protection/Penetration interaction
  game.on(EventType.AddProtection, BuffPriority.Exact, event => {
    // Get the remaining amount of stacks that can be applied to protection
    const overflow = event.amount - event.source.penetrationStacks;
    // The rest we can deduct to the penetrationStacks
    const deduction = Math.min(event.source.penetrationStacks, event.amount);
    // For the final amount, add it to current stacks
    if (overflow > 0) {
      event.source.protectionStacks += overflow;
    }
    game.triggerBuff(EventType.RemovePenetration, event.source, deduction);
  });

  // Re-adjust protection stacks when consumed.
  game.on(EventType.RemoveProtection, BuffPriority.Exact, event => {
    event.amount = Math.min(event.amount, event.target.protectionStacks);
    event.target.protectionStacks -= event.amount;
  });
}
