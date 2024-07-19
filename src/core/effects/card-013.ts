import { EventType, createEffectCardSource } from '../game';
import { log } from '../log';
import { BuffPriority } from '../priorities';

export default createEffectCardSource({
  name: 'Card #009',
  tier: 1,
  getDescription(level) {
    return ['Increases ', 'Mana', ' points gained by ', 5 * level, ' points.'];
  },
  load(game, player, level) {
    log(`Setting up Card 009 for ${player.name}`);
    game.on(EventType.AddMana, BuffPriority.Pre, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
