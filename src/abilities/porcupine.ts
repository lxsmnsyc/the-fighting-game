import { BattleEvents } from '../battle/events';
import { TriggerEnergyFlags } from '../battle/flags';
import { Energy, ValuePriority } from '../battle/types';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { createWindow, onTriggerAbility } from './effects';
import AbilityId from './ids';

const ARMOR = 30;
const DURATION = 4000;
const SLOW = 15;

export default createAbility({
  id: AbilityId.Porcupine,
  name: 'Porcupine',
  image: '',
  aspects: [Aspect.Armor, Aspect.Slow],
  cooldown: 7000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Armor, ARMOR)}. For ${token.seconds(DURATION)}, give ${token.energy(Energy.Slow, SLOW)} to anyone whose damage your ${token.energy(Energy.Armor)} blocks.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    const window = createWindow(battle, DURATION);

    return new MergedLifecycle([
      window,
      onTriggerAbility(context, () => {
        unit.addEnergy(Energy.Armor, ARMOR, false);
        window.open();
      }),
      battle.on(BattleEvents.UnitArmor, ValuePriority.Post, (event) => {
        const attacker = event.parent.source;
        if (
          event.source === unit &&
          window.isOpen() &&
          (event.flags & TriggerEnergyFlags.Failed) === 0 &&
          event.value > 0 &&
          attacker !== unit &&
          attacker.alive
        ) {
          attacker.addEnergy(Energy.Slow, SLOW, false);
        }
      }),
    ]);
  },
});
