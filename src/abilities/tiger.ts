import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const ATTACK_RATIO = 3;
const BONUS = 30;

export default createAbility({
  id: AbilityId.Tiger,
  name: 'Tiger',
  image: '',
  aspects: [Aspect.Attack, Aspect.Critical],
  cooldown: 6000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Critical)} equal to three times your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}, then attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const attack = unit.getTotalEnergy(Energy.Attack);
      unit.addEnergy(Energy.Critical, attack * ATTACK_RATIO + BONUS, false);
      unit.attack(enemy, attack, 0);
    });
  },
});
