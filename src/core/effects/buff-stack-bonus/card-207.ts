import { EventType, createEffectCardSource } from '../../game';
import { log } from '../../log';
import { BuffPriority } from '../../priorities';

export default createEffectCardSource({
  name: 'Card #207',
  tier: 1,
  getDescription(level) {
    return ['Increases ', 'Luck', ' stacks gained by ', 5 * level, ' points.'];
  },
  load(game, player, level) {
    log(`Setting up Card 207 for ${player.name}`);
    game.on(EventType.AddLuck, BuffPriority.Additive, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
