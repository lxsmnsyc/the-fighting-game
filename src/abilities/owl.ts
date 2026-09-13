import { TriggerEnergyFlags } from '../battle/flags';
import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { measureDamage, onTriggerAbility } from './effects';
import AbilityId from './ids';

const MAGIC = 15;

export default createAbility({
  id: AbilityId.Owl,
  name: 'Owl',
  image: '',
  aspects: [Aspect.Magic, Aspect.Critical],
  cooldown: 5000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Magic, MAGIC)}, then trigger your ${token.energy(Energy.Magic)} without spending it. Gain ${token.energy(Energy.Critical)} equal to the damage dealt.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    return onTriggerAbility(context, () => {
      unit.addEnergy(Energy.Magic, MAGIC, false);
      const report = measureDamage(battle, unit, () => {
        unit.triggerEnergy(Energy.Magic, TriggerEnergyFlags.NoConsume);
      });
      unit.addEnergy(Energy.Critical, report.damage, false);
    });
  },
});
