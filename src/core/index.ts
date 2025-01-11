import type { Game } from './game';
import { setupGameMechanics } from './mechanics';
import { EventPriority, GameEventType, RoundEventType } from './types';

export function setupGame(game: Game): void {
  game.on(GameEventType.Setup, EventPriority.Exact, () => {
    setupGameMechanics(game);

    game.start();
  });

  game.on(GameEventType.Start, EventPriority.Exact, () => {
    game.nextRound();
  });

  game.on(GameEventType.StartRound, EventPriority.Exact, ({ round }) => {
    round.setup();

    round.on(RoundEventType.End, EventPriority.Exact, event => {
      if (event.winner.owner === game.player) {
        game.nextRound();
      } else {
        game.end();
      }
    });
  });

  game.on(GameEventType.End, EventPriority.Exact, () => {
    // game over :(
  });
}
