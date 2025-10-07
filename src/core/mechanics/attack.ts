import type { Game } from '../game';
import { log } from '../log';
import {
  DamageType,
  Energy,
  EnergyPriority,
  EventPriority,
  GameEvents,
  RoundEvents,
  TriggerEnergyFlags,
  TriggerFlags,
} from '../types';
import { createCooldown } from './tick';

const MIN_PERIOD = 0.25;
const MAX_PERIOD = 5.0;

const CONSUMABLE_STACKS = 0.4;

export function setupAttackMechanics(game: Game): void {
  game.on(GameEvents.StartRound, EventPriority.Pre, ({ round }) => {
    log('Setting up Attack mechanics.');

    round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
      createCooldown(round, source, MIN_PERIOD, MAX_PERIOD, () => {
        round.naturalAttack(source, 0);
        return true;
      });
    });

    round.on(RoundEvents.TickAttack, EventPriority.Exact, event => {
      if (!(event.flag & TriggerEnergyFlags.Failed)) {
        const energy = event.source.getTotalEnergy(Energy.Attack);
        if (energy > 0) {
          round.attack(event.source, energy, event.flag);
        }
      }
      if (!(event.flag & TriggerEnergyFlags.NoConsume)) {
        round.consumeEnergy(Energy.Attack, event.source);
      }
    });

    round.on(RoundEvents.Attack, EventPriority.Exact, event => {
      if (!(event.flag & TriggerFlags.Disabled)) {
        round.dealDamage(
          DamageType.Attack,
          event.source,
          round.getEnemyUnit(event.source),
          event.amount,
          0,
        );
      }
    });

    round.on(RoundEvents.ConsumeEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Attack) {
        const consumable = event.source.getEnergy(Energy.Attack, false);
        round.removeEnergy(
          Energy.Attack,
          event.source,
          consumable === 1 ? consumable : consumable * CONSUMABLE_STACKS,
          false,
        );
      }
    });

    round.on(RoundEvents.SetEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Attack) {
        log(
          `${event.source.owner.name}'s Attack energy changed to ${event.amount}`,
        );
        event.source.setEnergy(Energy.Attack, event.amount, event.permanent);
      }
    });

    round.on(RoundEvents.AddEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Attack) {
        log(
          `${event.source.owner.name} gained ${event.amount} energy of Attack`,
        );
        round.setEnergy(
          Energy.Attack,
          event.source,
          event.source.getEnergy(Energy.Attack, event.permanent) + event.amount,
          event.permanent,
        );
      }
    });

    round.on(RoundEvents.RemoveEnergy, EnergyPriority.Exact, event => {
      if (event.type === Energy.Attack) {
        log(`${event.source.owner.name} lost ${event.amount} energy of Attack`);
        round.setEnergy(
          Energy.Attack,
          event.source,
          event.source.getEnergy(Energy.Attack, event.permanent) - event.amount,
          event.permanent,
        );
      }
    });
  });
}
