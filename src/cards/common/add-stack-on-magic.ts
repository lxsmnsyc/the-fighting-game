import { BattleEvents } from '../../battle/events';
import { isMissedDamage } from '../../battle/mechanics/damage';
import { DamagePriority, DamageType, Energy } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe, token } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

type Variant = Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'>;

const VARIANTS: Variant[] = [
  {
    id: CardId.Focused,
    name: 'Focused',
    energy: Energy.Critical,
    aspect: [Aspect.Magic, Aspect.Critical],
  },
  {
    id: CardId.Dissolve,
    name: 'Dissolve',
    energy: Energy.Corrosion,
    aspect: [Aspect.Magic, Aspect.Corrosion],
  },
  { id: CardId.Hex, name: 'Hex', energy: Energy.Poison, aspect: [Aspect.Magic, Aspect.Poison] },
];

/**
 * Hands out energy whenever the unit deals Magical damage.
 */
const ADD_STACK_ON_MAGIC_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 20,
    when: describe`When you deal ${token.damage(DamageType.Magical)}`,
    receiver: 'the target',
    listen({ battle, unit }, trigger): Lifecycle {
      return battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
        if (
          event.source === unit &&
          event.type === DamageType.Magical &&
          !isMissedDamage(event.flags) &&
          event.value > 0
        ) {
          trigger(event.target);
        }
      });
    },
  }),
);

export default ADD_STACK_ON_MAGIC_CARDS;
