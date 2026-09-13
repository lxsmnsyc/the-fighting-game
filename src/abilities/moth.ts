import { BattleEvents } from '../battle/events';
import { isMissedDamage } from '../battle/mechanics/damage';
import { DamagePriority, DamageType, Energy } from '../battle/types';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { createWindow, onTriggerAbility } from './effects';
import AbilityId from './ids';

const DURATION = 4000;
const DODGE_RATIO = 0.5;

export default createAbility({
  id: AbilityId.Moth,
  name: 'Moth',
  image: '',
  aspects: [Aspect.Magic, Aspect.Dodge],
  cooldown: 7000,
  description(): Description {
    return describe`Trigger your ${token.energy(Energy.Magic)}. For ${token.seconds(DURATION)}, gain ${token.energy(Energy.Dodge)} equal to ${token.percent(DODGE_RATIO)} of the ${token.damage(DamageType.Magical)} you deal.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    const window = createWindow(battle, DURATION);

    return new MergedLifecycle([
      window,
      // The window opens first, so the triggered Magic counts
      onTriggerAbility(context, () => {
        window.open();
        unit.triggerEnergy(Energy.Magic, 0);
      }),
      battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
        if (
          event.source === unit &&
          event.type === DamageType.Magical &&
          window.isOpen() &&
          !isMissedDamage(event.flags)
        ) {
          unit.addEnergy(Energy.Dodge, event.value * DODGE_RATIO, false);
        }
      }),
    ]);
  },
});
