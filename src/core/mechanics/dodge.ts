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
import { isMissedDamage } from './damage';

const MIN_DODGE_CHANCE = 0;
const MAX_DODGE_CHANCE = 100;
const MAX_DODGE_STACKS = 1000;

const CONSUMABLE_STACKS = 0.4;

function getDodgeChance(energy: number): number {
  return lerp(
    MIN_DODGE_CHANCE,
    MAX_DODGE_CHANCE,
    Math.min(energy / MAX_DODGE_STACKS, 1),
  );
}

export function setupDodgeMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Dodge mechanics.');
    round.on(RoundEvents.Damage, DamagePriority.Dodge, event => {
      if (isMissedDamage(event.flag)) {
        return;
      }
      if (event.type === DamageType.Attack) {
        // Check if player can evade it
        const energy = event.target.getTotalEnergy(Energy.Dodge);
        // If there's an dodge energy
        if (energy === 0) {
          return;
        }
        // Calculat dodge chance
        const currentDodge = getDodgeChance(energy);
        // Push your luck
        const random = event.target.rng.random() * 100;
        if (random > currentDodge) {
          return;
        }
        round.dodge(event, 0);
      }
    });

    round.on(RoundEvents.Dodge, EventPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        log(
          `${event.parent.target.owner.name} dodged ${event.parent.amount} of damage.`,
        );
        event.parent.flag |= DamageFlags.Missed;
      }
      if (event.flag & TriggerEnergyFlags.NoConsume) {
        return;
      }
      round.consumeEnergy(Energy.Dodge, event.parent.source);
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Dodge) {
        const current = event.source.getEnergy(Energy.Dodge, false);
        round.removeEnergy(
          Energy.Dodge,
          event.source,
          Math.abs(current) === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Dodge) {
        log(`${event.source.owner.name}'s Dodge changed to ${event.amount}`);
        event.source.setEnergy(Energy.Dodge, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Dodge) {
        log(
          `${event.source.owner.name} gained ${event.amount} energy of Dodge`,
        );
        round.setEnergy(
          Energy.Dodge,
          event.source,
          event.source.getEnergy(Energy.Dodge, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Dodge) {
        log(`${event.source.owner.name} lost ${event.amount} energy of Dodge`);
        round.setEnergy(
          Energy.Dodge,
          event.source,
          event.source.getEnergy(Energy.Dodge, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
