import { EventType, createEffectCardSource } from '../../../game';
import { log } from '../../../log';
import { BuffPriority } from '../../../priorities';

export default createEffectCardSource({
  name: 'Card #012',
  tier: 1,
  getDescription(level) {
    return [
      'Increases ',
      'Health',
      ' points gained by ',
      5 * level,
      ' points.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 012 for ${player.name}`);
    game.on(EventType.AddHealth, BuffPriority.Pre, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
