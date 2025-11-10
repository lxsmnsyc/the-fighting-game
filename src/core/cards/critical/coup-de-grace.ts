import { createCard } from '../../card';
import type { StartRoundGameEvent } from '../../game';
import type { CriticalEvent } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  Stat,
  ValuePriority,
} from '../../types';

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
  load(context) {
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { parent } = event.data as { parent: CriticalEvent };
        parent.multiplier += context.card.getValue(DEFAULT_MULTIPLIER);
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
          round.on(RoundEvents.Critical, ValuePriority.Additive, event => {
            if (context.card.disabled || event.parent.source !== source) {
              return;
            }
            // Compute health
            const currentHealth = event.parent.target.stats[Stat.Health];
            const maxHealth = event.parent.target.stats[Stat.MaxHealth];
            if (currentHealth / maxHealth <= DEFAULT_THRESHOLD) {
              context.game.triggerCard(context.card, {
                parent: event,
              });
            }
          });
        });
      },
    );
  },
});
