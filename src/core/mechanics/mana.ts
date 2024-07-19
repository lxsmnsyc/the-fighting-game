import { EventType, type Game } from '../game';

export function setupManaMechanics(game: Game): void {
  game.on(EventType.AddMana, event => {
    if (event.priority === 2) {
      event.source.mana = Math.min(
        event.source.maxMana,
        event.source.mana + event.amount,
      );
    }
  });

  game.on(EventType.RemoveMana, event => {
    if (event.priority === 2) {
      event.source.mana = Math.max(0, event.source.mana - event.amount);
    }
  });
}
