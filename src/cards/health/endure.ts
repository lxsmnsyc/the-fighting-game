import { BattleEvents } from '../../battle/events';
import { DamageFlags } from '../../battle/flags';
import { isMissedDamage } from '../../battle/mechanics/damage';
import { DamagePriority, DamageType } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import type { Lifecycle } from '../../core/lifecycle';
import { createCard } from '../../game/card';
import { Aspect, Rarity } from '../../game/types';

const DEFAULT_REDUCTION = 0.25;
const DEFAULT_PERIOD = 1000;
const DEFAULT_DAMAGE = 0.25;

/**
 * Reduces received damage by 25% and delays the rest
 * by 25% of the total delayed damage per second as health
 * loss.
 */
export default createCard({
  name: 'Endure',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Health],
  setup({ battle, unit, card }): Lifecycle {
    let collected = 0;
    let elapsed = 0;

    // Only runs while there is delayed damage left
    const timer = battle.on(BattleEvents.Tick, EventPriority.Exact, (event) => {
      elapsed += event.duration;
      if (elapsed < DEFAULT_PERIOD) {
        return;
      }
      elapsed -= DEFAULT_PERIOD;
      // At least 1, so the last few points still run out
      const tick = Math.min(collected, Math.max(1, (collected * DEFAULT_DAMAGE) | 0));
      collected -= tick;
      if (collected <= 0) {
        elapsed = 0;
        timer.stop();
      }
      unit.dealDamage(unit, DamageType.HealthLoss, tick, DamageFlags.Pierce);
    });
    timer.stop();

    const listener = battle.on(BattleEvents.UnitDamage, DamagePriority.Pre, (event) => {
      if (
        event.target !== unit ||
        event.type === DamageType.HealthLoss ||
        isMissedDamage(event.flags)
      ) {
        return;
      }
      const reduced = (event.value * card.getValue(DEFAULT_REDUCTION)) | 0;
      if (reduced > 0 && unit.triggerCard(card, unit, reduced)) {
        event.value -= reduced;
        collected += reduced;
        timer.start();
      }
    });

    return {
      start(): void {
        listener.start();
        if (collected > 0) {
          timer.start();
        }
      },
      stop(): void {
        listener.stop();
        timer.stop();
      },
    };
  },
});
