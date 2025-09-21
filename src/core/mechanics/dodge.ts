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
  TriggerStackFlags,
} from '../types';

const MIN_DODGE_CHANCE = 0;
const MAX_DODGE_CHANCE = 100;
const MAX_DODGE_STACKS = 750;

const CONSUMABLE_STACKS = 0.4;

function getDodgeChance(stack: number): number {
  return lerp(
    MIN_DODGE_CHANCE,
    MAX_DODGE_CHANCE,
    Math.min(stack / MAX_DODGE_STACKS, 1),
  );
}

export function setupDodgeMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Dodge mechanics.');
    round.on(RoundEvents.Damage, DamagePriority.Dodge, event => {
      if (event.flag & DamageFlags.Missed) {
        return;
      }
      if (event.type === DamageType.Attack) {
        // Check if player can evade it
        const stacks = event.target.getTotalStacks(Stack.Dodge);
        // If there's an dodge stack
        if (stacks === 0) {
          return;
        }
        // Calculat dodge chance
        const currentDodge = getDodgeChance(stacks);
        // Push your luck
        const random = event.target.rng.random() * 100;
        if (random > currentDodge) {
          return;
        }
        log(`${event.target.owner.name} dodged ${event.amount} of damage.`);
        event.flag |= DamageFlags.Missed;
        round.triggerStack(
          Stack.Dodge,
          event.target,
          0,
        );
      }
    });

    round.on(RoundEvents.TriggerStack, StackPriority.Exact, event => {
      if (event.type !== Stack.Dodge) {
        return;
      }
      if (event.flag & TriggerStackFlags.Failed) {
        return;
      }
      if (event.flag & TriggerStackFlags.NoConsume) {
        return;
      }
      round.consumeStack(Stack.Dodge, event.source);
    });

    round.on(RoundEvents.ConsumeStack, StackPriority.Exact, event => {
      if (event.type === Stack.Dodge) {
        const current = event.source.getStacks(Stack.Dodge, false);
        round.removeStack(
          Stack.Dodge,
          event.source,
          Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetStack, StackPriority.Exact, event => {
      if (event.type === Stack.Dodge) {
        log(`${event.source.owner.name}'s Dodge changed to ${event.amount}`);
        event.source.setStacks(Stack.Dodge, event.amount, event.permanent);
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
          event.source.getStacks(Stack.Dodge, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveStack, StackPriority.Exact, event => {
      if (event.type === Stack.Dodge) {
        log(`${event.source.owner.name} lost ${event.amount} stacks of Dodge`);
        round.setStack(
          Stack.Dodge,
          event.source,
          event.source.getStacks(Stack.Dodge, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
