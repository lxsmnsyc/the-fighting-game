import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const MAGIC = 20;

export default createAbility({
  id: AbilityId.Jellyfish,
  name: 'Jellyfish',
  image: '',
  aspects: [Aspect.Magic, Aspect.Corrosion],
  cooldown: 5000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Magic, MAGIC)} and give the enemy ${token.energy(Energy.Corrosion)} equal to your ${token.energy(Energy.Magic)}, then trigger your ${token.energy(Energy.Magic)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    // Corrosion lands first, so the Magic hits harder
    return onTriggerAbility(context, (enemy) => {
      unit.addEnergy(Energy.Magic, MAGIC, false);
      enemy.addEnergy(Energy.Corrosion, unit.getTotalEnergy(Energy.Magic), false);
      unit.triggerEnergy(Energy.Magic, 0);
    });
  },
});
