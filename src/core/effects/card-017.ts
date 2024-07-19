import { EventType, createEffectCardSource } from '../game';
import { log } from '../log';
import { BuffPriority } from '../priorities';

export default createEffectCardSource({
  name: 'Card #017',
  tier: 1,
  getDescription(level) {
    return [
      'Increases ',
      'Critical',
      ' stacks gained by ',
      5 * level,
      ' points.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 017 for ${player.name}`);
    game.on(EventType.AddCritical, BuffPriority.Pre, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
