import { BattleEvents } from '../../battle/events';
import { Stat, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import { createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';

const DEFAULT_THRESHOLD = 0.25;
const DEFAULT_MULTIPLIER = 1.0;

/**
 * Critical multiplier increases when enemy HP drops to 25%
 */
export default createCard({
  name: 'Coup de Grace',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Critical],
  setup({ battle, unit, card }): Lifecycle {
    return battle.on(BattleEvents.UnitCritical, ValuePriority.Additive, (event) => {
      const { target } = event.parent;
      if (
        event.source !== unit ||
        target.stats[Stat.Health] / target.stats[Stat.MaxHealth] > DEFAULT_THRESHOLD
      ) {
        return;
      }
      const bonus = card.getValue(DEFAULT_MULTIPLIER);
      if (unit.triggerCard(card, target, bonus)) {
        event.multiplier += bonus;
      }
    });
  },
});
