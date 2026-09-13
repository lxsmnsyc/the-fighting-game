import CARDS from '../cards';
import type AleaRNG from '../core/alea';
import { rollCardInstance } from './card';
import { BOSS_BONUS_CARDS } from './constants';
import type Game from './game';
import { Player } from './player';
import { rollCard } from './pool';
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
 * The opponent for the current round, rolled from the round's battle
 * RNG. Its card count grows with the phase and the round, and bosses
 * get more.
 */
export default function createOpponent(game: Game, rng: AleaRNG): Opponent {
  const aspects = ASPECT_PAIRS[Math.floor(rng.random() * ASPECT_PAIRS.length)];
  const boss = game.isBossRound();
  const phase = game.getPhase();

  const opponent = new Opponent(aspects, boss);
  opponent.name = boss ? 'Boss' : 'Opponent';

  const matching = CARDS.filter((card) => card.aspect.some((aspect) => aspects.includes(aspect)));
  const pool = matching.length > 0 ? matching : CARDS;
  const count = phase + game.getPhaseRound() + (boss ? BOSS_BONUS_CARDS : 0);

  for (let i = 0; i < count; i++) {
    const card = rollCard(rng, pool, phase);
    if (card) {
      opponent.deck.push(rollCardInstance(opponent, card, rng));
    }
  }

  return opponent;
}
