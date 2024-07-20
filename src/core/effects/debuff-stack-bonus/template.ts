import {
  DEBUFF_NAME,
  DEBUFF_STACKS,
  type DebuffEventType,
  type EffectCardSource,
  createEffectCardSource,
} from '../../game';
import { log } from '../../log';
import { DebuffPriority } from '../../priorities';

export interface DebuffStackBonusEffectCardSourceOptions {
  name: string;
  tier: number;
  debuff: DebuffEventType;
  gainMultiplier?: number;
}

const DEFAULT_GAIN_MULTIPLIER = 5;

export default function createDebuffStackBonusEffectCardSource(
  options: DebuffStackBonusEffectCardSourceOptions,
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
        DEBUFF_NAME[current.debuff],
        ` ${DEBUFF_STACKS[current.debuff]} gained by `,
        getGain(level),
        '.',
      ];
    },
    load(game, player, level) {
      log(`Setting up ${current.name} for ${player.name}`);
      game.on(current.debuff, DebuffPriority.Additive, event => {
        if (event.source === player) {
          event.amount += getGain(level);
        }
      });
    },
  });
}
