import { EventType, type Game } from '../game';

export function setupManaMechanics(game: Game): void {
  game.on(EventType.AddMana, event => {
    // Event priority 2 (exact)
    if (event.priority === 2) {
      event.source.mana = Math.min(
        event.source.maxMana,
        event.source.mana + event.amount,
      );
    }
  });

  game.on(EventType.RemoveMana, event => {
    // Event priority 2 (exact)
    if (event.priority === 2) {
      event.source.mana = Math.max(0, event.source.mana - event.amount);
    }
  });
}
