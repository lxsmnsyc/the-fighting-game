import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEvents,
  HealingFlags,
  RoundEvents,
  Stack,
  StackPriority,
  Stat,
  TriggerStackFlags,
} from '../types';

const DEFAULT_PERIOD = 1.0 * 1000;
const CONSUMABLE_STACKS = 0.4;

export function setupHealingMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Healing mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      let elapsed = 0;
      let ready = true;

      round.on(RoundEvents.Tick, EventPriority.Exact, event => {
        if (!ready) {
          elapsed += event.delta;
          if (elapsed >= DEFAULT_PERIOD) {
            elapsed -= DEFAULT_PERIOD;
            ready = true;
          }
        }
        if (ready && source) {
          ready = false;
          round.triggerStack(Stack.Healing, source, TriggerStackFlags.Consume);
        }
      });
    });

    round.on(RoundEvents.TriggerStack, EventPriority.Exact, event => {
      if (event.type !== Stack.Healing) {
        return;
      }
      if (event.flag & TriggerStackFlags.Failed) {
        return;
      }

      const stacks = event.source.getTotalStacks(Stack.Healing);
      if (stacks > 0) {
        round.heal(event.source, stacks, 0);
      }
      if (event.flag & TriggerStackFlags.Consume) {
        round.consumeStack(Stack.Attack, event.source);
      }
    });

    round.on(RoundEvents.Heal, EventPriority.Exact, event => {
      if (!(event.flag & HealingFlags.Missed)) {
        log(`${event.source.owner.name} healed ${event.amount} of Health`);
        round.addStat(Stat.Health, event.source, event.amount);
      }
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Healing) {
        const current = event.source.getStacks(Stack.Healing, false);
        round.removeStack(
          Stack.Healing,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Healing) {
        const clamped = Math.max(0, event.amount);
        log(
          `${event.source.owner.name}'s Healing stacks changed to ${clamped}`,
        );
        event.source.setStacks(Stack.Healing, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Healing) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Healing`,
        );
        round.setStack(
          Stack.Healing,
          event.source,
          event.source.getStacks(Stack.Healing, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Healing) {
        log(
          `${event.source.owner.name} lost ${event.amount} stacks of Healing`,
        );
        round.setStack(
          Stack.Healing,
          event.source,
          event.source.getStacks(Stack.Healing, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
