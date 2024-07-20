import { EventType, type Game, Stat } from '../game';
import { log } from '../log';
import { EventPriority } from '../priorities';

export function setupAbilityMechanics(game: Game): void {
  log('Setting up Ability mechanics.');

  game.on(EventType.AddStat, EventPriority.Post, event => {
    if (event.type === Stat.Mana) {
      if (event.source.stats[Stat.Mana] === event.source.stats[Stat.MaxMana]) {
        game.CastAbility(event.source);
      }
    }
  });

  game.on(EventType.CastAbility, EventPriority.Exact, event => {
    game.setStat(Stat.Mana, event.source, 0);
  });
}
