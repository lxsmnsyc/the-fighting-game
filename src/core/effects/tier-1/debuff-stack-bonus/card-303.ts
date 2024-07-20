import { EventType, createEffectCardSource } from '../../../game';
import { log } from '../../../log';
import { DebuffPriority } from '../../../priorities';

export default createEffectCardSource({
  name: 'Card #303',
  tier: 1,
  getDescription(level) {
    return [
      'Increases ',
      'Evasion Decay',
      ' stacks applied by ',
      5 * level,
      ' points.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 303 for ${player.name}`);
    game.on(EventType.RemoveEvasion, DebuffPriority.Additive, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
