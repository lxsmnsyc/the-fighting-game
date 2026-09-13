import { DamageType, Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const MISSING_HEALTH_RATIO = 0.1;

export default createAbility({
  id: AbilityId.Vulture,
  name: 'Vulture',
  image: '',
  aspects: [Aspect.Corrosion, Aspect.Health],
  cooldown: 9000,
  description(): Description {
    return describe`Deal ${token.damage(DamageType.Pure)} equal to ${token.percent(MISSING_HEALTH_RATIO)} of the enemy's missing ${token.stat(Stat.Health)} plus its ${token.energy(Energy.Corrosion)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const missing = enemy.stats[Stat.MaxHealth] - enemy.stats[Stat.Health];
      const value = missing * MISSING_HEALTH_RATIO + enemy.getTotalEnergy(Energy.Corrosion);
      unit.dealDamage(enemy, DamageType.Pure, value, 0);
    });
  },
});
