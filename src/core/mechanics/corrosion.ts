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

export function setupCorrosionMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Corrosion mechanics.');

    // Trigger Corrosion consumption when about to take damage.
    round.on(RoundEvents.Damage, DamagePriority.Corrosion, event => {
      if (event.flag & (DamageFlags.Missed | DamageFlags.Corrosion)) {
        return;
      }
      if (event.type === DamageType.Poison || event.type === DamageType.Pure) {
        return;
      }
      const currentCorrosion = event.target.getTotalStacks(Stack.Corrosion);
      if (currentCorrosion > 0) {
        round.triggerCorrosion(event, currentCorrosion, 0);
      }
    });

    round.on(RoundEvents.Corrosion, EventPriority.Exact, event => {
      if (event.flag & TriggerStackFlags.Disabled) {
        return;
      }
      if (!(event.flag & TriggerStackFlags.Failed)) {
        event.parent.amount = Math.max(0, event.parent.amount + event.value);
        event.parent.flag |= DamageFlags.Corrosion;
      }
      if (!(event.flag & TriggerStackFlags.NoConsume)) {
        round.consumeStack(Stack.Corrosion, event.parent.source);
      }
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Corrosion) {
        const current = event.source.getStacks(Stack.Corrosion, false);
        round.removeStack(
          Stack.Corrosion,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Corrosion) {
        log(
          `${event.source.owner.name}'s Corrosion stacks changed to ${event.amount}`,
        );
        event.source.setStacks(Stack.Corrosion, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type !== Stack.Corrosion) {
        return;
      }
      if (event.permanent) {
        round.setStack(
          Stack.Corrosion,
          event.source,
          event.source.getStacks(Stack.Corrosion, true) + event.amount,
          true,
        );
        return;
      }

      let amount = event.amount;

      if (event.source.getStacks(Stack.Armor, false) > 0) {
        /**
         * Counter Armor by removing stacks from it
         */
        round.removeStack(Stack.Armor, event.source, amount, false);

        amount = -(event.source.getStacks(Stack.Armor, false) - event.amount);
      }

      if (amount > 0) {
        log(`${event.source.owner.name} gained ${amount} stacks of Corrosion`);
        round.setStack(
          Stack.Corrosion,
          event.source,
          event.source.getStacks(Stack.Corrosion, false) + amount,
          false,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Corrosion) {
        log(
          `${event.source.owner.name} lost ${event.amount} stacks of Corrosion`,
        );
        round.setStack(
          Stack.Corrosion,
          event.source,
          event.source.getStacks(Stack.Corrosion, event.permanent) -
            event.amount,
          event.permanent,
        );
      }
    });
  });
}
