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
} from '../types';
import { createTimer } from './tick';

const DEFAULT_PERIOD = 1.0 * 1000;
const CONSUMABLE_STACKS = 0.4;

export function setupHealingMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Healing mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      createTimer(round, DEFAULT_PERIOD, () => {
        round.naturalHeal(source, 0);
        return true;
      });
    });

    round.on(RoundEvents.NaturalHeal, EventPriority.Exact, event => {
      if (event.flag & HealingFlags.Failed) {
        return;
      }
      const stacks = event.source.getTotalStacks(Stack.Healing);
      if (stacks > 0) {
        round.heal(event.source, stacks, event.flag);
      }
      if (event.flag & HealingFlags.NoConsume) {
        return;
      }
      round.consumeStack(Stack.Healing, event.source);
    });

    round.on(RoundEvents.Heal, EventPriority.Exact, event => {
      if (event.flag & HealingFlags.Failed) {
        return;
      }
      log(`${event.source.owner.name} healed ${event.amount} of Health`);
      round.addStat(Stat.Health, event.source, event.amount);
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
