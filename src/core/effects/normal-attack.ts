import { DamageType, EventType, createPassiveSource } from '../game';
import { log } from '../log';
import { EventPriority } from '../priorities';

export default createPassiveSource({
  name: 'Normal Attack',
  tier: 1,
  getDescription(level) {
    return ['Deals the current Attack damage every', 5 / level, ' seconds'];
  },
  load(game, player, level) {
    log('Setting up Normal Attack.');
    game.on(EventType.Start, EventPriority.Exact, () => {
      const timeout = setInterval(
        () => {
          log(`${player.name} used Normal Attack.`);
          game.dealDamage(
            DamageType.Attack,
            player,
            game.getOppositePlayer(player),
            player.attackDamage,
            {
              critical: false,
              dodged: false,
            },
          );
        },
        (5 / level) * 1000,
      );

      game.on(EventType.Close, EventPriority.Exact, () => {
        clearInterval(timeout);
      });
    });
  },
});
