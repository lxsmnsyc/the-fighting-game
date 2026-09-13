import { BattleEvents } from '../../battle/events';
import { Stat } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';

const DEFAULT_MULTIPLIER = 100;

/**
 * Raises a stat when the unit enters the battle.
 */
function createAddStatOnStartCard(name: string, stat: Stat, aspect: Aspect[], image = ''): Card {
  return createCard({
    name,
    rarity: Rarity.Common,
    image,
    aspect,
    setup({ battle, unit, card }): Lifecycle {
      return new MergedLifecycle([
        battle.on(BattleEvents.UnitEntersBattle, EventPriority.Post, (event) => {
          if (event.source === unit) {
            unit.triggerCard(card, unit, card.getValue(DEFAULT_MULTIPLIER));
          }
        }),
        battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
          if (event.card === card) {
            event.target.addStat(stat, event.value);
          }
        }),
      ]);
    },
  });
}

const ADD_STAT_ON_START_CARDS: Card[] = [
  createAddStatOnStartCard('', Stat.MaxHealth, [Aspect.Health]),
];

export default ADD_STAT_ON_START_CARDS;
