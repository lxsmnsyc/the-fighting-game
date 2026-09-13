import { DamageType, Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { measureDamage, onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 20;
const HEAL_RATIO = 0.5;

export default createAbility({
  id: AbilityId.Bat,
  name: 'Bat',
  image: '',
  aspects: [Aspect.Attack, Aspect.Healing],
  cooldown: 6000,
  description(): Description {
    return describe`Attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}, then heal ${token.stat(Stat.Health)} equal to ${token.percent(HEAL_RATIO)} of the damage dealt.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const report = measureDamage(battle, unit, () => {
        unit.attack(enemy, unit.getTotalEnergy(Energy.Attack) + BONUS, 0);
      });
      unit.heal(unit, report.damage * HEAL_RATIO, 0);
    });
  },
});
