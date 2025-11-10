import { createCard } from '../../card';
import { DamageFlags } from '../../flags';
import type { StartRoundGameEvent } from '../../game';
import { isMissedDamage } from '../../mechanics/damage';
import type { AttackEvent, Round } from '../../round';
import {
  Aspect,
  DamagePriority,
  Energy,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  ValuePriority,
} from '../../types';

const DEFAULT_MULTIPLIER = 0.25;

/**
 * Gain 25% of dealt damage from attacks as Healing energy and trigger a Heal.
 */
export default createCard({
  name: 'Life Steal',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Attack, Aspect.Healing],
  load(context) {
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { parent, round } = event.data as {
          parent: AttackEvent;
          round: Round;
        };
        round.addEnergy(
          Energy.Healing,
          parent.source,
          context.card.getValue(DEFAULT_MULTIPLIER) * parent.amount,
          false,
        );
        round.tickHeal(parent.source, 0);
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
          round.on(RoundEvents.Damage, DamagePriority.Post, event => {
            if (event.source !== source || isMissedDamage(event.flag)) {
              return;
            }
            if (event.flag & DamageFlags.Attack) {
              context.game.triggerCard(context.card, {
                parent: event,
                round,
              });
            }
          });
        });
      },
    );
  },
});
