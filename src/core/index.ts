import type { Game } from './game';
import { EventPriority, GameEventType } from './types';

export function setupGame(game: Game): void {
  game.on(GameEventType.Setup, EventPriority.Exact, () => {
    console.log('Setup');

    game.start();
  });

  game.on(GameEventType.Start, EventPriority.Exact, () => {
    // Display the starter card selection
  });

  game.on(GameEventType.OpenShop, EventPriority.Exact, () => {
    // do stuff
  });

  game.on(GameEventType.AcquireCard, EventPriority.Exact, () => {
    // do stuff
  });

  game.on(GameEventType.SellCard, EventPriority.Exact, () => {
    // do stuff
  });

  game.on(GameEventType.EnableCard, EventPriority.Exact, ({ card }) => {
    card.enabled = true;
  });

  game.on(GameEventType.EnableCard, EventPriority.Exact, ({ card }) => {
    card.enabled = false;
  });

  game.on(GameEventType.NextRound, EventPriority.Exact, () => {
    // do stuff
  });

  game.on(GameEventType.End, EventPriority.Exact, () => {
    // do stuff
  });
}
