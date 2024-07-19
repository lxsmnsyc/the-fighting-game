import { EventType, createPassiveSource } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { EventPriority } from '../priorities';
import { FRAME_DURATION, createTick } from '../tick';

const MIN_PERIOD = 5;
const MAX_PERIOD = 0.2;
const MAX_SPEED = 750;

function getBrilliancePeriod(speed: number): number {
  return lerp(MIN_PERIOD, MAX_PERIOD, Math.max(speed / MAX_SPEED, 1));
}

export default createPassiveSource({
  name: 'Brilliance',
  tier: 1,
  getDescription(level) {
    return [
      'Periodically gains ',
      0.2 * level,
      ' mana. Base period is 5 seconds.',
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
        if (elapsed >= period) {
          elapsed = 0;
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
