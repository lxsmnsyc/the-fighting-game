import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { measureDamage, onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 20;

export default createAbility({
  id: AbilityId.Scorpion,
  name: 'Scorpion',
  image: '',
  aspects: [Aspect.Poison, Aspect.Critical],
  cooldown: 6000,
  description(): Description {
    return describe`Attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}. On a critical hit, also give it ${token.energy(Energy.Poison)} equal to the damage dealt.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const report = measureDamage(battle, unit, () => {
        unit.attack(enemy, unit.getTotalEnergy(Energy.Attack) + BONUS, 0);
      });
      if (report.critical) {
        enemy.addEnergy(Energy.Poison, report.damage, false);
      }
    });
  },
});
