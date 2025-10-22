import { TriggerEnergyFlags } from '../flags';
import type { Game } from '../game';
import { log } from '../log';
import {
  Energy,
  EnergyPriority,
  EventPriority,
  GameEvents,
  RoundEvents,
} from '../types';
import { createTimer } from './tick';

const DEFAULT_PERIOD = 1.0 * 1000;
const CONSUMABLE_STACKS = 0.4;

export function setupSpeedMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Speed mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      createTimer(round, DEFAULT_PERIOD, () => {
        round.tickSpeed(source, TriggerEnergyFlags.Natural);
        return true;
      });
    });

    round.on(RoundEvents.TickSpeed, EnergyPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Speed, event.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Speed) {
        const consumable = event.source.getEnergy(Energy.Speed, false);
        round.removeEnergy(
          Energy.Speed,
          event.source,
          consumable === 1 ? consumable : consumable * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Speed) {
        log(`${event.source.owner.name}'s Speed changed to ${event.amount}`);
        event.source.setEnergy(Energy.Speed, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type !== Energy.Speed) {
        return;
      }
      if (event.permanent) {
        round.setEnergy(
          Energy.Speed,
          event.source,
          event.source.getEnergy(Energy.Speed, true) + event.amount,
          true,
        );
        return;
      }

      let amount = event.amount;

      if (event.source.getEnergy(Energy.Slow, false) > 0) {
        /**
         * Counter Slow by removing energy from it
         */
        round.removeEnergy(Energy.Slow, event.source, amount, false);

        amount = -(event.source.getEnergy(Energy.Slow, false) - event.amount);
      }

      if (amount > 0) {
        log(`${event.source.owner.name} gained ${amount} energy of Speed`);
        round.setEnergy(
          Energy.Speed,
          event.source,
          event.source.getEnergy(Energy.Speed, false) + amount,
          false,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Speed) {
        log(`${event.source.owner.name} lost ${event.amount} energy of Speed`);
        round.setEnergy(
          Energy.Speed,
          event.source,
          event.source.getEnergy(Energy.Speed, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
