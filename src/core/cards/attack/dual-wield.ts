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

const DEFAULT_MULTIPLIER = 0.5;

/**
 * Causes natural Attack to deal 50% damage
 * but repeats the Attack with the same amount immediately.
 *
 * Second attack does not consume energy.
 */
export default createCard({
  name: 'Dual Wield',
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
        round.attack(parent.source, parent.amount, AttackFlags.Natural);
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
          // Reduce main attack
          round.on(RoundEvents.Attack, ValuePriority.Pre, event => {
            if (context.card.disabled || event.source !== source) {
              return;
            }
            if (event.flag & AttackFlags.Natural) {
              event.amount *= context.card.getValue(DEFAULT_MULTIPLIER);
            }
          });
          // Trigger another attack
          round.on(RoundEvents.Attack, ValuePriority.Post, event => {
            if (context.card.disabled || event.source !== source) {
              return;
            }
            if (event.flag & (AttackFlags.Natural | AttackFlags.Tick)) {
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
