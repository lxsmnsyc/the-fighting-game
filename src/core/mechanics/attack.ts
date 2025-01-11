import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  EventPriority,
  GameEventType,
  RoundEventType,
  Stack,
  StackPriority,
} from '../types';

const CONSUMABLE_STACKS = 0.4;

export function setupAttackMechanics(game: Game): void {
  game.on(GameEventType.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Attack mechanics.');

    round.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Attack) {
        const current = event.source.stacks[Stack.Attack];
        if (current > 0) {
          round.dealDamage(
            DamageType.Attack,
            event.source,
            round.getEnemyUnit(event.source),
            current,
            0,
          );
        }
        round.removeStack(
          Stack.Attack,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEventType.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Attack) {
        const clamped = Math.max(0, event.amount);
        log(`${event.source.owner.name}'s Attack stacks changed to ${clamped}`);
        event.source.stacks[Stack.Attack] = clamped;
      }
    });

    round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Attack) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Attack`,
        );
        round.setStack(
          Stack.Attack,
          event.source,
          event.source.stacks[Stack.Attack] + event.amount,
        );
      }
    });

    round.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Attack) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Attack`);
        round.setStack(
          Stack.Attack,
          event.source,
          event.source.stacks[Stack.Attack] - event.amount,
        );
      }
    });
  });
}
