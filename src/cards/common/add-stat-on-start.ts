import { BattleEvents } from '../../battle/events';
import { Stat } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, applyPrint, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import CardId from '../ids';

// High, since it only triggers once per battle
const DEFAULT_AMOUNT = 200;

interface AddStatOnStartCardOptions {
  id: CardId;
  name: string;
  stat: Stat;
  aspect: Aspect[];
  image?: string;
}

/**
 * Raises a stat when the unit enters the battle.
 */
function createAddStatOnStartCard({
  id,
  name,
  stat,
  aspect,
  image = '',
}: AddStatOnStartCardOptions): Card {
  return createCard({
    id,
    name,
    rarity: Rarity.Uncommon,
    image,
    aspect,
    description(print): Description {
      return describe`At the start of battle, gain ${token.stat(stat, applyPrint(DEFAULT_AMOUNT, print))}.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      return new MergedLifecycle([
        battle.on(BattleEvents.UnitEntersBattle, EventPriority.Post, (event) => {
          if (event.source === unit) {
            unit.triggerCard(card, unit, card.getValue(DEFAULT_AMOUNT, unit.rng));
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
  createAddStatOnStartCard({
    id: CardId.Hearty,
    name: 'Hearty',
    stat: Stat.MaxHealth,
    aspect: [Aspect.Health],
  }),
];

export default ADD_STAT_ON_START_CARDS;
