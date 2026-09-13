import { EventPriority } from '../../core/event-emitter';
import type { Lifecycle } from '../../core/lifecycle';
import type { CardInstance } from '../../game/card';
import type Battle from '../core';
import { BattleEvents } from '../events';

/**
 * A card's listeners exist while a unit holds it, and only run while
 * the card is enabled.
 */
export default function setupCardMechanics(battle: Battle): void {
  const lifecycles = new Map<CardInstance, Lifecycle>();

  battle.on(BattleEvents.UnitAddCard, EventPriority.Pre, (event) => {
    if (event.source.cards.has(event.card)) {
      event.disabled = true;
    }
  });

  battle.on(BattleEvents.UnitAddCard, EventPriority.Exact, (event) => {
    event.source.cards.set(event.card, true);
    const lifecycle = event.card.source.setup({
      battle,
      unit: event.source,
      card: event.card,
    });
    lifecycles.set(event.card, lifecycle);
    lifecycle.start();
  });

  // The rest only apply to cards the unit holds
  battle.on(BattleEvents.UnitRemoveCard, EventPriority.Pre, (event) => {
    if (!event.source.cards.has(event.card)) {
      event.disabled = true;
    }
  });
  battle.on(BattleEvents.UnitEnableCard, EventPriority.Pre, (event) => {
    if (!event.source.cards.has(event.card)) {
      event.disabled = true;
    }
  });
  battle.on(BattleEvents.UnitDisableCard, EventPriority.Pre, (event) => {
    if (!event.source.cards.has(event.card)) {
      event.disabled = true;
    }
  });

  battle.on(BattleEvents.UnitRemoveCard, EventPriority.Exact, (event) => {
    event.source.cards.delete(event.card);
    lifecycles.get(event.card)?.stop();
    lifecycles.delete(event.card);
  });

  battle.on(BattleEvents.UnitEnableCard, EventPriority.Exact, (event) => {
    event.source.cards.set(event.card, true);
    lifecycles.get(event.card)?.start();
  });

  battle.on(BattleEvents.UnitDisableCard, EventPriority.Exact, (event) => {
    event.source.cards.set(event.card, false);
    lifecycles.get(event.card)?.stop();
  });

  battle.on(BattleEvents.UnitTriggerCard, EventPriority.Pre, (event) => {
    if (event.source.cards.get(event.card) !== true) {
      event.disabled = true;
    }
  });
}
