import { DamageFlags, TriggerEnergyFlags } from '../flags';
import type { Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import {
  DamagePriority,
  Energy,
  EventPriority,
  GameEvents,
  RoundEvents,
  ValuePriority,
} from '../types';
import { isMissedDamage } from './damage';

const DEFAULT_CRITICAL_MULTIPLIER = 2;
const MIN_CRITICAL_CHANCE = 0;
const MAX_CRITICAL_CHANCE = 100;
const MAX_CRITICAL_STACKS = 1000;
const CONSUMABLE_STACKS = 0.4;

function getCriticalChance(energy: number): number {
  return lerp(
    MIN_CRITICAL_CHANCE,
    MAX_CRITICAL_CHANCE,
    Math.min(energy / MAX_CRITICAL_STACKS, 1),
  );
}

export function setupCriticalMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Critical mechanics.');

    round.on(RoundEvents.Damage, DamagePriority.Critical, event => {
      if (isMissedDamage(event.flag) || event.flag & DamageFlags.Critical) {
        return;
      }
      // Check if player can crit
      if (event.flag & DamageFlags.Attack) {
        const energy = event.source.getTotalEnergy(Energy.Critical);
        // If there's no critical energy
        if (energy === 0) {
          return;
        }
        // Calculate critical chance
        const currentCriticalChance = getCriticalChance(energy);
        // Push your luck
        const random = event.source.rng.random() * 100;
        if (random > currentCriticalChance) {
          return;
        }

        round.critical(event, DEFAULT_CRITICAL_MULTIPLIER, 0);
      }
    });

    round.on(RoundEvents.Critical, ValuePriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        event.parent.amount *= event.multiplier;
        log(`${event.parent.source.owner.name} triggered a critical.`);
        event.parent.flag |= DamageFlags.Critical;
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Critical, event.parent.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Initial, event => {
      if (event.type === Energy.Critical) {
        const current = event.source.getEnergy(Energy.Critical, false);
        event.amount = current === 1 ? current : current * CONSUMABLE_STACKS;
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Critical) {
        round.removeEnergy(
          Energy.Critical,
          event.source,
          event.amount,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Critical) {
        log(
          `${event.source.owner.name}'s Critical energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Critical, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Critical) {
        log(
          `${event.source.owner.name} gained ${event.amount} energy of Critical`,
        );
        round.setEnergy(
          Energy.Critical,
          event.source,
          event.source.getEnergy(Energy.Critical, event.permanent) +
            event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Critical) {
        log(
          `${event.source.owner.name} lost ${event.amount} energy of Critical`,
        );
        round.setEnergy(
          Energy.Critical,
          event.source,
          event.source.getEnergy(Energy.Critical, event.permanent) -
            event.amount,
          event.permanent,
        );
      }
    });
  });
}
