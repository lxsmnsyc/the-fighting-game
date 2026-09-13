import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 10;

export default createAbility({
  id: AbilityId.Cobra,
  name: 'Cobra',
  image: '',
  aspects: [Aspect.Poison, Aspect.Speed],
  cooldown: 5000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Speed)} equal to the enemy's ${token.energy(Energy.Poison)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      unit.addEnergy(Energy.Speed, enemy.getTotalEnergy(Energy.Poison) + BONUS, false);
    });
  },
});
