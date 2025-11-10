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

export function setupSpeedMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Speed mechanics.');

    round.on(RoundEvents.SetupUnit, ValuePriority.Post, ({ source }) => {
      createTimer(round, DEFAULT_PERIOD, () => {
        round.tickSpeed(source, TriggerEnergyFlags.Natural);
        return true;
      });
    });

    round.on(RoundEvents.TickSpeed, EventPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Speed, event.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Initial, event => {
      if (event.type === Energy.Speed) {
        const current = event.source.getEnergy(Energy.Speed, false);
        event.amount = current === 1 ? current : current * CONSUMABLE_STACKS;
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Speed) {
        round.removeEnergy(Energy.Speed, event.source, event.amount, false);
      }
    });

    round.on(RoundEvents.SetEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Speed) {
        log(`${event.source.owner.name}'s Speed changed to ${event.amount}`);
        event.source.setEnergy(Energy.Speed, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, ValuePriority.Exact, event => {
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

    round.on(RoundEvents.RemoveEnergy, ValuePriority.Exact, event => {
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
