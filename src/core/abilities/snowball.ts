import { DamageType, EventType, createAbilityCardSource } from '../game';
import { EventPriority } from '../priorities';

export default createAbilityCardSource({
  name: 'Snowball',
  getDescription(level) {
    return [
      'Deals ',
      100 * level,
      'magic damage and increases by ',
      level * 10,
      ' for every cast.',
    ];
  },
  load(game, player, level) {
    game.on(EventType.Start, EventPriority.Exact, () => {
      let multiplier = 0;
      game.on(EventType.CastAbility, EventPriority.Exact, event => {
        if (event.source === player) {
          game.dealDamage(
            DamageType.Magic,
            player,
            game.getOppositePlayer(player),
            100 * level + 10 * level * multiplier,
            {
              critical: false,
              missed: false,
            },
          );
          multiplier++;
        }
      });
    });
  },
});
