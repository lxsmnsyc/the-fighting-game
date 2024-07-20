import {
  BUFF_NAME,
  BUFF_STACKS,
  type BuffEventType,
  type EffectCardSource,
  createEffectCardSource,
} from '../../game';
import { log } from '../../log';
import { BuffPriority } from '../../priorities';

export interface BuffStackBonusEffectCardSourceOptions {
  name: string;
  tier: number;
  buff: BuffEventType;
  gainMultiplier?: number;
}

const DEFAULT_GAIN_MULTIPLIER = 5;

export default function createBuffStackBonusEffectCardSource(
  options: BuffStackBonusEffectCardSourceOptions,
): EffectCardSource {
  const current = Object.assign(
    { gainMultiplier: DEFAULT_GAIN_MULTIPLIER },
    options,
  );
  function getGain(level: number) {
    return current.gainMultiplier * level;
  }
  return createEffectCardSource({
    name: current.name,
    tier: 1,
    getDescription(level) {
      return [
        'Increases ',
        BUFF_NAME[current.buff],
        ` ${BUFF_STACKS[current.buff]} gained by `,
        getGain(level),
        '.',
      ];
    },
    load(game, player, level) {
      log(`Setting up ${current.name} for ${player.name}`);
      game.on(current.buff, BuffPriority.Additive, event => {
        if (event.source === player) {
          event.amount += getGain(level);
        }
      });
    },
  });
}
