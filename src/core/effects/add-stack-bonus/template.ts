import {
  type EffectCardSource,
  EventType,
  STAT_NAME,
  type Stack,
  createEffectCardSource,
} from '../../game';
import { log } from '../../log';
import { StackPriority } from '../../priorities';

export interface AddStackBonusEffectCardSourceOptions {
  name: string;
  tier: number;
  stat: Stack;
  gainMultiplier?: number;
}

const DEFAULT_GAIN_MULTIPLIER = 5;

export function createAddStackBonusEffectCardSource(
  options: AddStackBonusEffectCardSourceOptions,
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
        STAT_NAME[current.stat],
        ' stacks gained by ',
        getGain(level),
        '.',
      ];
    },
    load(game, player, level) {
      log(`Setting up ${current.name} for ${player.name}`);
      game.on(EventType.AddStack, StackPriority.Additive, event => {
        if (event.type === current.stat && event.source === player) {
          event.amount += getGain(level);
        }
      });
    },
  });
}
