import { TriggerEnergyFlags } from '../battle/flags';
import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

export default createAbility({
  id: AbilityId.Stonefish,
  name: 'Stonefish',
  image: '',
  aspects: [Aspect.Poison, Aspect.Slow],
  cooldown: 6000,
  description(): Description {
    return describe`Trigger the enemy's ${token.energy(Energy.Poison)} without spending it, then give it ${token.energy(Energy.Slow)} equal to its ${token.energy(Energy.Poison)}.`;
  },
  setup(context): Lifecycle {
    return onTriggerAbility(context, (enemy) => {
      enemy.triggerEnergy(Energy.Poison, TriggerEnergyFlags.NoConsume);
      if (enemy.alive) {
        enemy.addEnergy(Energy.Slow, enemy.getTotalEnergy(Energy.Poison), false);
      }
    });
  },
});
