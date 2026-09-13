import { BattleEvents } from '../../battle/events';
import { Stat, ValuePriority } from '../../battle/types';
import type { Lifecycle } from '../../core/lifecycle';
import { createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import CardId from '../ids';

const DEFAULT_THRESHOLD = 0.25;
const DEFAULT_MULTIPLIER = 1.0;

export default createCard({
  id: CardId.Merciless,
  name: 'Merciless',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Critical],
  description(): Description {
    return describe`Critical hits on enemies at or below ${token.percent(DEFAULT_THRESHOLD)} ${token.stat(Stat.Health)} deal an extra ${token.multiplier(DEFAULT_MULTIPLIER)} damage.`;
  },
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
