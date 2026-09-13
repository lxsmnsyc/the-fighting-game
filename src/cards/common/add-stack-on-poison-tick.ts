import { BattleEvents } from '../../battle/events';
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
    id: CardId.Siphon,
    name: 'Siphon',
    energy: Energy.Magic,
    aspect: [Aspect.Poison, Aspect.Magic],
  },
  {
    id: CardId.Leech,
    name: 'Leech',
    energy: Energy.Healing,
    aspect: [Aspect.Poison, Aspect.Healing],
  },
  { id: CardId.Weaken, name: 'Weaken', energy: Energy.Slow, aspect: [Aspect.Poison, Aspect.Slow] },
];

/**
 * Hands out energy whenever an enemy takes Poison damage. Poison hurts
 * the unit that carries it, so this fires on every tick of Poison on an
 * enemy, whoever gave it.
 */
const ADD_STACK_ON_POISON_TICK_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 10,
    when: describe`When an enemy takes ${token.damage(DamageType.Poison)}`,
    receiver: 'that enemy',
    listen({ battle, unit }, trigger): Lifecycle {
      return battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
        if (
          event.type === DamageType.Poison &&
          event.target.team.alliance !== unit.team.alliance &&
          event.value > 0
        ) {
          trigger(event.target);
        }
      });
    },
  }),
);

export default ADD_STACK_ON_POISON_TICK_CARDS;
