import { SELF_STACK } from '../battle/constants';
import type Battle from '../battle/core';
import { BattleEvents, type UnitTriggerCardEvent } from '../battle/events';
import type { Energy } from '../battle/types';
import type Unit from '../battle/unit';
import { type EventListenerLifecycle, EventPriority } from '../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import {
  type Card,
  type CardContext,
  type CardInstance,
  applyPrint,
  createCard,
} from '../game/card';
import { type Amount, type Description, describe, token } from '../game/description';
import { type Aspect, Rarity } from '../game/types';
import type CardId from './ids';

/**
 * What the card groups that hand out one energy are built from.
 */
export interface EnergyCardOptions {
  id: CardId;
  name: string;
  energy: Energy;
  aspect: Aspect;
  amount: number;
  image?: string;
}

/**
 * The most common card effect: the trigger's target gains its value
 * as energy. Cards only ever hand out consumable energy.
 */
export function addEnergyOnTrigger(
  battle: Battle,
  card: CardInstance,
  energy: Energy,
): EventListenerLifecycle<UnitTriggerCardEvent> {
  return battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
    if (event.card === card) {
      event.target.addEnergy(energy, event.value, false);
    }
  });
}

/**
 * "gain 5 Armor", or "give <receiver> 5 Poison" for energy that goes on
 * an enemy.
 */
export function describeGrant(energy: Energy, amount: Amount, receiver: string): Description {
  const granted = token.energy(energy, amount);
  return SELF_STACK[energy] ? describe`gain ${granted}` : describe`give ${receiver} ${granted}`;
}

/**
 * What a trigger family card is built from: what sets it off, and the
 * energy it hands out.
 */
export interface TriggerCardOptions {
  id: CardId;
  name: string;
  energy: Energy;
  aspect: Aspect[];
  amount: number;
  /**
   * Share of the times it is set off that the card triggers, from 0 to
   * 1. Every time by default.
   */
  chance?: number;
  image?: string;
  /**
   * What sets the card off, such as "When you dodge an attack".
   */
  when: Description;
  /**
   * Who gets energy that goes on an enemy, such as "the attacker".
   */
  receiver: string;
  /**
   * Registers what sets the card off. Call `trigger` with the enemy
   * involved, or with nothing to hand enemy energy to a random enemy.
   */
  listen: (context: CardContext, trigger: (enemy?: Unit) => void) => Lifecycle;
}

/**
 * A common card that hands out energy when something happens: to the
 * unit for energies that stack on their owner, and to the enemy
 * involved otherwise.
 */
export function createTriggerCard({
  id,
  name,
  energy,
  aspect,
  amount,
  chance = 1,
  image = '',
  when,
  receiver,
  listen,
}: TriggerCardOptions): Card {
  return createCard({
    id,
    name,
    image,
    rarity: Rarity.Common,
    aspect,
    description(print): Description {
      const grant = describeGrant(energy, applyPrint(amount, print), receiver);
      return chance < 1
        ? describe`${when}, ${token.percent(chance)} chance to ${grant}.`
        : describe`${when}, ${grant}.`;
    },
    setup(context): Lifecycle {
      const { battle, unit, card } = context;
      return new MergedLifecycle([
        listen(context, (enemy) => {
          // TODO PRD
          if (chance < 1 && unit.rng.random() >= chance) {
            return;
          }
          const target = SELF_STACK[energy] ? unit : (enemy ?? unit.checkEnemy());
          if (target?.alive === true) {
            unit.triggerCard(card, target, card.getValue(amount, unit.rng));
          }
        }),
        addEnergyOnTrigger(battle, card, energy),
      ]);
    },
  });
}
