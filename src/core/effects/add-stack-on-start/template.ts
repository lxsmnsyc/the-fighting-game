import { Card, type CardContext } from '../../card';
import {
  EventPriority,
  GameEventType,
  Rarity,
  RoundEventType,
  type Stack,
} from '../../types';

const DEFAULT_MULTIPLIER = 25;

export class AddStackOnStart extends Card {
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
        round.on(RoundEventType.Start, EventPriority.Post, () => {
          if (context.player.currentUnit) {
            round.addStack(
              this.stack,
              context.player.currentUnit,
              this.multiplier * context.card.getMultiplier(),
            );
          }
        });
      },
    );
  }
}
