import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
  TriggerFlags,
  TriggerStackFlags,
} from '../types';
import { createCooldown } from './tick';

const MIN_PERIOD = 0.25;
const MAX_PERIOD = 2.5;

const CONSUMABLE_STACKS = 0.4;

export function setupAttackMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Attack mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      createCooldown(round, source, MIN_PERIOD, MAX_PERIOD, () => {
        round.naturalAttack(source, 0);
        return true;
      });
    });

    round.on(RoundEvents.NaturalAttack, EventPriority.Exact, event => {
      if (event.flag & TriggerStackFlags.Disabled) {
        return;
      }
      if (!(event.flag & TriggerStackFlags.Failed)) {
        const stacks = event.source.getTotalStacks(Stack.Attack);
        if (stacks > 0) {
          round.attack(event.source, stacks, event.flag);
        }
      }
      if (!(event.flag & TriggerStackFlags.NoConsume)) {
        round.consumeStack(Stack.Attack, event.source);
      }
    });

    round.on(RoundEvents.Attack, EventPriority.Exact, event => {
      if (!(event.flag & TriggerFlags.Disabled)) {
        round.dealDamage(
          DamageType.Attack,
          event.source,
          round.getEnemyUnit(event.source),
          event.amount,
          0,
        );
      }
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Attack) {
        const consumable = event.source.getStacks(Stack.Attack, false);
        round.removeStack(
          Stack.Attack,
          event.source,
          consumable === 1 ? consumable : consumable * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Attack) {
        log(
          `${event.source.owner.name}'s Attack stacks changed to ${event.amount}`,
        );
        event.source.setStacks(Stack.Attack, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Attack) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Attack`,
        );
        round.setStack(
          Stack.Attack,
          event.source,
          event.source.getStacks(Stack.Attack, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Attack) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Attack`);
        round.setStack(
          Stack.Attack,
          event.source,
          event.source.getStacks(Stack.Attack, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
