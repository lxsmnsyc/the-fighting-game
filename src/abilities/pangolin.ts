import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const CORROSION = 20;

export default createAbility({
  id: AbilityId.Pangolin,
  name: 'Pangolin',
  image: '',
  aspects: [Aspect.Corrosion, Aspect.Armor],
  cooldown: 6000,
  description(): Description {
    return describe`Give the enemy ${token.energy(Energy.Corrosion, CORROSION)}, then gain ${token.energy(Energy.Armor)} equal to its ${token.energy(Energy.Corrosion)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      enemy.addEnergy(Energy.Corrosion, CORROSION, false);
      unit.addEnergy(Energy.Armor, enemy.getTotalEnergy(Energy.Corrosion), false);
    });
  },
});
