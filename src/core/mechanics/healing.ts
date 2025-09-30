import type { Game } from '../game';
import { log } from '../log';
import {
  Energy,
  EnergyPriority,
  EventPriority,
  GameEvents,
  RoundEvents,
  Stat,
  TriggerEnergyFlags,
  TriggerFlags,
} from '../types';
import { createTimer } from './tick';

const DEFAULT_PERIOD = 1.0 * 1000;
const CONSUMABLE_STACKS = 0.4;

export function setupHealingMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Healing mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      createTimer(round, DEFAULT_PERIOD, () => {
        round.naturalHeal(source, 0);
        return true;
      });
    });

    round.on(RoundEvents.TickHeal, EventPriority.Exact, event => {
      if (event.flag & TriggerEnergyFlags.Disabled) {
        return;
      }
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        const energy = event.source.getTotalEnergy(Energy.Healing);
        if (energy > 0) {
          round.heal(event.source, energy, event.flag);
        }
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Healing, event.source);
      }
    });

    round.on(RoundEvents.Heal, EventPriority.Exact, event => {
      if (!(event.flag & TriggerFlags.Disabled)) {
        log(`${event.source.owner.name} healed ${event.amount} of Health`);
        round.addStat(Stat.Health, event.source, event.amount);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Healing) {
        const current = event.source.getEnergy(Energy.Healing, false);
        round.removeEnergy(
          Energy.Healing,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Healing) {
        const clamped = Math.max(0, event.amount);
        log(
          `${event.source.owner.name}'s Healing energy changed to ${clamped}`,
        );
        event.source.setEnergy(Energy.Healing, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Healing) {
        log(
          `${event.source.owner.name} gained ${event.amount} energy of Healing`,
        );
        round.setEnergy(
          Energy.Healing,
          event.source,
          event.source.getEnergy(Energy.Healing, event.permanent) +
            event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Healing) {
        log(
          `${event.source.owner.name} lost ${event.amount} energy of Healing`,
        );
        round.setEnergy(
          Energy.Healing,
          event.source,
          event.source.getEnergy(Energy.Healing, event.permanent) -
            event.amount,
          event.permanent,
        );
      }
    });
  });
}
