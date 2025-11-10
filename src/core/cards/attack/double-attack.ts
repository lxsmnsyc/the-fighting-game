import { createCard } from '../../card';
import { AttackFlags } from '../../flags';
import type { StartRoundGameEvent } from '../../game';
import type { AttackEvent, Round } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  ValuePriority,
} from '../../types';

const DEFAULT_CHANCE = 0.25;
const DEFAULT_MULTIPLIER = 1.0;

/**
 * Natural attacks has 25% chance to do another Natural Attack with 100% of the amount.
 *
 * Does not consume energy. Does not trigger itself.
 */
export default createCard({
  name: 'Double Attack',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Attack],
  load(context) {
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { parent, round } = event.data as {
          parent: AttackEvent;
          round: Round;
        };
        const amount =
          parent.amount * context.card.getValue(DEFAULT_MULTIPLIER);
        round.attack(parent.source, amount, AttackFlags.Natural);
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
          round.on(RoundEvents.Attack, ValuePriority.Post, event => {
            if (context.card.disabled || event.source !== source) {
              return;
            }
            if (event.flag & (AttackFlags.Natural | AttackFlags.Tick)) {
              // TODO use PRD
              const chance = event.source.rng.random();
              if (chance <= DEFAULT_CHANCE) {
                context.game.triggerCard(context.card, {
                  parent: event,
                  round,
                });
              }
            }
          });
        });
      },
    );
  },
});
