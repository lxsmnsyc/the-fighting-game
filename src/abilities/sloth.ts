import { Energy, Stat } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { onTriggerAbility } from './effects';
import AbilityId from './ids';

const SLOW = 20;

export default createAbility({
  id: AbilityId.Sloth,
  name: 'Sloth',
  image: '',
  aspects: [Aspect.Slow, Aspect.Health],
  cooldown: 10_000,
  description(): Description {
    return describe`Give the enemy ${token.energy(Energy.Slow, SLOW)}, then gain ${token.stat(Stat.MaxHealth)} equal to its ${token.energy(Energy.Slow)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, (enemy) => {
      enemy.addEnergy(Energy.Slow, SLOW, false);
      unit.addStat(Stat.MaxHealth, enemy.getTotalEnergy(Energy.Slow));
    });
  },
});
