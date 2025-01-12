import type { Game } from './game';
import { setupGameMechanics } from './mechanics';
import { EventPriority, GameEvents, RoundEvents } from './types';

export function setupGame(game: Game): void {
  game.on(GameEvents.Setup, EventPriority.Exact, () => {
    setupGameMechanics(game);

    game.start();
  });

  game.on(GameEvents.Start, EventPriority.Exact, () => {
    game.nextRound();
  });

  game.on(GameEvents.StartRound, EventPriority.Exact, ({ round }) => {
    round.setup();

    round.on(RoundEvents.End, EventPriority.Exact, event => {
      if (event.winner.owner === game.player) {
        game.nextRound();
      } else {
        game.end();
      }
    });
  });

  game.on(GameEvents.End, EventPriority.Exact, () => {
    // game over :(
  });

  game.on(GameEvents.AcquireCard, EventPriority.Exact, ({ card }) => {
    // TODO gold consumption
    game.enableCard(card);
  });

  game.on(GameEvents.SellCard, EventPriority.Exact, ({ card }) => {
    // TODO gold refund
    game.disableCard(card);
  });

  game.on(GameEvents.EnableCard, EventPriority.Exact, ({ card }) => {
    card.enabled = true;
  });

  game.on(GameEvents.DisableCard, EventPriority.Exact, ({ card }) => {
    card.enabled = false;
  });
}
