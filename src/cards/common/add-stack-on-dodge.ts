import { BattleEvents } from '../../battle/events';
import { TriggerEnergyFlags } from '../../battle/flags';
import { Energy, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

type Variant = Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'>;

const VARIANTS: Variant[] = [
  {
    id: CardId.Darting,
    name: 'Darting',
    energy: Energy.Speed,
    aspect: [Aspect.Dodge, Aspect.Speed],
  },
  {
    id: CardId.Opportune,
    name: 'Opportune',
    energy: Energy.Critical,
    aspect: [Aspect.Dodge, Aspect.Critical],
  },
  {
    id: CardId.Counter,
    name: 'Counter',
    energy: Energy.Attack,
    aspect: [Aspect.Dodge, Aspect.Attack],
  },
  {
    id: CardId.Entangle,
    name: 'Entangle',
    energy: Energy.Slow,
    aspect: [Aspect.Dodge, Aspect.Slow],
  },
];

/**
 * Hands out energy whenever the unit dodges an attack.
 */
const ADD_STACK_ON_DODGE_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 20,
    when: describe`When you dodge an attack`,
    receiver: 'the attacker',
    listen({ battle, unit }, trigger): Lifecycle {
      return battle.on(BattleEvents.UnitDodge, ValuePriority.Post, (event) => {
        if (event.source === unit && (event.flags & TriggerEnergyFlags.Failed) === 0) {
          trigger(event.parent.source);
        }
      });
    },
  }),
);

export default ADD_STACK_ON_DODGE_CARDS;
