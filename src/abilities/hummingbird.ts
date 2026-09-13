import { Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const SPEED = 10;

export default createAbility({
  id: AbilityId.Hummingbird,
  name: 'Hummingbird',
  image: '',
  aspects: [Aspect.Speed, Aspect.Healing],
  cooldown: 3000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Speed, SPEED)}, then heal ${token.stat(Stat.Health)} equal to your ${token.energy(Energy.Speed)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, () => {
      unit.addEnergy(Energy.Speed, SPEED, false);
      unit.heal(unit, unit.getTotalEnergy(Energy.Speed), 0);
    });
  },
});
