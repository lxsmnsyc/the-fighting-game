import type { Game } from '../game';
import { log } from '../log';
import {
  DamageFlags,
  DamagePriority,
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
  TriggerStackFlags,
} from '../types';

const CONSUMABLE_STACKS = 0.4;

export function setupArmorMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Armor mechanics.');

    // Trigger Armor consumption when about to take damage.
    round.on(RoundEvents.Damage, DamagePriority.Armor, event => {
      if (event.flag & (DamageFlags.Missed | DamageFlags.Armor)) {
        return;
      }
      if (event.type === DamageType.Poison || event.type === DamageType.Pure) {
        return;
      }
      const currentArmor = event.target.getTotalStacks(Stack.Armor);
      if (currentArmor > 0) {
        round.triggerArmor(event, currentArmor, 0);
      }
    });

    round.on(RoundEvents.Armor, EventPriority.Exact, event => {
      if (event.flag & TriggerStackFlags.Disabled) {
        return;
      }
      if (!(event.flag & TriggerStackFlags.Failed)) {
        event.parent.amount = Math.max(0, event.parent.amount - event.value);
        event.parent.flag |= DamageFlags.Armor;
      }
      if (!(event.flag & TriggerStackFlags.NoConsume)) {
        round.consumeStack(Stack.Armor, event.parent.source);
      }
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Armor) {
        const current = event.source.getStacks(Stack.Armor, false);
        round.removeStack(
          Stack.Armor,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Armor) {
        log(
          `${event.source.owner.name}'s Armor stacks changed to ${event.amount}`,
        );
        event.source.setStacks(Stack.Armor, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type !== Stack.Armor) {
        return;
      }
      if (event.permanent) {
        round.setStack(
          Stack.Armor,
          event.source,
          event.source.getStacks(Stack.Armor, true) + event.amount,
          true,
        );
        return;
      }

      let amount = event.amount;
      if (event.source.getStacks(Stack.Corrosion, false) > 0) {
        /**
         * Counter Corrosion by removing stacks from it
         */
        round.removeStack(Stack.Corrosion, event.source, amount, false);

        amount = -(event.source.getStacks(Stack.Corrosion, false) - amount);
      }

      if (amount > 0) {
        log(`${event.source.owner.name} gained ${amount} stacks of Armor`);
        round.setStack(
          Stack.Armor,
          event.source,
          event.source.getStacks(Stack.Armor, false) + amount,
          false,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Armor) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Armor`);
        round.setStack(
          Stack.Armor,
          event.source,
          event.source.getStacks(Stack.Armor, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
