import { BattleEvents } from '../../battle/events';
import { TriggerEnergyFlags } from '../../battle/flags';
import { DamageType, Energy, ValuePriority } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { applyPrint, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import CardId from '../ids';

const DEFAULT_CHANCE = 0.5;
const DEFAULT_MULTIPLIER = 1;

export default createCard({
  id: CardId.Riposte,
  name: 'Riposte',
  image: '',
  rarity: Rarity.Rare,
  aspect: [Aspect.Dodge],
  description(print): Description {
    return describe`When you dodge an attack with ${token.energy(Energy.Dodge)}, ${token.percent(DEFAULT_CHANCE)} chance to deal ${token.percent(applyPrint(DEFAULT_MULTIPLIER, print))} of the dodged damage back to the attacker, as the same damage type.`;
  },
  setup({ battle, unit, card }): Lifecycle {
    // The type of the damage being returned. Set right before the
    // trigger, and the chain rule keeps it from changing while it
    // resolves.
    let type = DamageType.Physical;

    return new MergedLifecycle([
      battle.on(BattleEvents.UnitDodge, ValuePriority.Post, (event) => {
        const { parent } = event;
        const attacker = parent.source;
        if (
          event.source !== unit ||
          (event.flags & TriggerEnergyFlags.Failed) !== 0 ||
          attacker === unit ||
          !attacker.alive ||
          // TODO PRD
          unit.rng.random() >= DEFAULT_CHANCE
        ) {
          return;
        }
        type = parent.type;
        unit.triggerCard(
          card,
          attacker,
          parent.value * card.getValue(DEFAULT_MULTIPLIER, unit.rng),
        );
      }),
      // Not an attack, so it cannot be dodged or returned in turn
      battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
        if (event.card === card) {
          unit.dealDamage(event.target, type, event.value, 0);
        }
      }),
    ]);
  },
});
