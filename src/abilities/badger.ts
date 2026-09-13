import { DamageType, Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 10;
const MISSING_HEALTH_RATIO = 0.2;

export default createAbility({
  id: AbilityId.Badger,
  name: 'Badger',
  image: '',
  aspects: [Aspect.Health, Aspect.Attack],
  cooldown: 6000,
  description(): Description {
    return describe`Attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}, plus ${token.percent(MISSING_HEALTH_RATIO)} of your missing ${token.stat(Stat.Health)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const missing = unit.stats[Stat.MaxHealth] - unit.stats[Stat.Health];
      const value = unit.getTotalEnergy(Energy.Attack) + BONUS + missing * MISSING_HEALTH_RATIO;
      unit.attack(enemy, value, 0);
    });
  },
});
