import { BattleEvents } from '../../battle/events';
import { DamageFlags } from '../../battle/flags';
import { isMissedDamage } from '../../battle/mechanics/damage';
import { DamagePriority, Energy } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

type Variant = Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'>;

const VARIANTS: Variant[] = [
  {
    id: CardId.Toughen,
    name: 'Toughen',
    energy: Energy.Armor,
    aspect: [Aspect.Health, Aspect.Armor],
  },
  {
    id: CardId.Recover,
    name: 'Recover',
    energy: Energy.Healing,
    aspect: [Aspect.Health, Aspect.Healing],
  },
  {
    id: CardId.Acidic,
    name: 'Acidic',
    energy: Energy.Corrosion,
    aspect: [Aspect.Health, Aspect.Corrosion],
  },
  {
    id: CardId.Thorny,
    name: 'Thorny',
    energy: Energy.Poison,
    aspect: [Aspect.Health, Aspect.Poison],
  },
];

/**
 * Has a chance to hand out energy whenever an attack damages the unit.
 */
const ADD_STACK_ON_HIT_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 20,
    chance: 0.25,
    when: describe`When an attack damages you`,
    receiver: 'the attacker',
    listen({ battle, unit }, trigger): Lifecycle {
      return battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
        if (
          event.target === unit &&
          event.source !== unit &&
          (event.flags & DamageFlags.Attack) !== 0 &&
          !isMissedDamage(event.flags) &&
          event.value > 0
        ) {
          trigger(event.source);
        }
      });
    },
  }),
);

export default ADD_STACK_ON_HIT_CARDS;
