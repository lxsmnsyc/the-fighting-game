import { BattleEvents } from '../battle/events';
import { EventPriority } from '../core/event-emitter';
import { GameEvents } from './events';
import type Game from './game';

export default function setupGame(game: Game): void {
  game.on(GameEvents.Setup, EventPriority.Post, () => {
    game.start();
  });

  game.on(GameEvents.Start, EventPriority.Exact, () => {
    game.nextRound();
  });

  game.on(GameEvents.StartRound, EventPriority.Post, ({ battle }) => {
    battle.on(BattleEvents.End, EventPriority.Exact, () => {
      const won =
        battle.winner != null &&
        [...battle.winner.teams].some((team) => team.player === game.player);

      if (won) {
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
    card.disabled = false;
  });

  game.on(GameEvents.DisableCard, EventPriority.Exact, ({ card }) => {
    card.disabled = true;
  });
}
