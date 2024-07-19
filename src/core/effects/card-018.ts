import { EventType, createEffectCardSource } from '../game';
import { log } from '../log';
import { DebuffPriority } from '../priorities';

export default createEffectCardSource({
  name: 'Card #018',
  tier: 1,
  getDescription(level) {
    return [
      'Increases ',
      'Poison',
      ' stacks applied by ',
      5 * level,
      ' points.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 018 for ${player.name}`);
    game.on(EventType.AddPoison, DebuffPriority.Pre, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
