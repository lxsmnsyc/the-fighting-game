import { BattleEvents } from '../../battle/events';
import { Energy } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import type { Lifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

type Variant = Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'>;

const VARIANTS: Variant[] = [
  { id: CardId.Inspired, name: 'Inspired', energy: Energy.Attack, aspect: [Aspect.Attack] },
  { id: CardId.Attuned, name: 'Attuned', energy: Energy.Magic, aspect: [Aspect.Magic] },
  { id: CardId.Shielded, name: 'Shielded', energy: Energy.Armor, aspect: [Aspect.Armor] },
  { id: CardId.Spurred, name: 'Spurred', energy: Energy.Speed, aspect: [Aspect.Speed] },
  { id: CardId.Honed, name: 'Honed', energy: Energy.Critical, aspect: [Aspect.Critical] },
];

/**
 * Hands out energy whenever one of the unit's abilities triggers.
 */
const ADD_STACK_ON_ABILITY_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 30,
    when: describe`When one of your abilities triggers`,
    receiver: 'a random enemy',
    listen({ battle, unit }, trigger): Lifecycle {
      return battle.on(BattleEvents.UnitTriggerAbility, EventPriority.Post, (event) => {
        if (event.source === unit) {
          trigger();
        }
      });
    },
  }),
);

export default ADD_STACK_ON_ABILITY_CARDS;
