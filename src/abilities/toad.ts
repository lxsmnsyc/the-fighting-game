import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const HEALING = 20;

export default createAbility({
  id: AbilityId.Toad,
  name: 'Toad',
  image: '',
  aspects: [Aspect.Poison, Aspect.Healing],
  cooldown: 7000,
  description(): Description {
    return describe`Pass all your consumable ${token.energy(Energy.Poison)} to the enemy, then gain ${token.energy(Energy.Healing)} equal to the amount passed plus ${token.value(HEALING)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const poison = unit.getEnergy(Energy.Poison, false);
      unit.removeEnergy(Energy.Poison, poison, false);
      enemy.addEnergy(Energy.Poison, poison, false);
      unit.addEnergy(Energy.Healing, poison + HEALING, false);
    });
  },
});
