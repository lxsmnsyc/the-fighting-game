import { BattleEvents } from '../../battle/events';
import { AttackFlags } from '../../battle/flags';
import { DamageType, ValuePriority } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { applyPrint, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import CardId from '../ids';

const DEFAULT_CHANCE = 0.25;
const DEFAULT_MULTIPLIER = 1.0;

export default createCard({
  id: CardId.Relentless,
  name: 'Relentless',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Attack],
  description(print): Description {
    return describe`Natural attacks have a ${token.percent(DEFAULT_CHANCE)} chance to attack again for ${token.percent(applyPrint(DEFAULT_MULTIPLIER, print))} of their ${token.damage(DamageType.Physical)}.`;
  },
  setup({ battle, unit, card }): Lifecycle {
    return new MergedLifecycle([
      battle.on(BattleEvents.UnitAttack, ValuePriority.Post, (event) => {
        if (
          event.source !== unit ||
          (event.flags & (AttackFlags.Natural | AttackFlags.Tick)) === 0
        ) {
          return;
        }
        // TODO use PRD
        if (unit.rng.random() <= DEFAULT_CHANCE) {
          unit.triggerCard(
            card,
            event.target,
            event.value * card.getValue(DEFAULT_MULTIPLIER, unit.rng),
          );
        }
      }),
      // Does not consume energy
      battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
        if (event.card === card) {
          unit.attack(event.target, event.value, AttackFlags.Natural);
        }
      }),
    ]);
  },
});
