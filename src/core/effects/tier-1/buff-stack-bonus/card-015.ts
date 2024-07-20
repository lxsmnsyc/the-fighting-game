import { EventType, createEffectCardSource } from '../../../game';
import { log } from '../../../log';
import { BuffPriority } from '../../../priorities';

export default createEffectCardSource({
  name: 'Card #015',
  tier: 1,
  getDescription(level) {
    return [
      'Increases ',
      'Evasion',
      ' stacks gained by ',
      5 * level,
      ' points.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 015 for ${player.name}`);
    game.on(EventType.AddEvasion, BuffPriority.Additive, event => {
      if (event.source === player) {
        event.amount += 5 * level;
      }
    });
  },
});
