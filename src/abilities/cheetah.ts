import { Energy } from '../battle/types';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { createWindow, onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 50;
const DURATION = 3000;

export default createAbility({
  id: AbilityId.Cheetah,
  name: 'Cheetah',
  image: '',
  aspects: [Aspect.Speed, Aspect.Critical],
  cooldown: 8000,
  description(): Description {
    return describe`For ${token.seconds(DURATION)}, gain permanent ${token.energy(Energy.Speed)} equal to your ${token.energy(Energy.Critical)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    // The Speed this ability granted, taken back when the window closes
    let granted = 0;

    const takeBack = (): void => {
      unit.removeEnergy(Energy.Speed, granted, true);
      granted = 0;
    };
    const window = createWindow(battle, DURATION, takeBack);

    return new MergedLifecycle([
      window,
      onTriggerAbility(context, () => {
        takeBack();
        granted = (unit.getTotalEnergy(Energy.Critical) + BONUS) | 0;
        unit.addEnergy(Energy.Speed, granted, true);
        window.open();
      }),
    ]);
  },
});
