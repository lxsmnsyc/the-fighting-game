import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 10;

export default createAbility({
  id: AbilityId.Otter,
  name: 'Otter',
  image: '',
  aspects: [Aspect.Healing, Aspect.Speed],
  cooldown: 4000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Speed)} equal to your ${token.energy(Energy.Healing)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, () => {
      unit.addEnergy(Energy.Speed, unit.getTotalEnergy(Energy.Healing) + BONUS, false);
    });
  },
});
