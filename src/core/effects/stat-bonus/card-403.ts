import { EventType, createEffectCardSource } from '../../game';
import { log } from '../../log';
import { EventPriority } from '../../priorities';

export default createEffectCardSource({
  name: 'Card #403',
  tier: 1,
  getDescription(level) {
    return ['Increases ', 'Magic', ' by ', 10 * level, ' points.'];
  },
  load(game, player, level) {
    log(`Setting up Card 403 for ${player.name}`);
    game.on(EventType.Start, EventPriority.Pre, () => {
      log(`${player.name} gained ${10 * level} Magic.`);
      player.magic += 10 * level;
    });
  },
});
