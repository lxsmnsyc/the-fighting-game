import { Energy } from '../battle/types';
import type { Lifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { measureDamage, onTriggerAbility } from './effects';
import AbilityId from './ids';

export default createAbility({
  id: AbilityId.Squid,
  name: 'Squid',
  image: '',
  aspects: [Aspect.Magic, Aspect.Slow],
  cooldown: 6000,
  description(): Description {
    return describe`Trigger your ${token.energy(Energy.Magic)}, then give the enemy ${token.energy(Energy.Slow)} equal to the damage dealt.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    return onTriggerAbility(context, (enemy) => {
      const report = measureDamage(battle, unit, () => {
        unit.triggerEnergy(Energy.Magic, 0);
      });
      if (enemy.alive) {
        enemy.addEnergy(Energy.Slow, report.damage, false);
      }
    });
  },
});
