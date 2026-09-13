import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { measureDamage, onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 10;

export default createAbility({
  id: AbilityId.Fox,
  name: 'Fox',
  image: '',
  aspects: [Aspect.Critical, Aspect.Dodge],
  cooldown: 6000,
  description(): Description {
    return describe`Attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}. On a critical hit, also gain ${token.energy(Energy.Dodge)} equal to the damage dealt.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const report = measureDamage(battle, unit, () => {
        unit.attack(enemy, unit.getTotalEnergy(Energy.Attack) + BONUS, 0);
      });
      if (report.critical) {
        unit.addEnergy(Energy.Dodge, report.damage, false);
      }
    });
  },
});
