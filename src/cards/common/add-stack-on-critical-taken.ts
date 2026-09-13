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
  { id: CardId.Steel, name: 'Steel', energy: Energy.Armor, aspect: [Aspect.Health, Aspect.Armor] },
  {
    id: CardId.Flinch,
    name: 'Flinch',
    energy: Energy.Dodge,
    aspect: [Aspect.Health, Aspect.Dodge],
  },
  {
    id: CardId.Soothe,
    name: 'Soothe',
    energy: Energy.Healing,
    aspect: [Aspect.Health, Aspect.Healing],
  },
];

/**
 * Hands out energy whenever an enemy lands a critical hit on the unit.
 */
const ADD_STACK_ON_CRITICAL_TAKEN_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 30,
    when: describe`When you take a critical hit`,
    receiver: 'the attacker',
    listen({ battle, unit }, trigger): Lifecycle {
      return battle.on(BattleEvents.UnitCritical, ValuePriority.Post, (event) => {
        if (event.parent.target === unit && (event.flags & TriggerEnergyFlags.Failed) === 0) {
          trigger(event.source);
        }
      });
    },
  }),
);

export default ADD_STACK_ON_CRITICAL_TAKEN_CARDS;
