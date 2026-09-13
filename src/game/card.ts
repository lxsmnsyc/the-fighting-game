import type Battle from '../battle/core';
import type Unit from '../battle/unit';
import type CardId from '../cards/ids';
import type AleaRNG from '../core/alea';
import lerp from '../core/lerp';
import type { Lifecycle } from '../core/lifecycle';
import type { Description, ValueRange } from './description';
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
   *
   * Values that go through `getValue` in battle are shown as `print`
   * changes them, with `applyPrint`. Pass 0 for a card with no print.
   */
  description(print: number): Description;

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

export const MIN_ERROR_VALUE = 0.75;
export const MAX_ERROR_VALUE = 1.25;
export const MONOTONE_MULTIPLIER = 2;

/**
 * The values a card value can take under `print`. An Error print makes
 * it a range, and a Monotone print multiplies it.
 */
export function applyPrint(value: number, print: number): ValueRange {
  let min = value;
  let max = value;

  if (print & Print.Error) {
    min = value * MIN_ERROR_VALUE;
    max = value * MAX_ERROR_VALUE;
  }
  if (print & Print.Monotone) {
    min *= MONOTONE_MULTIPLIER;
    max *= MONOTONE_MULTIPLIER;
  }

  return { min, max };
}

/**
 * One copy of a card. It holds no RNG: its print is rolled once when it
 * is created, so saving its fields is enough to restore it.
 */
export class CardInstance {
  /**
   * Whether the card is out of play for the run, such as after being
   * sold.
   */
  disabled = false;

  constructor(
    readonly owner: Player,
    readonly source: Card,
    readonly print = 0,
    readonly edition = Edition.Common,
  ) {
    // no-op
  }

  /**
   * A value from the card's effect, adjusted by its print. An Error
   * print rolls the value again on every use, so pass an RNG from the
   * battle, such as the unit's.
   */
  getValue(value: number, rng: AleaRNG): number {
    const { min, max } = applyPrint(value, this.print);
    return this.print & Print.Error ? lerp(min, max, rng.random()) : min;
  }
}

/**
 * A new copy of a card, with its print rolled.
 */
export function rollCardInstance(owner: Player, source: Card, rng: AleaRNG): CardInstance {
  return new CardInstance(owner, source, getRandomPrint(rng, owner.printSpawnChance));
}
