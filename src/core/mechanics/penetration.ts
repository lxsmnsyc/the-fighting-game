import { EventType, type Game } from '../game';
import { log } from '../log';
import { BuffPriority, DamagePriority, DebuffPriority } from '../priorities';

const CONSUMABLE_PENETRATION_STACKS = 0.5;

export function setupPenetrationMechanics(game: Game): void {
  log('Setting up Penetration mechanics.');
  // Trigger Penetration consumption when about to take damage.
  game.on(EventType.Damage, DamagePriority.Penetration, event => {
    if (!event.flags.dodged) {
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
  game.on(EventType.AddPenetration, DebuffPriority.Exact, event => {
    // Get the remaining amount of stacks that can be applied to protection
    const overflow = event.amount - event.target.protectionStacks;
    // The rest we can deduct to the protectionStacks
    const deduction = Math.min(event.target.protectionStacks, event.amount);
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
  });

  // Re-adjust protection stacks when consumed.
  game.on(EventType.RemovePenetration, BuffPriority.Exact, event => {
    event.amount = Math.min(event.amount, event.source.penetrationStacks);
    event.source.penetrationStacks -= event.amount;
  });
}
