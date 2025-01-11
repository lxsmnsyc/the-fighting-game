import type { Game } from '../game';
import { log } from '../log';
import {
  EventPriority,
  GameEventType,
  HealingFlags,
  RoundEventType,
  Stack,
  StackPriority,
  Stat,
} from '../types';

const CONSUMABLE_STACKS = 0.4;

export function setupHealingMechanics(game: Game): void {
  game.on(GameEventType.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Healing mechanics.');

    round.on(RoundEventType.Heal, EventPriority.Exact, event => {
      if (!(event.flag & HealingFlags.Missed)) {
        log(`${event.source.owner.name} healed ${event.amount} of Health`);
        round.addStat(Stat.Health, event.source, event.amount);
      }
    });

    round.on(RoundEventType.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Healing) {
        const current = event.source.stacks[Stack.Healing];
        if (current > 0) {
          round.heal(event.source, current, 0);
        }
        round.removeStack(
          Stack.Healing,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEventType.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Healing) {
        const clamped = Math.max(0, event.amount);
        log(
          `${event.source.owner.name}'s Healing stacks changed to ${clamped}`,
        );
        event.source.stacks[Stack.Healing] = clamped;
      }
    });

    round.on(RoundEventType.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Healing) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Healing`,
        );
        round.setStack(
          Stack.Healing,
          event.source,
          event.source.stacks[Stack.Healing] + event.amount,
        );
      }
    });

    round.on(RoundEventType.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Healing) {
        log(
          `${event.source.owner.name} lost ${event.amount} stacks of Healing`,
        );
        round.setStack(
          Stack.Healing,
          event.source,
          event.source.stacks[Stack.Healing] - event.amount,
        );
      }
    });
  });
}
