import { createCard } from '../../card';
import { DamageFlags } from '../../flags';
import type { StartRoundGameEvent } from '../../game';
import { isMissedDamage } from '../../mechanics/damage';
import { createTimer } from '../../mechanics/tick';
import type { DamageEvent } from '../../round';
import {
  Aspect,
  DamagePriority,
  DamageType,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  ValuePriority,
} from '../../types';

const DEFAULT_REDUCTION = 0.25;
const DEFAULT_PERIOD = 1.0;
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
  load(context) {
    let collected = 0;
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { parent } = event.data as {
          parent: DamageEvent;
        };

        const reduced = parent.amount * context.card.getValue(DEFAULT_REDUCTION);
        parent.amount -= reduced;
        collected += reduced;
      }
    });
    // Trigger condition
    context.game.on(
      GameEvents.StartRound,
      EventPriority.Post,
      ({ round }: StartRoundGameEvent) => {
        round.on(RoundEvents.SetupUnit, ValuePriority.Exact, ({ source }) => {
          if (source.owner !== context.card.owner) {
            return;
          }

          collected = 0;

          createTimer(round, DEFAULT_PERIOD, () => {
            if (collected > 0) {
              const tick = collected * DEFAULT_DAMAGE;
              round.dealDamage(DamageType.HealthLoss, source, source, tick, DamageFlags.Pierce);
              collected -= tick;
            }
            return collected > 0;
          });

          round.on(RoundEvents.Damage, DamagePriority.Pre, event => {
            if (
              event.source !== source ||
              event.type === DamageType.HealthLoss ||
              isMissedDamage(event.flag)
            ) {
              return;
            }
          });
        });
      },
    );
  },
});
