import { Card, type CardContext } from '../../card';
import {
  EventPriority,
  GameEventType,
  Rarity,
  RoundEventType,
  type Stack,
  StackPriority,
} from '../../types';

const DEFAULT_MULTIPLIER = 5;

export class AddStackBonusCard extends Card {
  constructor(
    public stack: Stack,
    public multiplier = DEFAULT_MULTIPLIER,
    public rarity = Rarity.Common,
  ) {
    super();
  }

  load(context: CardContext): void {
    context.game.on(
      GameEventType.NextRound,
      EventPriority.Exact,
      ({ round }) => {
        round.on(RoundEventType.AddStack, StackPriority.Additive, event => {
          if (
            !context.card.disabled &&
            event.type === this.stack &&
            event.source.owner === context.player
          ) {
            event.amount += this.multiplier * context.card.getMultiplier();
          }
        });
      },
    );
  }
}
