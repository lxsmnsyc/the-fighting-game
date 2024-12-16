import { log } from '../log';
import { DamagePriority, StackPriority } from '../priorities';
import type { Round } from '../round';
import { DamageFlags, DamageType, RoundEventType, Stack } from '../types';

const CONSUMABLE_STACKS = 0.5;

export function setupArmorMechanics(round: Round): void {
  log('Setting up Armor mechanics.');
  // Trigger Armor consumption when about to take damage.
  round.on(RoundEventType.Damage, DamagePriority.Armor, event => {
    if (event.flag & (DamageFlags.Missed | DamageFlags.Reduced)) {
      return;
    }
    if (event.type === DamageType.Poison) {
      return;
    }
    if (event.type === DamageType.Pure) {
      return;
    }
    // Get 50% of the armor
    const currentArmor = event.target.stacks[Stack.Armor];
    if (currentArmor > 0) {
      event.amount = Math.max(0, event.amount - currentArmor);
      event.flag |= DamageFlags.Reduced;
      round.consumeStack(Stack.Armor, event.target);
    }
  });

  round.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      const current = event.source.stacks[Stack.Armor];
      round.removeStack(
        Stack.Armor,
        event.source,
        current === 1 ? current : current * CONSUMABLE_STACKS,
      );
    }
  });

  round.on(RoundEventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      log(
        `${event.source.owner.name}'s Armor stacks changed to ${event.amount}`,
      );
      event.source.stacks[Stack.Armor] = event.amount;
    }
  });

  round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      log(`${event.source.owner.name} gained ${event.amount} stacks of Armor`);
      round.setStack(
        Stack.Armor,
        event.source,
        event.source.stacks[Stack.Armor] + event.amount,
      );
    }
  });

  round.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      log(`${event.source.owner.name} lost ${event.amount} stacks of Armor`);
      round.setStack(
        Stack.Armor,
        event.source,
        event.source.stacks[Stack.Armor] - event.amount,
      );
    }
  });
}
