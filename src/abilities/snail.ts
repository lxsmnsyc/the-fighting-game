import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const SLOW = 30;

export default createAbility({
  id: AbilityId.Snail,
  name: 'Snail',
  image: '',
  aspects: [Aspect.Slow, Aspect.Armor],
  cooldown: 8000,
  description(): Description {
    return describe`Give the enemy ${token.energy(Energy.Slow, SLOW)}, then gain ${token.energy(Energy.Armor)} equal to its ${token.energy(Energy.Slow)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      enemy.addEnergy(Energy.Slow, SLOW, false);
      unit.addEnergy(Energy.Armor, enemy.getTotalEnergy(Energy.Slow), false);
    });
  },
});
