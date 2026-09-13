import { BattleEvents } from '../../battle/events';
import { TriggerEnergyFlags } from '../../battle/flags';
import { Energy, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe, token } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

type Variant = Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'>;

const VARIANTS: Variant[] = [
  { id: CardId.Bash, name: 'Bash', energy: Energy.Attack, aspect: [Aspect.Armor, Aspect.Attack] },
  {
    id: CardId.Absorb,
    name: 'Absorb',
    energy: Energy.Healing,
    aspect: [Aspect.Armor, Aspect.Healing],
  },
  { id: CardId.Parry, name: 'Parry', energy: Energy.Slow, aspect: [Aspect.Armor, Aspect.Slow] },
];

/**
 * Has a chance to hand out energy whenever the unit's Armor blocks
 * damage.
 */
const ADD_STACK_ON_BLOCK_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 20,
    chance: 0.25,
    when: describe`When your ${token.energy(Energy.Armor)} blocks damage`,
    receiver: 'the attacker',
    listen({ battle, unit }, trigger): Lifecycle {
      return battle.on(BattleEvents.UnitArmor, ValuePriority.Post, (event) => {
        if (
          event.source === unit &&
          (event.flags & TriggerEnergyFlags.Failed) === 0 &&
          event.value > 0
        ) {
          trigger(event.parent.source);
        }
      });
    },
  }),
);

export default ADD_STACK_ON_BLOCK_CARDS;
