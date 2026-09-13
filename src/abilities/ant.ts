import { BattleEvents } from '../battle/events';
import { DamageFlags } from '../battle/flags';
import { isMissedDamage } from '../battle/mechanics/damage';
import { DamagePriority, Energy } from '../battle/types';
import { type Lifecycle, MergedLifecycle } from '../core/lifecycle';
import { createAbility } from '../game/ability';
import { type Description, describe, token } from '../game/description';
import { Aspect } from '../game/types';
import { createWindow, onTriggerAbility } from './effects';
import AbilityId from './ids';

const ATTACK = 10;
const DURATION = 4000;
const CORROSION_RATIO = 0.5;

export default createAbility({
  id: AbilityId.Ant,
  name: 'Ant',
  image: '',
  aspects: [Aspect.Attack, Aspect.Corrosion],
  cooldown: 7000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Attack, ATTACK)}. For ${token.seconds(DURATION)}, your attacks give the enemy ${token.energy(Energy.Corrosion)} equal to ${token.percent(CORROSION_RATIO)} of the damage dealt.`;
  },
  setup(context): Lifecycle {
    const { battle, unit } = context;
    const window = createWindow(battle, DURATION);

    return new MergedLifecycle([
      window,
      onTriggerAbility(context, () => {
        unit.addEnergy(Energy.Attack, ATTACK, false);
        window.open();
      }),
      battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
        if (
          event.source === unit &&
          window.isOpen() &&
          (event.flags & DamageFlags.Attack) !== 0 &&
          !isMissedDamage(event.flags) &&
          event.target.alive
        ) {
          event.target.addEnergy(Energy.Corrosion, event.value * CORROSION_RATIO, false);
        }
      }),
    ]);
  },
});
