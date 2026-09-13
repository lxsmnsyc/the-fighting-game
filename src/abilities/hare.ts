import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const SPEED = 10;
const CHARGE = 1000;

export default createAbility({
  id: AbilityId.Hare,
  name: 'Hare',
  image: '',
  aspects: [Aspect.Speed, Aspect.Dodge],
  cooldown: 5000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Speed, SPEED)}, then gain ${token.energy(Energy.Dodge)} equal to your ${token.energy(Energy.Speed)}. Your other abilities charge by ${token.seconds(CHARGE)}.`;
  },
  setup(context): Lifecycle {
    const { unit, ability } = context;
    return onTriggerAbility(context, () => {
      unit.addEnergy(Energy.Speed, SPEED, false);
      unit.addEnergy(Energy.Dodge, unit.getTotalEnergy(Energy.Speed), false);
      for (const other of Array.from(unit.abilities.keys())) {
        if (other !== ability) {
          unit.chargeAbility(other, CHARGE);
        }
      }
    });
  },
});
