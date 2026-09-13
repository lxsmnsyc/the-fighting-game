import { Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const HEALTH_RATIO = 0.05;
const CORROSION_RATIO = 2;
const BONUS = 10;

export default createAbility({
  id: AbilityId.Hyena,
  name: 'Hyena',
  image: '',
  aspects: [Aspect.Health, Aspect.Corrosion],
  cooldown: 8000,
  description(): Description {
    return describe`Lose ${token.stat(Stat.Health)} equal to ${token.percent(HEALTH_RATIO)} of your ${token.stat(Stat.MaxHealth)}, but never below 1. Give the enemy ${token.energy(Energy.Corrosion)} equal to twice the ${token.stat(Stat.Health)} lost plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const cost = (unit.stats[Stat.MaxHealth] * HEALTH_RATIO) | 0;
      const lost = Math.max(0, Math.min(cost, unit.stats[Stat.Health] - 1));
      unit.removeStat(Stat.Health, lost);
      enemy.addEnergy(Energy.Corrosion, lost * CORROSION_RATIO + BONUS, false);
    });
  },
});
