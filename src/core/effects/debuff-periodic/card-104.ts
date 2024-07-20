import { EventType, createEffectCardSource } from '../../game';
import { lerp } from '../../lerp';
import { log } from '../../log';
import { EventPriority } from '../../priorities';
import { FRAME_DURATION, createTick } from '../../tick';

const MIN_PERIOD = 5000;
const MAX_PERIOD = 200;
const MAX_SPEED = 750;

function getCard104Period(speed: number): number {
  return lerp(MIN_PERIOD, MAX_PERIOD, Math.min(speed / MAX_SPEED, 1));
}

export default createEffectCardSource({
  name: 'Card #104',
  tier: 1,
  getDescription(level) {
    return [
      'Periodically applies ',
      level,
      ' stacks of Critical Decay to the enemy. Period ranges from',
      5,
      ' seconds to ',
      0.2,
      ' seconds based on ',
      'Speed',
      '.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 104 for ${player.name}`);
    game.on(EventType.Start, EventPriority.Post, () => {
      let elapsed = 0;
      let period = getCard104Period(player.speedStacks);

      const cleanup = createTick(() => {
        // Calculate period
        elapsed += FRAME_DURATION;
        if (elapsed >= period) {
          elapsed -= period;
          period = getCard104Period(player.speedStacks);

          game.triggerDebuff(
            EventType.RemoveCritical,
            player,
            game.getOppositePlayer(player),
            level,
          );
        }
      });

      game.on(EventType.Close, EventPriority.Pre, () => {
        cleanup();
      });
    });
  },
});
