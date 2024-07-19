import { EventType, type Game } from '../game';
import { BuffPriority, DebuffPriority } from '../priorities';

export function setupManaMechanics(game: Game): void {
  game.on(EventType.AddMana, BuffPriority.Exact, event => {
    event.source.mana = Math.min(
      event.source.maxMana,
      event.source.mana + event.amount,
    );
  });

  game.on(EventType.RemoveMana, DebuffPriority.Exact, event => {
    event.source.mana = Math.max(0, event.source.mana - event.amount);
  });
}
