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

const CONSUMABLE_STACKS = 0.4;

export function setupArmorMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Armor mechanics.');

    // Trigger Armor consumption when about to take damage.
    round.on(RoundEvents.Damage, DamagePriority.Armor, event => {
      if (event.flag & (DamageFlags.Missed | DamageFlags.Armor)) {
        return;
      }
      if (event.type === DamageType.Poison || event.type === DamageType.Pure) {
        return;
      }
      const currentArmor = event.target.getTotalEnergy(Energy.Armor);
      if (currentArmor > 0) {
        round.triggerArmor(event, currentArmor, 0);
      }
    });

    round.on(RoundEvents.Armor, EventPriority.Exact, event => {
      if (event.flag & TriggerEnergyFlags.Disabled) {
        return;
      }
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        event.parent.amount = Math.max(0, event.parent.amount - event.value);
        event.parent.flag |= DamageFlags.Armor;
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Armor, event.parent.source);
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Armor) {
        const current = event.source.getEnergy(Energy.Armor, false);
        round.removeEnergy(
          Energy.Armor,
          event.source,
          current === 1 ? current : current * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Armor) {
        log(
          `${event.source.owner.name}'s Armor energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Armor, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type !== Energy.Armor) {
        return;
      }
      if (event.permanent) {
        round.setEnergy(
          Energy.Armor,
          event.source,
          event.source.getEnergy(Energy.Armor, true) + event.amount,
          true,
        );
        return;
      }

      let amount = event.amount;
      if (event.source.getEnergy(Energy.Corrosion, false) > 0) {
        /**
         * Counter Corrosion by removing energy from it
         */
        round.removeEnergy(Energy.Corrosion, event.source, amount, false);

        amount = -(event.source.getEnergy(Energy.Corrosion, false) - amount);
      }

      if (amount > 0) {
        log(`${event.source.owner.name} gained ${amount} energy of Armor`);
        round.setEnergy(
          Energy.Armor,
          event.source,
          event.source.getEnergy(Energy.Armor, false) + amount,
          false,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Armor) {
        log(`${event.source.owner.name} lost ${event.amount} energy of Armor`);
        round.setEnergy(
          Energy.Armor,
          event.source,
          event.source.getEnergy(Energy.Armor, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
