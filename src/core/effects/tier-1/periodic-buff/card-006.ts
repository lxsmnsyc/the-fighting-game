import { EventType, createEffectCardSource } from '../../../game';
import { lerp } from '../../../lerp';
import { log } from '../../../log';
import { EventPriority } from '../../../priorities';
import { FRAME_DURATION, createTick } from '../../../tick';

const MIN_PERIOD = 5000;
const MAX_PERIOD = 200;
const MAX_SPEED = 750;

function getCard006Period(speed: number): number {
  return lerp(MIN_PERIOD, MAX_PERIOD, Math.min(speed / MAX_SPEED, 1));
}

export default createEffectCardSource({
  name: 'Card #006',
  tier: 1,
  getDescription(level) {
    return [
      'Periodically gains ',
      level,
      ' stacks of Speed. Period ranges from',
      5,
      ' seconds to ',
      0.2,
      ' seconds based on ',
      'Speed',
      '.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Card 006 for ${player.name}`);
    game.on(EventType.Start, EventPriority.Post, () => {
      let elapsed = 0;
      let period = getCard006Period(player.speedStacks);

      const cleanup = createTick(() => {
        // Calculate period
        elapsed += FRAME_DURATION;
        if (elapsed >= period) {
          elapsed -= period;
          period = getCard006Period(player.speedStacks);

          game.triggerBuff(EventType.AddSpeed, player, level);
        }
      });

      game.on(EventType.Close, EventPriority.Pre, () => {
        cleanup();
      });
    });
  },
});