import { Energy } from '../battle/types';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { createWindow, onTriggerAbility } from './effects';
import AbilityId from './ids';

const BONUS = 100;
const DURATION = 3000;

export default createAbility({
  id: AbilityId.Falcon,
  name: 'Falcon',
  image: '',
  aspects: [Aspect.Speed, Aspect.Critical],
  cooldown: 8000,
  description(): Description {
    return describe`For ${token.seconds(DURATION)}, gain permanent ${token.energy(Energy.Critical)} equal to your ${token.energy(Energy.Speed)} plus ${token.value(BONUS)}.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    // The Critical this ability granted, taken back when the window closes
    let granted = 0;

    const takeBack = (): void => {
      unit.removeEnergy(Energy.Critical, granted, true);
      granted = 0;
    };
    const window = createWindow(battle, DURATION, takeBack);

    return new MergedLifecycle([
      window,
      onTriggerAbility(context, () => {
        takeBack();
        granted = (unit.getTotalEnergy(Energy.Speed) + BONUS) | 0;
        unit.addEnergy(Energy.Critical, granted, true);
        window.open();
      }),
    ]);
  },
});
