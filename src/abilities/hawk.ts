import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility, withCertainCritical } from './effects';
import AbilityId from './ids';

const BONUS = 20;

export default createAbility({
  id: AbilityId.Hawk,
  name: 'Hawk',
  image: '',
  aspects: [Aspect.Critical, Aspect.Attack],
  cooldown: 6000,
  description(): Description {
    return describe`Attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}. It is a critical hit unless dodged.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    return onTriggerAbility(context, (enemy) => {
      withCertainCritical(battle, unit, () => {
        unit.attack(enemy, unit.getTotalEnergy(Energy.Attack) + BONUS, 0);
      });
    });
  },
});
