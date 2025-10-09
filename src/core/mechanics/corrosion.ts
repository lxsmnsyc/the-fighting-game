import type { Game } from '../game';
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

const CONSUMABLE_STACKS = 0.4;

export function setupCorrosionMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Corrosion mechanics.');

    // Trigger Corrosion consumption when about to take damage.
    round.on(RoundEvents.Damage, DamagePriority.Corrosion, event => {
      if (isMissedDamage(event.flag) || event.flag & DamageFlags.Corrosion) {
        return;
      }
      if (event.type === DamageType.Poison || event.type === DamageType.Pure) {
        return;
      }
      const currentCorrosion = event.target.getTotalEnergy(Energy.Corrosion);
      if (currentCorrosion > 0) {
        round.triggerCorrosion(event, currentCorrosion, 0);
      }
    });

    round.on(RoundEvents.Corrosion, EventPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        event.parent.amount = Math.max(0, event.parent.amount + event.value);
        event.parent.flag |= DamageFlags.Corrosion;
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Corrosion, event.parent.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Corrosion) {
        const current = event.source.getEnergy(Energy.Corrosion, false);
        round.removeEnergy(
          Energy.Corrosion,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Corrosion) {
        log(
          `${event.source.owner.name}'s Corrosion energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Corrosion, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type !== Energy.Corrosion) {
        return;
      }
      if (event.permanent) {
        round.setEnergy(
          Energy.Corrosion,
          event.source,
          event.source.getEnergy(Energy.Corrosion, true) + event.amount,
          true,
        );
        return;
      }

      let amount = event.amount;

      if (event.source.getEnergy(Energy.Armor, false) > 0) {
        /**
         * Counter Armor by removing energy from it
         */
        round.removeEnergy(Energy.Armor, event.source, amount, false);

        amount = -(event.source.getEnergy(Energy.Armor, false) - event.amount);
      }

      if (amount > 0) {
        log(`${event.source.owner.name} gained ${amount} energy of Corrosion`);
        round.setEnergy(
          Energy.Corrosion,
          event.source,
          event.source.getEnergy(Energy.Corrosion, false) + amount,
          false,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Corrosion) {
        log(
          `${event.source.owner.name} lost ${event.amount} energy of Corrosion`,
        );
        round.setEnergy(
          Energy.Corrosion,
          event.source,
          event.source.getEnergy(Energy.Corrosion, event.permanent) -
            event.amount,
          event.permanent,
        );
      }
    });
  });
}
