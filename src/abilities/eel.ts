import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

export default createAbility({
  id: AbilityId.Eel,
  name: 'Eel',
  image: '',
  aspects: [Aspect.Corrosion, Aspect.Magic],
  cooldown: 5000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Magic)} equal to the enemy's ${token.energy(Energy.Corrosion)}, then trigger your ${token.energy(Energy.Magic)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      unit.addEnergy(Energy.Magic, enemy.getTotalEnergy(Energy.Corrosion), false);
      unit.triggerEnergy(Energy.Magic, 0);
    });
  },
});
