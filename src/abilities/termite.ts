import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const CORROSION = 30;
const BONUS = 10;

export default createAbility({
  id: AbilityId.Termite,
  name: 'Termite',
  image: '',
  aspects: [Aspect.Corrosion, Aspect.Attack],
  cooldown: 5000,
  description(): Description {
    return describe`Give the enemy ${token.energy(Energy.Corrosion, CORROSION)}, then attack it for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      enemy.addEnergy(Energy.Corrosion, CORROSION, false);
      unit.attack(enemy, unit.getTotalEnergy(Energy.Attack) + BONUS, 0);
    });
  },
});
