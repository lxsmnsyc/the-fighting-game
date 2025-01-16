import type { Game } from '../game';
import { lerp } from '../lerp';
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

export function setupMagicMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Magic mechanics.');

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
          round.triggerStack(Stack.Magic, source, TriggerStackFlags.Consume);
        }
      });
    });

    round.on(RoundEvents.TriggerStack, EventPriority.Exact, event => {
      if (event.type !== Stack.Magic) {
        return;
      }
      if (event.flag & TriggerStackFlags.Failed) {
        return;
      }
      const stacks = event.source.getTotalStacks(Stack.Magic);
      if (stacks > 0) {
        round.dealDamage(
          DamageType.Magic,
          event.source,
          round.getEnemyUnit(event.source),
          stacks,
          0,
        );
      }
      if (event.flag & TriggerStackFlags.Consume) {
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
