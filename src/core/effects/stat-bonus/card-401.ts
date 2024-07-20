import { EventType, createEffectCardSource } from '../../game';
import { log } from '../../log';
import { EventPriority } from '../../priorities';

export default createEffectCardSource({
  name: 'Card #401',
  tier: 1,
  getDescription(level) {
    return ['Increases ', 'Max Health', ' by ', 250 * level, ' points.'];
  },
  load(game, player, level) {
    log(`Setting up Card 401 for ${player.name}`);
    game.on(EventType.Start, EventPriority.Pre, () => {
      log(`${player.name} gained ${250 * level} Max Health.`);
      player.maxHealth += 250 * level;
      player.health = player.maxHealth;
    });
  },
});
