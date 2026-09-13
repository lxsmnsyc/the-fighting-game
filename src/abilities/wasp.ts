import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 10;

export default createAbility({
  id: AbilityId.Wasp,
  name: 'Wasp',
  image: '',
  aspects: [Aspect.Poison, Aspect.Critical],
  cooldown: 6000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Critical)} equal to the enemy's ${token.energy(Energy.Poison)}, then attack it for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      unit.addEnergy(Energy.Critical, enemy.getTotalEnergy(Energy.Poison), false);
      unit.attack(enemy, unit.getTotalEnergy(Energy.Attack) + BONUS, 0);
    });
  },
});
