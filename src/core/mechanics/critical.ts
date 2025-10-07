import type { Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import {
  DamageFlags,
  DamagePriority,
  DamageType,
  Energy,
  EnergyPriority,
  EventPriority,
  GameEvents,
  RoundEvents,
  TriggerEnergyFlags,
} from '../types';

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
      if (event.flag & (DamageFlags.Missed | DamageFlags.Critical)) {
        return;
      }
      // Check if player can crit
      if (event.type === DamageType.Attack) {
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

    round.on(RoundEvents.Critical, EventPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        event.parent.amount *= event.multiplier;
        log(`${event.parent.source.owner.name} triggered a critical.`);
        event.parent.flag |= DamageFlags.Critical;
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Critical, event.parent.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Critical) {
        const current = event.source.getEnergy(Energy.Critical, false);
        round.removeEnergy(
          Energy.Critical,
          event.source,
          Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Critical) {
        log(
          `${event.source.owner.name}'s Critical energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Critical, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
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

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
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
