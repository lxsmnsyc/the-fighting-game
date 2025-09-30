import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  Energy,
  EnergyPriority,
  EventPriority,
  GameEvents,
  RoundEvents,
  TriggerEnergyFlags,
} from '../types';
import { createTimer } from './tick';

const DEFAULT_PERIOD = 1.0 * 1000;
const CONSUMABLE_STACKS = 0.4;

export function setupPoisonMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Poison mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      createTimer(round, DEFAULT_PERIOD, () => {
        round.triggerEnergy(Energy.Poison, source, 0);
        return true;
      });
    });

    round.on(RoundEvents.TickSpeed, EnergyPriority.Exact, event => {
      if (event.flag & TriggerEnergyFlags.Disabled) {
        return;
      }
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        const energy = event.source.getTotalEnergy(Energy.Poison);
        if (energy > 0) {
          round.dealDamage(
            DamageType.Poison,
            round.getEnemyUnit(event.source),
            event.source,
            energy,
            0,
          );
        } else {
          return;
        }
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Poison, event.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Poison) {
        const current = event.source.getEnergy(Energy.Poison, false);
        round.removeEnergy(
          Energy.Poison,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Poison) {
        log(
          `${event.source.owner.name}'s Poison energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Poison, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Poison) {
        log(
          `${event.source.owner.name} gained ${event.amount} energy of Poison`,
        );
        round.setEnergy(
          Energy.Poison,
          event.source,
          event.source.getEnergy(Energy.Poison, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Poison) {
        log(`${event.source.owner.name} lost ${event.amount} energy of Poison`);
        round.setEnergy(
          Energy.Poison,
          event.source,
          event.source.getEnergy(Energy.Poison, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
