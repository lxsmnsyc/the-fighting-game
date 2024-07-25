import {
  type EffectCardSource,
  EventType,
  type Stat,
  createEffectCardSource,
} from '../../game';
import { EventPriority } from '../../priorities';

const DEFAULT_GAIN_MULTIPLIER = 100;

export interface AddStatOnCastAbilityOptions {
  name: string;
  stat: Stat;
  gainMultiplier?: number;
}

export function createAddStatOnCastAbility(
  options: AddStatOnCastAbilityOptions,
): EffectCardSource {
  const current = Object.assign(
    { gainMultiplier: DEFAULT_GAIN_MULTIPLIER },
    options,
  );
  return createEffectCardSource({
    name: current.name,
    tier: 1,
    load(game, player, level) {
      game.on(EventType.CastAbility, EventPriority.Post, event => {
        if (event.source === player) {
          game.addStat(current.stat, player, level * DEFAULT_GAIN_MULTIPLIER);
        }
      });
    },
  });
}
