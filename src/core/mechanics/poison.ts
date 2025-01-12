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

export function setupPoisonMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Poison mechanics.');

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Poison) {
        const current = event.source.stacks[Stack.Poison];
        if (current > 0) {
          round.dealDamage(
            DamageType.Poison,
            round.getEnemyUnit(event.source),
            event.source,
            current,
            0,
          );
        }
        round.removeStack(
          Stack.Poison,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Poison) {
        const clamped = Math.max(0, event.amount);
        log(`${event.source.owner.name}'s Poison stacks changed to ${clamped}`);
        event.source.stacks[Stack.Poison] = clamped;
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Poison) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Poison`,
        );
        round.setStack(
          Stack.Poison,
          event.source,
          event.source.stacks[Stack.Poison] + event.amount,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Poison) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Poison`);
        round.setStack(
          Stack.Poison,
          event.source,
          event.source.stacks[Stack.Poison] - event.amount,
        );
      }
    });
  });
}
