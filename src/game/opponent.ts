import ABILITIES from '../abilities';
import CARDS from '../cards';
import type CardId from '../cards/ids';
import type AleaRNG from '../core/alea';
import { AbilityInstance, getAbilityBias } from './ability';
import { type Card, rollCardInstance } from './card';
import { BOSS_BUDGET_MULTIPLIER, CARD_PRICES, COPY_LIMITS } from './constants';
import { getRoundBudget } from './economy';
import type Game from './game';
import { Player } from './player';
import { rollAbilities, rollCard } from './pool';
import { Aspect } from './types';

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
 * Cards in `pool` that fit in `budget` and are under their copy limit.
 */
function getAffordableCards(pool: Card[], budget: number, copies: Map<CardId, number>): Card[] {
  return pool.filter(
    (card) =>
      CARD_PRICES[card.rarity] <= budget && (copies.get(card.id) ?? 0) < COPY_LIMITS[card.rarity],
  );
}

/**
 * The opponent for the current round, rolled from the round's battle
 * RNG.
 *
 * It buys cards like a player would. Its budget is all the gold a player
 * could have by this round, so it keeps up with the run. It spends it on
 * cards of its aspects first, then on any card, within the same copy
 * limits as the player.
 *
 * A boss gets a bigger budget, and as many abilities as the player is
 * due. Its first ability decides its aspects, and all of them bias its
 * cards.
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

  let budget = Math.floor(getRoundBudget(game.round) * (boss ? BOSS_BUDGET_MULTIPLIER : 1));
  const copies = new Map<CardId, number>();
  const getWeight = (card: Card): number => 1 + getAbilityBias(abilities, card);
  const matching = CARDS.filter((card) => card.aspect.some((aspect) => aspects.includes(aspect)));

  for (const pool of [matching, CARDS]) {
    for (;;) {
      const card = rollCard(rng, getAffordableCards(pool, budget, copies), phase, getWeight);
      if (!card) {
        break;
      }
      budget -= CARD_PRICES[card.rarity];
      copies.set(card.id, (copies.get(card.id) ?? 0) + 1);
      opponent.deck.push(rollCardInstance(opponent, card, rng));
    }
  }

  return opponent;
}
