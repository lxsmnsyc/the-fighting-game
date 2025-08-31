import type { Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import {
  AttackFlags,
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
  TriggerStackFlags,
} from '../types';

const MIN_PERIOD = 0.25;
const MAX_PERIOD = 2.5;
const MAX_SPEED = 750;

function getPeriod(speed: number): number {
  return lerp(
    MIN_PERIOD * 1000,
    MAX_PERIOD * 1000,
    Math.min(speed / MAX_SPEED, 1),
  );
}

const CONSUMABLE_STACKS = 0.4;

export function setupAttackMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Attack mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      let elapsed = 0;
      let period = getPeriod(source.getTotalStacks(Stack.Speed));
      let ready = true;

      round.on(RoundEvents.Tick, EventPriority.Exact, event => {
        if (!ready) {
          elapsed += event.delta;
          if (elapsed >= period) {
            elapsed -= period;
            period = getPeriod(source.getTotalStacks(Stack.Speed));
            ready = true;
          }
        }
        if (ready && source) {
          ready = false;
          round.attack(source, 0);
        }
      });
    });

    round.on(RoundEvents.Attack, EventPriority.Exact, event => {
      if (event.flag & AttackFlags.Failed) {
        return;
      }
      round.triggerStack(
        Stack.Attack,
        event.source,
        event.flag & AttackFlags.Consume ? TriggerStackFlags.Consume : 0,
      );
    });

    round.on(RoundEvents.TriggerStack, EventPriority.Exact, event => {
      if (event.type !== Stack.Attack) {
        return;
      }
      if (event.flag & TriggerStackFlags.Failed) {
        return;
      }
      const stacks = event.source.getTotalStacks(Stack.Attack);
      if (stacks > 0) {
        round.dealDamage(
          DamageType.Attack,
          event.source,
          round.getEnemyUnit(event.source),
          stacks,
          0,
        );
      }
      if (event.flag & TriggerStackFlags.Consume) {
        round.consumeStack(Stack.Attack, event.source);
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
