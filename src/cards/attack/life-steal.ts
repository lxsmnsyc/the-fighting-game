import { BattleEvents } from '../../battle/events';
import { DamageFlags } from '../../battle/flags';
import { isMissedDamage } from '../../battle/mechanics/damage';
import { DamagePriority, DamageType, Energy } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import CardId from '../ids';

const DEFAULT_MULTIPLIER = 0.25;

export default createCard({
  id: CardId.Vampiric,
  name: 'Vampiric',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Attack, Aspect.Healing],
  description(): Description {
    return describe`Gain ${token.percent(DEFAULT_MULTIPLIER)} of the ${token.damage(DamageType.Physical)} your attacks deal as ${token.energy(Energy.Healing)}, then heal.`;
  },
  setup({ battle, unit, card }): Lifecycle {
    return new MergedLifecycle([
      battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
        if (
          event.source === unit &&
          (event.flags & DamageFlags.Attack) !== 0 &&
          !isMissedDamage(event.flags)
        ) {
          unit.triggerCard(card, unit, event.value * card.getValue(DEFAULT_MULTIPLIER, unit.rng));
        }
      }),
      battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
        if (event.card === card) {
          event.target.addEnergy(Energy.Healing, event.value, false);
          event.target.triggerEnergy(Energy.Healing, 0);
        }
      }),
    ]);
  },
});
