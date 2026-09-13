import ABILITIES from '../abilities';
import CARDS from '../cards';
import type CardId from '../cards/ids';
import type AleaRNG from '../core/alea';
import { AbilityInstance, getAbilityBias } from './ability';
import { type Card, CardInstance, getRandomPrint } from './card';
import { BOSS_BUDGET_MULTIPLIER, CARD_PRICES } from './constants';
import { getCardSlots, getRoundBudget } from './economy';
import type Game from './game';
import { Player } from './player';
import { isUnderCopyLimit, rollAbilities, rollCard } from './pool';
import { Aspect, Print } from './types';

const ASPECTS: Aspect[] = [
  Aspect.Health,
  Aspect.Attack,
  Aspect.Magic,
  Aspect.Poison,
  Aspect.Armor,
  Aspect.Corrosion,
  Aspect.Speed,
  Aspect.Slow,
  Aspect.Dodge,
  Aspect.Critical,
  Aspect.Healing,
];

// Every pair of two different aspects
const ASPECT_PAIRS: [Aspect, Aspect][] = ASPECTS.flatMap((first, index) =>
  ASPECTS.slice(index + 1).map((second): [Aspect, Aspect] => [first, second]),
);

/**
 * A generated player the run's player fights. Its cards come from its
 * two aspects.
 */
export class Opponent extends Player {
  constructor(
    readonly aspects: [Aspect, Aspect],
    readonly boss: boolean,
  ) {
    super();
  }
}

/**
 * Whether every aspect of `card` is one of `aspects`. Universal cards
 * fit any aspects.
 */
export function isAffiliatedCard(card: Card, aspects: Aspect[]): boolean {
  return card.aspect.every((aspect) => aspect === Aspect.Universal || aspects.includes(aspect));
}

/**
 * Cards in `pool` that fit in `budget` and, as a copy with `print`,
 * under their copy limit.
 */
function getAffordableCards(
  pool: Card[],
  budget: number,
  print: number,
  copies: Map<CardId, number>,
): Card[] {
  return pool.filter(
    (card) => CARD_PRICES[card.rarity] <= budget && isUnderCopyLimit(card, print, copies),
  );
}

// Negative copies do not count toward the copy limit
function countCopy(copies: Map<CardId, number>, card: CardInstance, change: number): void {
  if ((card.print & Print.Negative) === 0) {
    copies.set(card.source.id, (copies.get(card.source.id) ?? 0) + change);
  }
}

function getCheapestIndex(deck: CardInstance[]): number {
  let cheapest = -1;
  for (let index = 0; index < deck.length; index++) {
    const price = CARD_PRICES[deck[index].source.rarity];
    if (cheapest === -1 || price < CARD_PRICES[deck[cheapest].source.rarity]) {
      cheapest = index;
    }
  }
  return cheapest;
}

/**
 * The opponent for the current round, rolled from the round's battle
 * RNG.
 *
 * It builds its deck like a player would, with the same card slots and
 * copy limits. Its budget is all the gold a player could have by this
 * round, so it keeps up with the run:
 *
 * 1. It fills its slots with cards it can afford, cards of its aspects
 *    first.
 * 2. It spends what is left swapping its cheapest card for a pricier
 *    one, until no swap fits the budget.
 *
 * A boss gets a bigger budget, and as many abilities as the player is
 * due. Its first ability decides its aspects. It only takes cards whose
 * aspects all belong to its abilities, and all of them bias its cards.
 */
export default function createOpponent(game: Game, rng: AleaRNG): Opponent {
  const boss = game.isBossRound();
  const phase = game.getPhase();

  const abilities = boss ? rollAbilities(rng, ABILITIES, game.getAbilityCount()) : [];
  const aspects =
    abilities.at(0)?.aspects ?? ASPECT_PAIRS[Math.floor(rng.random() * ASPECT_PAIRS.length)];

  const opponent = new Opponent(aspects, boss);
  opponent.name = boss ? 'Boss' : 'Opponent';
  for (const ability of abilities) {
    opponent.abilities.push(new AbilityInstance(opponent, ability));
  }

  const { deck } = opponent;
  const slots = getCardSlots(phase);
  let budget = Math.floor(getRoundBudget(game.round) * (boss ? BOSS_BUDGET_MULTIPLIER : 1));
  const copies = new Map<CardId, number>();
  const getWeight = (card: Card): number => 1 + getAbilityBias(abilities, card);
  // A boss only takes cards of its abilities' aspects, even if it leaves
  // slots empty. Other opponents lean on their aspects, then take anything.
  const affiliated = abilities.flatMap((ability) => ability.aspects);
  const pools = boss
    ? [CARDS.filter((card) => isAffiliatedCard(card, affiliated))]
    : [CARDS.filter((card) => card.aspect.some((aspect) => aspects.includes(aspect))), CARDS];
  const printChances = game.checkPrintChances(opponent);

  for (const pool of pools) {
    while (deck.length < slots) {
      // The print comes first, since a Negative copy may go past the limit
      const print = getRandomPrint(rng, printChances);
      const card = rollCard(rng, getAffordableCards(pool, budget, print, copies), phase, getWeight);
      if (!card) {
        break;
      }
      budget -= CARD_PRICES[card.rarity];
      const copy = new CardInstance(opponent, card, print);
      countCopy(copies, copy, 1);
      deck.push(copy);
    }
  }

  // Every swap raises the deck's worth, so this always ends
  for (const pool of pools) {
    for (;;) {
      const index = getCheapestIndex(deck);
      if (index === -1) {
        break;
      }
      const weakest = deck[index];
      const refund = CARD_PRICES[weakest.source.rarity];
      const print = getRandomPrint(rng, printChances);

      countCopy(copies, weakest, -1);
      const upgrades = getAffordableCards(pool, budget + refund, print, copies).filter(
        (card) => CARD_PRICES[card.rarity] > refund,
      );
      const card = rollCard(rng, upgrades, phase, getWeight);
      if (!card) {
        countCopy(copies, weakest, 1);
        break;
      }

      budget += refund - CARD_PRICES[card.rarity];
      const copy = new CardInstance(opponent, card, print);
      countCopy(copies, copy, 1);
      deck[index] = copy;
    }
  }

  return opponent;
}
