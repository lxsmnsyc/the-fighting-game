import { EventType, createEffectCardSource } from '../../game';
import { log } from '../../log';
import { DebuffPriority } from '../../priorities';

export default createEffectCardSource({
  name: 'Card #304',
  tier: 1,
  getDescription(level) {
    return [
      'Increases ',
      'Critical Decay',
      ' stacks applied by ',
      5 * level,
      ' points.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 304 for ${player.name}`);
    game.on(EventType.RemoveCritical, DebuffPriority.Additive, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
