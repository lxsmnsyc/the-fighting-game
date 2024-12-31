import type { Game } from '../game';
import { log } from '../log';
import {
  DamageFlags,
  DamagePriority,
  DamageType,
  EventPriority,
  GameEventType,
  RoundEventType,
  Stack,
  StackPriority,
} from '../types';

const CONSUMABLE_STACKS = 0.5;

export function setupArmorMechanics(game: Game): void {
  game.on(GameEventType.NextRound, EventPriority.Pre, ({ round }) => {
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
        const clamped = Math.max(0, event.amount);
        log(`${event.source.owner.name}'s Armor stacks changed to ${clamped}`);
        event.source.stacks[Stack.Armor] = clamped;
      }
    });

    round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Armor) {
        /**
         * Counter Corrosion by removing stacks from it
         */
        if (event.source.stacks[Stack.Corrosion] > 0) {
          const diff = event.source.stacks[Stack.Corrosion] - event.amount;
          round.removeStack(Stack.Corrosion, event.source, event.amount);

          if (diff < 0) {
            log(`${event.source.owner.name} gained ${-diff} stacks of Armor`);
            round.setStack(
              Stack.Armor,
              event.source,
              event.source.stacks[Stack.Armor] - diff,
            );
          }
        } else {
          log(
            `${event.source.owner.name} gained ${event.amount} stacks of Armor`,
          );
          round.setStack(
            Stack.Armor,
            event.source,
            event.source.stacks[Stack.Armor] + event.amount,
          );
        }
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
  });
}
