import { BattleEvents } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import { type Card, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import CardId from '../ids';

interface RepeatTriggerCardOptions {
  id: CardId;
  name: string;
  energy: Energy;
  aspect: Aspect;
  image?: string;
}

/**
 * Whenever another card of the energy's aspect triggers, this card
 * triggers too, and that card's trigger runs once more.
 */
function createRepeatTriggerCard({
  id,
  name,
  energy,
  aspect,
  image = '',
}: RepeatTriggerCardOptions): Card {
  return createCard({
    id,
    name,
    image,
    rarity: Rarity.Secret,
    aspect: [aspect],
    description(): Description {
      return describe`Whenever another of your ${token.energy(energy)} cards triggers, it triggers once more.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      return battle.on(BattleEvents.CheckUnitCardRepeats, ValuePriority.Additive, (event) => {
        const { parent } = event;
        if (
          event.source !== unit ||
          parent.card === card ||
          !parent.card.source.aspect.includes(aspect)
        ) {
          return;
        }
        event.repeats += unit.triggerCard(card, parent.target, 1) > 0 ? 1 : 0;
      });
    },
  });
}

const REPEAT_TRIGGER_CARDS: Card[] = [
  createRepeatTriggerCard({
    id: CardId.Savage,
    name: 'Savage',
    energy: Energy.Attack,
    aspect: Aspect.Attack,
  }),
  createRepeatTriggerCard({
    id: CardId.Resonant,
    name: 'Resonant',
    energy: Energy.Magic,
    aspect: Aspect.Magic,
  }),
  createRepeatTriggerCard({
    id: CardId.Virulent,
    name: 'Virulent',
    energy: Energy.Poison,
    aspect: Aspect.Poison,
  }),
  createRepeatTriggerCard({
    id: CardId.Fortified,
    name: 'Fortified',
    energy: Energy.Armor,
    aspect: Aspect.Armor,
  }),
  createRepeatTriggerCard({
    id: CardId.Corrosive,
    name: 'Corrosive',
    energy: Energy.Corrosion,
    aspect: Aspect.Corrosion,
  }),
  createRepeatTriggerCard({
    id: CardId.Rapid,
    name: 'Rapid',
    energy: Energy.Speed,
    aspect: Aspect.Speed,
  }),
  createRepeatTriggerCard({
    id: CardId.Glacial,
    name: 'Glacial',
    energy: Energy.Slow,
    aspect: Aspect.Slow,
  }),
  createRepeatTriggerCard({
    id: CardId.Evasive,
    name: 'Evasive',
    energy: Energy.Dodge,
    aspect: Aspect.Dodge,
  }),
  createRepeatTriggerCard({
    id: CardId.Lethal,
    name: 'Lethal',
    energy: Energy.Critical,
    aspect: Aspect.Critical,
  }),
  createRepeatTriggerCard({
    id: CardId.Blessed,
    name: 'Blessed',
    energy: Energy.Healing,
    aspect: Aspect.Healing,
  }),
];

export default REPEAT_TRIGGER_CARDS;
