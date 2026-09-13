import { BattleEvents, type UnitActionEvent } from '../../battle/events';
import { AttackFlags } from '../../battle/flags';
import { DamageType, ValuePriority } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { applyPrint, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import CardId from '../ids';

const DEFAULT_MULTIPLIER = 0.5;

export default createCard({
  id: CardId.Ambidextrous,
  name: 'Ambidextrous',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Attack],
  description(print): Description {
    return describe`Natural attacks deal ${token.percent(applyPrint(DEFAULT_MULTIPLIER, print))} of their ${token.damage(DamageType.Physical)}, then repeat at once.`;
  },
  setup({ battle, unit, card }): Lifecycle {
    const isNaturalAttack = (event: UnitActionEvent): boolean =>
      event.source === unit && (event.flags & AttackFlags.Natural) !== 0;

    return new MergedLifecycle([
      // Halve the attack, unless it is this card's own repeat
      battle.on(BattleEvents.UnitAttack, ValuePriority.Pre, (event) => {
        if (isNaturalAttack(event) && !battle.triggeringCards.has(card.source.id)) {
          event.value *= card.getValue(DEFAULT_MULTIPLIER, unit.rng);
        }
      }),
      battle.on(BattleEvents.UnitAttack, ValuePriority.Post, (event) => {
        if (isNaturalAttack(event)) {
          unit.triggerCard(card, event.target, event.value);
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
