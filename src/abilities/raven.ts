import { TriggerEnergyFlags } from '../battle/flags';
import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const CRITICAL_RATIO = 0.2;
const BONUS = 10;

export default createAbility({
  id: AbilityId.Raven,
  name: 'Raven',
  image: '',
  aspects: [Aspect.Critical, Aspect.Magic],
  cooldown: 6000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Magic)} equal to ${token.percent(CRITICAL_RATIO)} of your ${token.energy(Energy.Critical)} plus ${token.value(BONUS)}, then trigger your ${token.energy(Energy.Magic)} without spending it.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, () => {
      const magic = unit.getTotalEnergy(Energy.Critical) * CRITICAL_RATIO + BONUS;
      unit.addEnergy(Energy.Magic, magic, false);
      unit.triggerEnergy(Energy.Magic, TriggerEnergyFlags.NoConsume);
    });
  },
});
