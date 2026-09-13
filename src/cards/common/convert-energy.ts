import { SELF_STACK } from '../../battle/constants';
import { BattleEvents } from '../../battle/events';
import { Energy, ValuePriority } from '../../battle/types';
import type Unit from '../../battle/unit';
import { type Lifecycle, MergedLifecycle } from '../../core/lifecycle';
import { type Card, applyPrint, createCard } from '../../game/card';
import { type Description, describe, token } from '../../game/description';
import { Aspect, Rarity } from '../../game/types';
import { addEnergyOnTrigger } from '../effects';
import CardId from '../ids';

// Share of the gained energy handed out as the other energy
const DEFAULT_RATIO = 0.5;

interface ConvertEnergyCardOptions {
  id: CardId;
  name: string;
  /**
   * The energy whose gains set the card off. Energy that stacks on its
   * owner counts when the unit gains it, and the rest when an enemy
   * does.
   */
  from: Energy;
  /**
   * The energy handed out.
   */
  to: Energy;
  aspect: Aspect[];
  image?: string;
}

/**
 * Whenever energy of one kind is gained, hands out a share of it as
 * another kind.
 */
function createConvertEnergyCard({
  id,
  name,
  from,
  to,
  aspect,
  image = '',
}: ConvertEnergyCardOptions): Card {
  const enemyGains = !SELF_STACK[from];

  return createCard({
    id,
    name,
    image,
    rarity: Rarity.Uncommon,
    aspect,
    description(print): Description {
      const when = enemyGains
        ? describe`Whenever an enemy gains ${token.energy(from)}`
        : describe`Whenever you gain ${token.energy(from)}`;
      const receiver = enemyGains ? 'that enemy' : 'a random enemy';
      const grant = SELF_STACK[to]
        ? describe`gain ${token.energy(to)}`
        : describe`give ${receiver} ${token.energy(to)}`;
      return describe`${when}, ${grant} equal to ${token.percent(applyPrint(DEFAULT_RATIO, print))} of it.`;
    },
    setup({ battle, unit, card }): Lifecycle {
      const getReceiver = (gainer: Unit): Unit | undefined => {
        if (SELF_STACK[to]) {
          return unit;
        }
        return enemyGains ? gainer : unit.checkEnemy();
      };

      return new MergedLifecycle([
        battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Post, (event) => {
          if (event.energy !== from || event.permanent || event.value <= 0) {
            return;
          }
          const gainer = event.source;
          const counts = enemyGains ? gainer.team.alliance !== unit.team.alliance : gainer === unit;
          if (!counts) {
            return;
          }
          const receiver = getReceiver(gainer);
          if (receiver?.alive === true) {
            unit.triggerCard(card, receiver, event.value * card.getValue(DEFAULT_RATIO, unit.rng));
          }
        }),
        addEnergyOnTrigger(battle, card, to),
      ]);
    },
  });
}

const CONVERT_ENERGY_CARDS: Card[] = [
  createConvertEnergyCard({
    id: CardId.Restorative,
    name: 'Restorative',
    from: Energy.Armor,
    to: Energy.Healing,
    aspect: [Aspect.Armor, Aspect.Healing],
  }),
  createConvertEnergyCard({
    id: CardId.Hardy,
    name: 'Hardy',
    from: Energy.Healing,
    to: Energy.Armor,
    aspect: [Aspect.Healing, Aspect.Armor],
  }),
  createConvertEnergyCard({
    id: CardId.Fleeting,
    name: 'Fleeting',
    from: Energy.Speed,
    to: Energy.Dodge,
    aspect: [Aspect.Speed, Aspect.Dodge],
  }),
  createConvertEnergyCard({
    id: CardId.Bounding,
    name: 'Bounding',
    from: Energy.Dodge,
    to: Energy.Speed,
    aspect: [Aspect.Dodge, Aspect.Speed],
  }),
  createConvertEnergyCard({
    id: CardId.Brutal,
    name: 'Brutal',
    from: Energy.Critical,
    to: Energy.Attack,
    aspect: [Aspect.Critical, Aspect.Attack],
  }),
  createConvertEnergyCard({
    id: CardId.Mystic,
    name: 'Mystic',
    from: Energy.Magic,
    to: Energy.Critical,
    aspect: [Aspect.Magic, Aspect.Critical],
  }),
  // Energy an enemy gains, whoever gave it
  createConvertEnergyCard({
    id: CardId.Venomous,
    name: 'Venomous',
    from: Energy.Poison,
    to: Energy.Magic,
    aspect: [Aspect.Poison, Aspect.Magic],
  }),
  createConvertEnergyCard({
    id: CardId.Brittle,
    name: 'Brittle',
    from: Energy.Slow,
    to: Energy.Corrosion,
    aspect: [Aspect.Slow, Aspect.Corrosion],
  }),
];

export default CONVERT_ENERGY_CARDS;
