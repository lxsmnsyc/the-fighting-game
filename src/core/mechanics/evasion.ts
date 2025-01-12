import type { Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import {
  DamageFlags,
  DamagePriority,
  DamageType,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stack,
  StackPriority,
} from '../types';

const MIN_EVASION_CHANCE = 0;
const MAX_EVASION_CHANCE = 100;
const MAX_EVASION_STACKS = 750;

const CONSUMABLE_STACKS = 0.4;

function getDodgeChance(stack: number): number {
  return lerp(
    MIN_EVASION_CHANCE,
    MAX_EVASION_CHANCE,
    Math.min(stack / MAX_EVASION_STACKS, 1),
  );
}

export function setupDodgeMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Dodge mechanics.');
    round.on(RoundEvents.Damage, DamagePriority.Dodge, event => {
      if (event.flag & DamageFlags.Missed) {
        return;
      }
      // Check if player can evade it
      const stacks = event.target.stacks[Stack.Dodge];
      if (event.type === DamageType.Attack && stacks !== 0) {
        // If there's an evasion stack
        if (stacks === 0) {
          return;
        }
        // Calculat evasion chance
        const currentDodge = getDodgeChance(stacks);
        // Push your luck
        const random = event.target.rng.random() * 100;
        if (random > currentDodge) {
          return;
        }
        log(`${event.target.owner.name} dodged ${event.amount} of damage.`);
        event.flag |= DamageFlags.Missed;
        round.consumeStack(Stack.Dodge, event.target);
      }
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Dodge) {
        const current = event.source.stacks[Stack.Dodge];
        round.removeStack(
          Stack.Dodge,
          event.source,
          Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Dodge) {
        log(`${event.source.owner.name}'s Dodge changed to ${event.amount}`);
        event.source.stacks[Stack.Dodge] = event.amount;
      }
    });

    round.on(RoundEvents.AddStack, StackPriority.Exact, event => {
      if (event.type === Stack.Dodge) {
        log(
          `${event.source.owner.name} gained ${event.amount} stacks of Dodge`,
        );
        round.setStack(
          Stack.Dodge,
          event.source,
          event.source.stacks[Stack.Dodge] + event.amount,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Dodge) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Dodge`);
        round.setStack(
          Stack.Dodge,
          event.source,
          event.source.stacks[Stack.Dodge] - event.amount,
        );
      }
    });
  });
}
