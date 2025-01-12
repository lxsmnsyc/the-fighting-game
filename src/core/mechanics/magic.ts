import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
} from '../types';

const CONSUMABLE_STACKS = 0.4;

export function setupMagicMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Magic mechanics.');

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Magic) {
        const current = event.source.stacks[Stack.Magic];
        if (current > 0) {
          round.dealDamage(
            DamageType.Magic,
            event.source,
            round.getEnemyUnit(event.source),
            current,
            0,
          );
        }
        round.removeStack(
          Stack.Magic,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Magic) {
        const clamped = Math.max(0, event.amount);
        log(`${event.source.owner.name}'s Magic stacks changed to ${clamped}`);
        event.source.stacks[Stack.Magic] = clamped;
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
          event.source.stacks[Stack.Magic] + event.amount,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Magic) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Magic`);
        round.setStack(
          Stack.Magic,
          event.source,
          event.source.stacks[Stack.Magic] - event.amount,
        );
      }
    });
  });
}
