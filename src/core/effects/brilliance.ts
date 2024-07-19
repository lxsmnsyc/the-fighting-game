import { EventType, createEffectCardSource } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { EventPriority } from '../priorities';
import { FRAME_DURATION, createTick } from '../tick';

const MIN_PERIOD = 5;
const MAX_PERIOD = 0.2;
const MAX_SPEED = 750;

function getBrilliancePeriod(speed: number): number {
  return lerp(MIN_PERIOD, MAX_PERIOD, Math.min(speed / MAX_SPEED, 1));
}

export default createEffectCardSource({
  name: 'Brilliance',
  tier: 1,
  getDescription(level) {
    return [
      'Periodically gains ',
      level,
      ' mana. Period ranges from',
      5,
      ' seconds to ',
      0.2,
      ' seconds based on ',
      'Speed',
      '.',
    ];
  },
  load(game, player, level) {
    log(`Setting up Brilliance for ${player.name}`);
    game.on(EventType.Start, EventPriority.Post, () => {
      let elapsed = 0;
      let period = getBrilliancePeriod(player.speedStacks);

      const cleanup = createTick(() => {
        // Calculate period
        elapsed += FRAME_DURATION;
        if (elapsed >= period * 1000) {
          elapsed -= period;
          period = getBrilliancePeriod(player.speedStacks);

          game.triggerBuff(EventType.AddMana, player, 0.2 * level);
        }
      });

      game.on(EventType.Close, EventPriority.Pre, () => {
        cleanup();
      });
    });
  },
});
