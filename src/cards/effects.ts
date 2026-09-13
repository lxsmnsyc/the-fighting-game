import { SELF_STACK } from '../battle/constants';
import type Battle from '../battle/core';
import { BattleEvents, type UnitTriggerCardEvent } from '../battle/events';
import type { Energy } from '../battle/types';
import { type EventListenerLifecycle, EventPriority } from '../core/event-emitter';
import type { CardInstance } from '../game/card';
import { type Amount, type Description, describe, token } from '../game/description';
import type { Aspect } from '../game/types';
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
