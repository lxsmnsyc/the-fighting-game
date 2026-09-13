import { DamageType, Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const SLOW = 30;

export default createAbility({
  id: AbilityId.Octopus,
  name: 'Octopus',
  image: '',
  aspects: [Aspect.Magic, Aspect.Slow],
  cooldown: 6000,
  description(): Description {
    return describe`Give the enemy ${token.energy(Energy.Slow, SLOW)}, then deal ${token.damage(DamageType.Magical)} equal to your ${token.energy(Energy.Magic)} plus its ${token.energy(Energy.Slow)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      enemy.addEnergy(Energy.Slow, SLOW, false);
      const value = unit.getTotalEnergy(Energy.Magic) + enemy.getTotalEnergy(Energy.Slow);
      unit.dealDamage(enemy, DamageType.Magical, value, 0);
    });
  },
});
