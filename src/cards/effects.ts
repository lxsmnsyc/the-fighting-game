import type Battle from '../battle/core';
import { BattleEvents, type UnitTriggerCardEvent } from '../battle/events';
import type { Energy } from '../battle/types';
import { type EventListenerLifecycle, EventPriority } from '../core/event-emitter';
import type { CardInstance } from '../game/card';

/**
 * The most common card effect: the trigger's target gains its value
 * as energy.
 */
export default function addEnergyOnTrigger(
  battle: Battle,
  card: CardInstance,
  energy: Energy,
  permanent: boolean,
): EventListenerLifecycle<UnitTriggerCardEvent> {
  return battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
    if (event.card === card) {
      event.target.addEnergy(energy, event.value, permanent);
    }
  });
}
