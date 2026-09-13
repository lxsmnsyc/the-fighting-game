import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const SPEED = 20;
const POISON_RATIO = 0.5;

export default createAbility({
  id: AbilityId.Viper,
  name: 'Viper',
  image: '',
  aspects: [Aspect.Poison, Aspect.Speed],
  cooldown: 4000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Speed, SPEED)}, then give the enemy ${token.energy(Energy.Poison)} equal to ${token.percent(POISON_RATIO)} of your ${token.energy(Energy.Speed)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      unit.addEnergy(Energy.Speed, SPEED, false);
      enemy.addEnergy(Energy.Poison, unit.getTotalEnergy(Energy.Speed) * POISON_RATIO, false);
    });
  },
});
