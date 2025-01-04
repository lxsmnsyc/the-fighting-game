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

export function setupCorrosionMechanics(game: Game): void {
  game.on(GameEventType.NextRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Corrosion mechanics.');

    // Trigger Corrosion consumption when about to take damage.
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
      // Get 50% of the Corrosion
      const currentCorrosion = event.target.stacks[Stack.Corrosion];
      if (currentCorrosion > 0) {
        event.amount = Math.max(0, event.amount - currentCorrosion);
        event.flag |= DamageFlags.Reduced;
        round.consumeStack(Stack.Corrosion, event.target);
      }
    });

    round.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Corrosion) {
        const current = event.source.stacks[Stack.Corrosion];
        round.removeStack(
          Stack.Corrosion,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEventType.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Corrosion) {
        const clamped = Math.max(0, event.amount);
        log(
          `${event.source.owner.name}'s Corrosion stacks changed to ${clamped}`,
        );
        event.source.stacks[Stack.Corrosion] = clamped;
      }
    });

    round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Corrosion) {
        /**
         * Counter Armor by removing stacks from it
         */
        if (event.source.stacks[Stack.Armor] > 0) {
          const diff = event.source.stacks[Stack.Armor] - event.amount;
          round.removeStack(Stack.Armor, event.source, event.amount);

          if (diff < 0) {
            log(
              `${event.source.owner.name} gained ${-diff} stacks of Corrosion`,
            );
            round.setStack(
              Stack.Corrosion,
              event.source,
              event.source.stacks[Stack.Corrosion] - diff,
            );
          }
        } else {
          log(
            `${event.source.owner.name} gained ${event.amount} stacks of Corrosion`,
          );
          round.setStack(
            Stack.Corrosion,
            event.source,
            event.source.stacks[Stack.Corrosion] + event.amount,
          );
        }
      }
    });

    round.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Corrosion) {
        log(
          `${event.source.owner.name} lost ${event.amount} stacks of Corrosion`,
        );
        round.setStack(
          Stack.Corrosion,
          event.source,
          event.source.stacks[Stack.Corrosion] - event.amount,
        );
      }
    });
  });
}
