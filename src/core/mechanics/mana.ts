import { EventType, type Game } from '../game';
import { log } from '../log';
import { BuffPriority, DebuffPriority } from '../priorities';

export function setupManaMechanics(game: Game): void {
  log('Setting up Mana mechanics.');
  game.on(EventType.AddMana, BuffPriority.Exact, event => {
    log(`${event.source.name} gained ${event.amount} of Mana`);
    event.source.mana = Math.min(
      event.source.maxMana,
      event.source.mana + event.amount,
    );
  });

  game.on(EventType.RemoveMana, DebuffPriority.Exact, event => {
    const deduction = Math.min(event.target.mana, event.amount);
    log(`${event.target.name} lost ${deduction} of Mana`);
    event.target.mana -= deduction;
  });
}
