import { Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const ARMOR = 40;

export default createAbility({
  id: AbilityId.Turtle,
  name: 'Turtle',
  image: '',
  aspects: [Aspect.Armor, Aspect.Healing],
  cooldown: 8000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Armor, ARMOR)}, then heal ${token.stat(Stat.Health)} equal to your ${token.energy(Energy.Armor)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, () => {
      unit.addEnergy(Energy.Armor, ARMOR, false);
      unit.heal(unit, unit.getTotalEnergy(Energy.Armor), 0);
    });
  },
});
