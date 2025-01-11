import type { Game } from './game';
import { setupGameMechanics } from './mechanics';
import { EventPriority, GameEventType, RoundEventType } from './types';

export function setupGame(game: Game): void {
  game.on(GameEventType.Setup, EventPriority.Exact, () => {
    setupGameMechanics(game);

    game.start();
  });

  game.on(GameEventType.Start, EventPriority.Exact, () => {
    // Display the starter card selection
  });

  game.on(GameEventType.OpenShop, EventPriority.Exact, () => {
    // do stuff
  });

  game.on(GameEventType.NextRound, EventPriority.Exact, ({ round }) => {
    round.setup();

    round.on(RoundEventType.End, EventPriority.Exact, event => {
      if (event.winner.owner === game.player) {
        game.openShop();
      } else {
        game.end();
      }
    });
  });

  game.on(GameEventType.End, EventPriority.Exact, () => {
    // do stuff
  });
}
