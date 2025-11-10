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

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Initial, event => {
      if (event.type === Energy.Magic) {
        const current = event.source.getEnergy(Energy.Magic, false);
        event.amount = current === 1 ? current : current * CONSUMABLE_STACKS;
      }
    });

    round.on(RoundEvents.ConsumeEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Magic) {
        round.removeEnergy(Energy.Magic, event.source, event.amount, false);
      }
    });

    round.on(RoundEvents.SetEnergy, ValuePriority.Exact, event => {
      if (event.type === Energy.Magic) {
        log(
          `${event.source.owner.name}'s Magic energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Magic, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, ValuePriority.Exact, event => {
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

    round.on(RoundEvents.RemoveEnergy, ValuePriority.Exact, event => {
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
