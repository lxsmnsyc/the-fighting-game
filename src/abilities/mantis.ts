import { BattleEvents } from '../battle/events';
import { DamageFlags, TriggerEnergyFlags } from '../battle/flags';
import { DamageType, Energy, ValuePriority } from '../battle/types';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { createWindow, onTriggerAbility, withCertainCritical } from './effects';
import AbilityId from './ids';

const DODGE = 30;
const DURATION = 3000;
const BONUS = 10;

export default createAbility({
  id: AbilityId.Mantis,
  name: 'Mantis',
  image: '',
  aspects: [Aspect.Critical, Aspect.Dodge],
  cooldown: 7000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Dodge, DODGE)}. For ${token.seconds(DURATION)}, strike back at every natural attack you dodge for ${token.damage(DamageType.Physical)} equal to your ${token.energy(Energy.Attack)} plus ${token.value(BONUS)}, as a critical hit.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    const window = createWindow(battle, DURATION);

    return new MergedLifecycle([
      window,
      onTriggerAbility(context, () => {
        unit.addEnergy(Energy.Dodge, DODGE, false);
        window.open();
      }),
      // Strikes back are not natural attacks, so two of these can never
      // strike back at each other forever
      battle.on(BattleEvents.UnitDodge, ValuePriority.Post, (event) => {
        const attacker = event.parent.source;
        if (
          event.source !== unit ||
          !window.isOpen() ||
          (event.flags & TriggerEnergyFlags.Failed) !== 0 ||
          (event.parent.flags & DamageFlags.Natural) === 0 ||
          !attacker.alive
        ) {
          return;
        }
        withCertainCritical(battle, unit, () => {
          unit.attack(attacker, unit.getTotalEnergy(Energy.Attack) + BONUS, 0);
        });
      }),
    ]);
  },
});
