import { Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const MAX_HEALTH = 100;
const SLOW_RATIO = 0.05;

export default createAbility({
  id: AbilityId.Elephant,
  name: 'Elephant',
  image: '',
  aspects: [Aspect.Health, Aspect.Slow],
  cooldown: 12_000,
  description(): Description {
    return describe`Gain ${token.stat(Stat.MaxHealth, MAX_HEALTH)}, then give the enemy ${token.energy(Energy.Slow)} equal to ${token.percent(SLOW_RATIO)} of your ${token.stat(Stat.MaxHealth)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      unit.addStat(Stat.MaxHealth, MAX_HEALTH);
      enemy.addEnergy(Energy.Slow, unit.stats[Stat.MaxHealth] * SLOW_RATIO, false);
    });
  },
});
