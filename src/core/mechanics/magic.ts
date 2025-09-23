import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
  TriggerStackFlags,
} from '../types';

const CONSUMABLE_STACKS = 0.4;

export function setupMagicMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Magic mechanics.');

    round.on(RoundEvents.TickMagic, EventPriority.Exact, event => {
      if (event.flag & TriggerStackFlags.Disabled) {
        return;
      }
      if (!(event.flag & TriggerStackFlags.Failed)) {
        const stacks = event.source.getTotalStacks(Stack.Magic);
        if (stacks > 0) {
          round.dealDamage(
            DamageType.Magical,
            event.source,
            round.getEnemyUnit(event.source),
            stacks,
            0,
          );
        }
      }
      if (!(event.flag & TriggerStackFlags.NoConsume)) {
        round.consumeStack(Stack.Magic, event.source);
      }
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Magic) {
        const consumable = event.source.getStacks(Stack.Magic, false);
        round.removeStack(
          Stack.Magic,
          event.source,
          consumable === 1 ? consumable : consumable * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Magic) {
        log(
          `${event.source.owner.name}'s Magic stacks changed to ${event.amount}`,
        );
        event.source.setStacks(Stack.Magic, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Magic) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Magic`,
        );
        round.setStack(
          Stack.Magic,
          event.source,
          event.source.getStacks(Stack.Magic, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Magic) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Magic`);
        round.setStack(
          Stack.Magic,
          event.source,
          event.source.getStacks(Stack.Magic, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
