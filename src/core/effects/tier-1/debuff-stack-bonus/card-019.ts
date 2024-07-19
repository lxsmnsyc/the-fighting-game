import { EventType, createEffectCardSource } from '../../../game';
import { log } from '../../../log';
import { DebuffPriority } from '../../../priorities';

export default createEffectCardSource({
  name: 'Card #019',
  tier: 1,
  getDescription(level) {
    return [
      'Increases ',
      'Armor Decay',
      ' stacks applied by ',
      5 * level,
      ' points.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 019 for ${player.name}`);
    game.on(EventType.RemoveArmor, DebuffPriority.Pre, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
