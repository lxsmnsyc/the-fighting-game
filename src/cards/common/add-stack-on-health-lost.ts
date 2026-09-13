import { BattleEvents } from '../../battle/events';
import { Energy, Stat, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import type { Card } from '../../game/card';
import { describe, token } from '../../game/description';
import { Aspect } from '../../game/types';
import { type TriggerCardOptions, createTriggerCard } from '../effects';
import CardId from '../ids';

// Health to lose for each trigger
const HEALTH_STEP = 100;

type Variant = Pick<TriggerCardOptions, 'id' | 'name' | 'energy' | 'aspect'>;

const VARIANTS: Variant[] = [
  {
    id: CardId.Scarred,
    name: 'Scarred',
    energy: Energy.Armor,
    aspect: [Aspect.Health, Aspect.Armor],
  },
  {
    id: CardId.Vengeful,
    name: 'Vengeful',
    energy: Energy.Attack,
    aspect: [Aspect.Health, Aspect.Attack],
  },
  {
    id: CardId.Bitter,
    name: 'Bitter',
    energy: Energy.Corrosion,
    aspect: [Aspect.Health, Aspect.Corrosion],
  },
  {
    id: CardId.Desperate,
    name: 'Desperate',
    energy: Energy.Critical,
    aspect: [Aspect.Health, Aspect.Critical],
  },
  { id: CardId.Wary, name: 'Wary', energy: Energy.Dodge, aspect: [Aspect.Health, Aspect.Dodge] },
  {
    id: CardId.Anguished,
    name: 'Anguished',
    energy: Energy.Magic,
    aspect: [Aspect.Health, Aspect.Magic],
  },
  {
    id: CardId.Spiteful,
    name: 'Spiteful',
    energy: Energy.Poison,
    aspect: [Aspect.Health, Aspect.Poison],
  },
  {
    id: CardId.Crippling,
    name: 'Crippling',
    energy: Energy.Slow,
    aspect: [Aspect.Health, Aspect.Slow],
  },
  {
    id: CardId.Frantic,
    name: 'Frantic',
    energy: Energy.Speed,
    aspect: [Aspect.Health, Aspect.Speed],
  },
];

/**
 * Hands out energy for every 100 Health the unit loses, from any source.
 * Healing does not give back progress, so Health lost again after a heal
 * counts again.
 */
const ADD_STACK_ON_HEALTH_LOST_CARDS: Card[] = VARIANTS.map((variant) =>
  createTriggerCard({
    ...variant,
    amount: 30,
    when: describe`For every ${token.stat(Stat.Health, HEALTH_STEP)} you lose`,
    receiver: 'a random enemy',
    listen({ battle, unit }, trigger): Lifecycle {
      // Set up for each battle, so progress starts over every battle
      let health = unit.stats[Stat.Health];
      let lost = 0;

      // Compares Health before and after, so overkill damage and Health
      // that was never there do not count
      return battle.on(BattleEvents.UnitSetStat, ValuePriority.Post, (event) => {
        if (event.source !== unit || event.stat !== Stat.Health) {
          return;
        }
        const previous = health;
        health = unit.stats[Stat.Health];
        if (health >= previous || !unit.alive) {
          return;
        }
        lost += previous - health;
        while (lost >= HEALTH_STEP) {
          lost -= HEALTH_STEP;
          trigger();
        }
      });
    },
  }),
);

export default ADD_STACK_ON_HEALTH_LOST_CARDS;
