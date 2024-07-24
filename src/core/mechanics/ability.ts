import { EventType, type Game, Stat } from '../game';
import { log } from '../log';
import { EventPriority, StatPriority } from '../priorities';

export function setupAbilityMechanics(game: Game): void {
  log('Setting up Ability mechanics.');

  game.on(EventType.SetStat, StatPriority.Post, event => {
    if (
      event.type === Stat.Mana &&
      event.source.stats[Stat.Mana] >= event.source.stats[Stat.MaxMana]
    ) {
      game.castAbility(event.source);
    }
  });

  game.on(EventType.CastAbility, EventPriority.Exact, event => {
    game.setStat(Stat.Mana, event.source, 0);
  });
}
