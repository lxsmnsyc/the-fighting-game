import { BattleEvents } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe, token } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

interface Variant extends Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'> {
  /**
   * The energy whose spending sets the card off.
   */
  consumed: Energy;
}

const VARIANTS: Variant[] = [
  {
    id: CardId.Salvage,
    name: 'Salvage',
    consumed: Energy.Armor,
    energy: Energy.Healing,
    aspect: [Aspect.Armor, Aspect.Healing],
  },
  {
    id: CardId.Poised,
    name: 'Poised',
    consumed: Energy.Dodge,
    energy: Energy.Critical,
    aspect: [Aspect.Dodge, Aspect.Critical],
  },
  {
    id: CardId.Ruthless,
    name: 'Ruthless',
    consumed: Energy.Critical,
    energy: Energy.Attack,
    aspect: [Aspect.Critical, Aspect.Attack],
  },
  {
    id: CardId.Drifting,
    name: 'Drifting',
    consumed: Energy.Speed,
    energy: Energy.Dodge,
    aspect: [Aspect.Speed, Aspect.Dodge],
  },
];

/**
 * Has a chance to hand out energy whenever some of the unit's
 * consumable energy of one kind is spent.
 */
const ADD_STACK_ON_CONSUME_CARDS: Card[] = VARIANTS.map(({ consumed, ...variant }) =>
  createTriggerCard({
    ...variant,
    amount: 20,
    chance: 0.25,
    when: describe`When your ${token.energy(consumed)} is spent`,
    receiver: 'a random enemy',
    listen({ battle, unit }, trigger): Lifecycle {
      return battle.on(BattleEvents.UnitConsumeEnergy, ValuePriority.Post, (event) => {
        if (event.source === unit && event.energy === consumed && event.value > 0) {
          trigger();
        }
      });
    },
  }),
);

export default ADD_STACK_ON_CONSUME_CARDS;
