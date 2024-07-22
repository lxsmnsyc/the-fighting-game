import { DamageType } from '../damage';
import { EventType, createAbilityCardSource } from '../game';
import { EventPriority } from '../priorities';

export default createAbilityCardSource({
  name: 'Simple Damage',
  load(game, player, level) {
    game.on(EventType.CastAbility, EventPriority.Post, event => {
      if (event.source === player) {
        game.dealDamage(
          DamageType.Magic,
          player,
          game.getOppositePlayer(player),
          level * 250,
          0,
        );
      }
    });
  },
});
