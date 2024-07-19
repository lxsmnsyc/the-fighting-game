import { EventType, type Game } from '../game';
import { log } from '../log';
import { EventPriority } from '../priorities';

export function setupAbilityMechanics(game: Game): void {
  log('Setting up Ability mechanics.');

  game.on(EventType.AddMana, EventPriority.Post, event => {
    if (event.source.mana === event.source.maxMana) {
      game.castAbility(event.source);
      game.triggerDebuff(
        EventType.RemoveMana,
        event.source,
        event.source,
        event.source.maxMana,
      );
    }
  });
}
