import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 20;

export default createAbility({
  id: AbilityId.Newt,
  name: 'Newt',
  image: '',
  aspects: [Aspect.Healing, Aspect.Poison],
  cooldown: 6000,
  description(): Description {
    return describe`Give the enemy ${token.energy(Energy.Poison)} equal to your ${token.energy(Energy.Healing)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      enemy.addEnergy(Energy.Poison, unit.getTotalEnergy(Energy.Healing) + BONUS, false);
    });
  },
});
