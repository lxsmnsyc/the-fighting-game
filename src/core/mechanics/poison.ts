import { DamageFlags, TriggerEnergyFlags } from '../flags';
import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  Energy,
  EventPriority,
  GameEvents,
  RoundEvents,
  ValuePriority,
} from '../types';
import { createTimer } from './tick';

const DEFAULT_PERIOD = 1.0 * 1000;
const CONSUMABLE_STACKS = 0.4;

export function setupPoisonMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Poison mechanics.');

    round.on(RoundEvents.SetupUnit, ValuePriority.Post, ({ source }) => {
      createTimer(round, DEFAULT_PERIOD, () => {
        round.tickPoison(source, TriggerEnergyFlags.Natural);
        return true;
      });
    });

    round.on(RoundEvents.TickPoison, EventPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        const energy = event.source.getTotalEnergy(Energy.Poison);
        if (energy > 0) {
          let flag = DamageFlags.Tick;
          if (event.flag & TriggerEnergyFlags.Natural) {
            flag |= DamageFlags.Natural;
          }
          round.dealDamage(
            DamageType.Poison,
            round.getEnemyUnit(event.source),
            event.source,
            energy,
            flag,
          );
        } else {
          return;
        }
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Poison, event.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Initial, event => {
      if (event.type === Energy.Poison) {
        const current = event.source.getEnergy(Energy.Poison, false);
        event.amount = current === 1 ? current : current * CONSUMABLE_STACKS;
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Poison) {
        round.removeEnergy(Energy.Poison, event.source, event.amount, false);
      }
    });

    round.on(RoundEvents.SetEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Poison) {
        log(
          `${event.source.owner.name}'s Poison energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Poison, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, ValuePriority.Exact, event => {
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

    round.on(RoundEvents.RemoveEnergy, ValuePriority.Exact, event => {
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
