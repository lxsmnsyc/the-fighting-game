import { DamageType, Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { measureDamage, onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 10;

export default createAbility({
  id: AbilityId.Wolf,
  name: 'Wolf',
  image: '',
  aspects: [Aspect.Attack, Aspect.Health],
  cooldown: 8000,
  description(): Description {
    return describe`Attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}, then gain ${token.stat(Stat.MaxHealth)} equal to the damage dealt.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const report = measureDamage(battle, unit, () => {
        unit.attack(enemy, unit.getTotalEnergy(Energy.Attack) + BONUS, 0);
      });
      unit.addStat(Stat.MaxHealth, report.damage);
    });
  },
});
