import ABILITIES from '../abilities';
import CARDS from '../cards';
import type AleaRNG from '../core/alea';
import { AbilityInstance, getAbilityBias } from './ability';
import { rollCardInstance } from './card';
import { BOSS_BONUS_CARDS } from './constants';
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
 * The opponent for the current round, rolled from the round's battle
 * RNG. Its card count grows with the phase and the round.
 *
 * A boss gets more cards, and as many abilities as the player is due.
 * Its first ability decides its aspects, and all of them bias its cards.
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

  const matching = CARDS.filter((card) => card.aspect.some((aspect) => aspects.includes(aspect)));
  const pool = matching.length > 0 ? matching : CARDS;
  const count = phase + game.getPhaseRound() + (boss ? BOSS_BONUS_CARDS : 0);

  for (let i = 0; i < count; i++) {
    const card = rollCard(rng, pool, phase, (current) => 1 + getAbilityBias(abilities, current));
    if (card) {
      opponent.deck.push(rollCardInstance(opponent, card, rng));
    }
  }

  return opponent;
}
