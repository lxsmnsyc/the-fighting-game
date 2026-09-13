import type Battle from '../battle/core';
import type Unit from '../battle/unit';
import type CardId from '../cards/ids';
import AleaRNG from '../core/alea';
import lerp from '../core/lerp';
import type { Lifecycle } from '../core/lifecycle';
import type { Description } from './description';
import type { Player } from './player';
import { type Aspect, Edition, Print, type PrintSpawnChance, type Rarity } from './types';

export interface CardContext {
  battle: Battle;
  unit: Unit;
  card: CardInstance;
}

export interface Card {
  /**
   * Fixed for good. See `CardId`.
   */
  id: CardId;

  /**
   * One word, a verb or an adjective, that says what the card does.
   */
  name: string;

  image: string;

  rarity: Rarity;

  aspect: Aspect[];

  /**
   * What the card does, with its raw values, energies, stats and damage
   * types as tokens a UI can highlight.
   */
  description(): Description;

  /**
   * Registers the card's listeners for one unit in one battle. The
   * card mechanics start the returned lifecycle, and stop it while the
   * card is disabled.
   *
   * An effect that emits events must run on `UnitTriggerCard`, so the
   * card cannot be triggered again by what it sets off.
   */
  setup(context: CardContext): Lifecycle;
}

/**
 * Types a card literal, so `setup` and `description` get their context.
 */
export function createCard(card: Card): Card {
  return card;
}

export function getRandomPrint(rng: AleaRNG, multiplier: PrintSpawnChance): number {
  let print = 0;

  if (multiplier[Print.Error] > rng.random()) {
    print |= Print.Error;
  }

  if (multiplier[Print.Monotone] > rng.random()) {
    print |= Print.Monotone;
  }

  if (multiplier[Print.Negative] > rng.random()) {
    print |= Print.Negative;
  }

  return print;
}

const MIN_ERROR_VALUE = 0.75;
const MAX_ERROR_VALUE = 1.25;

export class CardInstance {
  readonly edition: Edition;

  readonly print: number;

  /**
   * Whether the card is out of play for the run, such as after being
   * sold.
   */
  disabled = false;

  readonly rng: AleaRNG;

  constructor(
    readonly owner: Player,
    readonly source: Card,
  ) {
    this.rng = new AleaRNG(owner.rng.card.int32().toString());
    this.print = getRandomPrint(this.rng, owner.printSpawnChance);
    this.edition = Edition.Common;
  }

  /**
   * A value from the card's effect, adjusted by its print.
   */
  getValue(value: number): number {
    let result = value;

    if (this.print & Print.Error) {
      result = lerp(value * MIN_ERROR_VALUE, value * MAX_ERROR_VALUE, this.rng.random());
    }
    if (this.print & Print.Monotone) {
      result *= 2;
    }

    return result;
  }
}
