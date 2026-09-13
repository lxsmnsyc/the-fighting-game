import { BattleEvents } from '../battle/events';
import { TriggerEnergyFlags } from '../battle/flags';
import { Energy, ValuePriority } from '../battle/types';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { createWindow, onTriggerAbility } from './effects';
import AbilityId from './ids';

const DODGE = 50;
const DURATION = 3000;

export default createAbility({
  id: AbilityId.Chameleon,
  name: 'Chameleon',
  image: '',
  aspects: [Aspect.Dodge, Aspect.Magic],
  cooldown: 6000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Dodge, DODGE)}. For ${token.seconds(DURATION)}, trigger your ${token.energy(Energy.Magic)} whenever you dodge an attack.`;
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
      battle.on(BattleEvents.UnitDodge, ValuePriority.Post, (event) => {
        if (
          event.source === unit &&
          window.isOpen() &&
          (event.flags & TriggerEnergyFlags.Failed) === 0
        ) {
          unit.triggerEnergy(Energy.Magic, 0);
        }
      }),
    ]);
  },
});
