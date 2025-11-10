import { TriggerEnergyFlags } from '../flags';
import type { Game } from '../game';
import { log } from '../log';
import {
  Energy,
  EventPriority,
  GameEvents,
  RoundEvents,
  ValuePriority,
} from '../types';
import { createTimer } from './tick';

const DEFAULT_PERIOD = 1.0 * 1000;
const CONSUMABLE_STACKS = 0.4;

export function setupSlowMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Slow mechanics.');

    round.on(RoundEvents.SetupUnit, ValuePriority.Post, ({ source }) => {
      createTimer(round, DEFAULT_PERIOD, () => {
        round.tickSlow(source, TriggerEnergyFlags.Natural);
        return true;
      });
    });

    round.on(RoundEvents.TickSlow, EventPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Slow, event.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Initial, event => {
      if (event.type === Energy.Slow) {
        const current = event.source.getEnergy(Energy.Slow, false);
        event.amount = current === 1 ? current : current * CONSUMABLE_STACKS;
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Slow) {
        round.removeEnergy(Energy.Slow, event.source, event.amount, false);
      }
    });

    round.on(RoundEvents.SetEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Slow) {
        log(`${event.source.owner.name}'s Slow changed to ${event.amount}`);
        event.source.setEnergy(Energy.Slow, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, ValuePriority.Exact, event => {
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

    round.on(RoundEvents.RemoveEnergy, ValuePriority.Exact, event => {
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
