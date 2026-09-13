import { BattleEvents } from '../../battle/events';
import { Energy, Stat, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe, token } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

// Share of max Health the unit has to drop below
const THRESHOLD = 0.5;

type Variant = Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'>;

const VARIANTS: Variant[] = [
  {
    id: CardId.Cornered,
    name: 'Cornered',
    energy: Energy.Armor,
    aspect: [Aspect.Health, Aspect.Armor],
  },
  {
    id: CardId.Resolute,
    name: 'Resolute',
    energy: Energy.Healing,
    aspect: [Aspect.Health, Aspect.Healing],
  },
  {
    id: CardId.Skittish,
    name: 'Skittish',
    energy: Energy.Dodge,
    aspect: [Aspect.Health, Aspect.Dodge],
  },
];

/**
 * Hands out a large amount of energy once per battle, the first time the
 * unit's Health drops below half.
 */
const ADD_STACK_ON_LOW_HEALTH_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 100,
    when: describe`The first time your ${token.stat(Stat.Health)} drops below ${token.percent(THRESHOLD)}`,
    receiver: 'a random enemy',
    listen({ battle, unit }, trigger): Lifecycle {
      // Set up for each battle, so it fires once per battle
      let fired = false;

      return battle.on(BattleEvents.UnitSetStat, ValuePriority.Post, (event) => {
        if (fired || event.source !== unit || event.stat !== Stat.Health || !unit.alive) {
          return;
        }
        if (unit.stats[Stat.Health] < unit.stats[Stat.MaxHealth] * THRESHOLD) {
          fired = true;
          trigger();
        }
      });
    },
  }),
);

export default ADD_STACK_ON_LOW_HEALTH_CARDS;
