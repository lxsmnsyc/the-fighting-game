import { TriggerEnergyFlags } from '../battle/flags';
import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

export default createAbility({
  id: AbilityId.Bear,
  name: 'Bear',
  image: '',
  aspects: [Aspect.Healing, Aspect.Attack],
  cooldown: 7000,
  description(): Description {
    return describe`Trigger your ${token.energy(Energy.Healing)} without spending it, then attack the enemy for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus your ${token.energy(Energy.Healing)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const healing = unit.getTotalEnergy(Energy.Healing);
      unit.triggerEnergy(Energy.Healing, TriggerEnergyFlags.NoConsume);
      if (enemy.alive) {
        unit.attack(enemy, unit.getTotalEnergy(Energy.Attack) + healing, 0);
      }
    });
  },
});
