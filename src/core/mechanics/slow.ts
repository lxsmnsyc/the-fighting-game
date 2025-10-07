import type { Game } from '../game';
import { log } from '../log';
import {
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

export function setupSlowMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Slow mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      createTimer(round, DEFAULT_PERIOD, () => {
        round.tickSlow(source, 0);
        return true;
      });
    });

    round.on(RoundEvents.TickSlow, EnergyPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Slow, event.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Slow) {
        const consumable = event.source.getEnergy(Energy.Slow, false);
        round.removeEnergy(
          Energy.Slow,
          event.source,
          consumable === 1 ? consumable : consumable * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Slow) {
        log(`${event.source.owner.name}'s Slow changed to ${event.amount}`);
        event.source.setEnergy(Energy.Slow, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type !== Energy.Slow) {
        return;
      }
      if (event.permanent) {
        round.setEnergy(
          Energy.Slow,
          event.source,
          event.source.getEnergy(Energy.Slow, true) + event.amount,
          true,
        );
        return;
      }

      let amount = event.amount;

      if (event.source.getEnergy(Energy.Speed, false) > 0) {
        /**
         * Counter Speed by removing energy from it
         */
        round.removeEnergy(Energy.Speed, event.source, amount, false);

        amount = -(event.source.getEnergy(Energy.Speed, false) - event.amount);
      }

      if (amount > 0) {
        log(`${event.source.owner.name} gained ${amount} energy of Slow`);
        round.setEnergy(
          Energy.Slow,
          event.source,
          event.source.getEnergy(Energy.Slow, false) + amount,
          false,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Slow) {
        log(`${event.source.owner.name} lost ${event.amount} energy of Slow`);
        round.setEnergy(
          Energy.Slow,
          event.source,
          event.source.getEnergy(Energy.Slow, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
