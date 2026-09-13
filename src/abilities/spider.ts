import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const SLOW = 30;

export default createAbility({
  id: AbilityId.Spider,
  name: 'Spider',
  image: '',
  aspects: [Aspect.Slow, Aspect.Poison],
  cooldown: 6000,
  description(): Description {
    return describe`Give the enemy ${token.energy(Energy.Slow, SLOW)}, then give it ${token.energy(Energy.Poison)} equal to its ${token.energy(Energy.Slow)}.`;
  },
  setup(context): Lifecycle {
    return onTriggerAbility(context, (enemy) => {
      enemy.addEnergy(Energy.Slow, SLOW, false);
      enemy.addEnergy(Energy.Poison, enemy.getTotalEnergy(Energy.Slow), false);
    });
  },
});
