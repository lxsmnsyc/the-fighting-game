import { Card, type CardContext, type CardManipulator } from '../../card';
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
    manipulator: CardManipulator,
    public stack: Stack,
    public multiplier = DEFAULT_MULTIPLIER,
    public rarity = Rarity.Common,
  ) {
    super(manipulator);
  }

  load(context: CardContext): void {
    context.game.on(
      GameEventType.NextRound,
      EventPriority.Exact,
      ({ round }) => {
        round.on(RoundEventType.AddStack, StackPriority.Additive, event => {
          if (
            event.type === this.stack &&
            event.source.owner === context.player
          ) {
            event.amount += this.multiplier * this.getMultiplier();
          }
        });
      },
    );
  }
}
