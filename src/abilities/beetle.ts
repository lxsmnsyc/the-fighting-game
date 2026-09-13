import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const CORROSION = 20;

export default createAbility({
  id: AbilityId.Beetle,
  name: 'Beetle',
  image: '',
  aspects: [Aspect.Armor, Aspect.Corrosion],
  cooldown: 6000,
  description(): Description {
    return describe`Take all of the enemy's consumable ${token.energy(Energy.Armor)}, then give it ${token.energy(Energy.Corrosion, CORROSION)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const armor = enemy.getEnergy(Energy.Armor, false);
      enemy.removeEnergy(Energy.Armor, armor, false);
      unit.addEnergy(Energy.Armor, armor, false);
      enemy.addEnergy(Energy.Corrosion, CORROSION, false);
    });
  },
});
