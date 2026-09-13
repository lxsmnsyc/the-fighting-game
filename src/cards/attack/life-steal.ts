import { BattleEvents } from '../../battle/events';
import { DamageFlags } from '../../battle/flags';
import { isMissedDamage } from '../../battle/mechanics/damage';
import { DamagePriority, Energy } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';

const DEFAULT_MULTIPLIER = 0.25;

/**
 * Gain 25% of dealt damage from attacks as Healing energy and trigger a Heal.
 */
export default createCard({
  name: 'Life Steal',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Attack, Aspect.Healing],
  setup({ battle, unit, card }): Lifecycle {
    return new MergedLifecycle([
      battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
        if (
          event.source === unit &&
          (event.flags & DamageFlags.Attack) !== 0 &&
          !isMissedDamage(event.flags)
        ) {
          unit.triggerCard(card, unit, event.value * card.getValue(DEFAULT_MULTIPLIER));
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
