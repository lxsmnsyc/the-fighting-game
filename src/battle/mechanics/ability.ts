import { EventPriority } from '../../core/event-emitter';
import type { Lifecycle } from '../../core/lifecycle';
import type { AbilityInstance } from '../../game/ability';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { ValuePriority } from '../types';

/**
 * An ability's listeners exist while a unit holds it. Its charge fills
 * while the unit stands, and the ability triggers once it is full.
 */
export default function setupAbilityMechanics(battle: Battle): void {
  const lifecycles = new Map<AbilityInstance, Lifecycle>();

  battle.on(BattleEvents.UnitAddAbility, EventPriority.Pre, (event) => {
    if (event.source.abilities.has(event.ability)) {
      event.disabled = true;
    }
  });

  battle.on(BattleEvents.UnitAddAbility, EventPriority.Exact, (event) => {
    event.source.abilities.set(event.ability, 0);
    const lifecycle = event.ability.source.setup({
      battle,
      unit: event.source,
      ability: event.ability,
    });
    lifecycles.set(event.ability, lifecycle);
    lifecycle.start();
  });

  battle.on(BattleEvents.UnitRemoveAbility, EventPriority.Pre, (event) => {
    if (!event.source.abilities.has(event.ability)) {
      event.disabled = true;
    }
  });

  battle.on(BattleEvents.UnitRemoveAbility, EventPriority.Exact, (event) => {
    event.source.abilities.delete(event.ability);
    lifecycles.get(event.ability)?.stop();
    lifecycles.delete(event.ability);
  });

  battle.on(BattleEvents.CheckUnitAbilityCooldown, ValuePriority.Initial, (event) => {
    event.duration = event.ability.source.cooldown;
  });

  battle.on(BattleEvents.UnitChargeAbility, ValuePriority.Pre, (event) => {
    if (!event.source.alive || !event.source.abilities.has(event.ability)) {
      event.disabled = true;
    }
  });

  // Charge past the cooldown is dropped, so a big charge triggers once
  battle.on(BattleEvents.UnitChargeAbility, ValuePriority.Exact, (event) => {
    const { source, ability } = event;
    const charge = (source.abilities.get(ability) ?? 0) + event.value;
    source.abilities.set(
      ability,
      Math.max(0, Math.min(charge, source.checkAbilityCooldown(ability))),
    );
  });

  battle.on(BattleEvents.UnitTriggerAbility, EventPriority.Pre, (event) => {
    if (!event.source.alive || !event.source.abilities.has(event.ability)) {
      event.disabled = true;
    }
  });

  // Registered before any ability, so the charge starts over before
  // the effect runs
  battle.on(BattleEvents.UnitTriggerAbility, EventPriority.Exact, (event) => {
    event.source.abilities.set(event.ability, 0);
  });

  // Triggers only happen here, never while an effect resolves, so an
  // ability that charges another can never loop
  battle.on(BattleEvents.Tick, EventPriority.Exact, (event) => {
    for (const unit of battle.units()) {
      for (const ability of Array.from(unit.abilities.keys())) {
        if (!unit.alive) {
          break;
        }
        unit.chargeAbility(ability, event.duration);
        if ((unit.abilities.get(ability) ?? 0) >= unit.checkAbilityCooldown(ability)) {
          unit.triggerAbility(ability);
        }
      }
    }
  });
}
