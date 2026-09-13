import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const ATTACK_RATIO = 2;
const BONUS = 20;

export default createAbility({
  id: AbilityId.Crab,
  name: 'Crab',
  image: '',
  aspects: [Aspect.Attack, Aspect.Armor],
  cooldown: 6000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Armor)} equal to twice your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, () => {
      unit.addEnergy(
        Energy.Armor,
        unit.getTotalEnergy(Energy.Attack) * ATTACK_RATIO + BONUS,
        false,
      );
    });
  },
});
