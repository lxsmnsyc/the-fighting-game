import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const ARMOR_RATIO = 2;
const BONUS = 20;

export default createAbility({
  id: AbilityId.Armadillo,
  name: 'Armadillo',
  image: '',
  aspects: [Aspect.Healing, Aspect.Armor],
  cooldown: 7000,
  description(): Description {
    return describe`Spend all your consumable ${token.energy(Energy.Healing)}, then gain ${token.energy(Energy.Armor)} equal to twice the amount spent plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, () => {
      const healing = unit.getEnergy(Energy.Healing, false);
      unit.removeEnergy(Energy.Healing, healing, false);
      unit.addEnergy(Energy.Armor, healing * ARMOR_RATIO + BONUS, false);
    });
  },
});
