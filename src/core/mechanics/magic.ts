import { DamageFlags, TriggerEnergyFlags } from '../flags';
import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  Energy,
  EnergyPriority,
  EventPriority,
  GameEvents,
  RoundEvents,
} from '../types';

const CONSUMABLE_STACKS = 0.4;

export function setupMagicMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Magic mechanics.');

    round.on(RoundEvents.TickMagic, EventPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        const energy = event.source.getTotalEnergy(Energy.Magic);
        if (energy > 0) {
          round.dealDamage(
            DamageType.Magical,
            event.source,
            round.getEnemyUnit(event.source),
            energy,
            DamageFlags.Tick,
          );
        } else {
          return;
        }
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Magic, event.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Magic) {
        const consumable = event.source.getEnergy(Energy.Magic, false);
        round.removeEnergy(
          Energy.Magic,
          event.source,
          consumable === 1 ? consumable : consumable * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Magic) {
        log(
          `${event.source.owner.name}'s Magic energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Magic, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Magic) {
        log(
          `${event.source.owner.name} gained ${event.amount} energy of Magic`,
        );
        round.setEnergy(
          Energy.Magic,
          event.source,
          event.source.getEnergy(Energy.Magic, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Magic) {
        log(`${event.source.owner.name} lost ${event.amount} energy of Magic`);
        round.setEnergy(
          Energy.Magic,
          event.source,
          event.source.getEnergy(Energy.Magic, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
