import { BattleEvents } from '../battle/events';
import { TriggerEnergyFlags } from '../battle/flags';
import { Energy, ValuePriority } from '../battle/types';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { createWindow, onTriggerAbility } from './effects';
import AbilityId from './ids';

const DODGE = 30;
const DURATION = 3000;
const SPEED = 20;
const CHARGE = 500;

export default createAbility({
  id: AbilityId.Gazelle,
  name: 'Gazelle',
  image: '',
  aspects: [Aspect.Dodge, Aspect.Speed],
  cooldown: 6000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Dodge, DODGE)}. For ${token.seconds(DURATION)}, whenever you dodge an attack, gain ${token.energy(Energy.Speed, SPEED)} and your other abilities charge by ${token.seconds(CHARGE)}.`;
  },
  setup(context): Lifecycle {
    const { battle, unit, ability } = context;
    const window = createWindow(battle, DURATION);

    return new MergedLifecycle([
      window,
      onTriggerAbility(context, () => {
        unit.addEnergy(Energy.Dodge, DODGE, false);
        window.open();
      }),
      battle.on(BattleEvents.UnitDodge, ValuePriority.Post, (event) => {
        if (
          event.source !== unit ||
          !window.isOpen() ||
          (event.flags & TriggerEnergyFlags.Failed) !== 0
        ) {
          return;
        }
        unit.addEnergy(Energy.Speed, SPEED, false);
        for (const other of Array.from(unit.abilities.keys())) {
          if (other !== ability) {
            unit.chargeAbility(other, CHARGE);
          }
        }
      }),
    ]);
  },
});
