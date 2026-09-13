import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 10;

export default createAbility({
  id: AbilityId.Rhino,
  name: 'Rhino',
  image: '',
  aspects: [Aspect.Armor, Aspect.Attack],
  cooldown: 7000,
  description(): Description {
    return describe`Attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus your ${token.energy(Energy.Armor)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const value = unit.getTotalEnergy(Energy.Attack) + unit.getTotalEnergy(Energy.Armor) + BONUS;
      unit.attack(enemy, value, 0);
    });
  },
});
