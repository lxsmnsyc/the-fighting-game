import { type Card, type CardContext, createCard } from '../../card';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  Stat,
  StatPriority,
} from '../../types';

const DEFAULT_MULTIPLIER = 100;

function createAddStatOnStartCard(
  name: string,
  stat: Stat,
  aspect: Aspect[],
  image = ''
): Card {
  return createCard({
    name,
    rarity: Rarity.Common,
    image,
    aspect,
    load(context: CardContext): void {
      // Trigger card
      context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
        if (event.card === context.card) {
          const { round, target } = event.data as {
            round: Round;
            target: Unit;
          };
          round.addStat(
            stat,
            target,
            DEFAULT_MULTIPLIER * context.card.getMultiplier(),
          );
        }
      });
      // Trigger condition
      context.game.on(
        GameEvents.StartRound,
        EventPriority.Exact,
        ({ round }) => {
          round.on(RoundEvents.SetupUnit, StatPriority.Additive, () => {
            context.game.triggerCard(context.card, {
              round,
              target: round.getOwnedUnit(context.card.owner),
            });
          });
        },
      );
    },
  });
}

export const ADD_STAT_ON_START_CARDS = [
  createAddStatOnStartCard('', Stat.MaxHealth, [Aspect.Health]),
];
