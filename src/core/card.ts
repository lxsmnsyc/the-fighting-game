import { AleaRNG } from './alea';
import type { Game } from './game';
import { lerp } from './lerp';
import type { Player } from './player';
import {
  type Aspect,
  Edition,
  Print,
  type PrintSpawnChance,
  type Rarity,
} from './types';

export interface CardContext {
  game: Game;
  card: CardInstance;
}

export function getRandomPrint(
  rng: AleaRNG,
  multiplier: PrintSpawnChance,
): number {
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

export interface Card {
  id: number;

  name: string;

  image: string;

  rarity: Rarity;

  aspect: Aspect[];

  load(context: CardContext): void;
}

let ID = 0;

export function createCard(card: Omit<Card, 'id'>): Card {
  return Object.assign({}, card, { id: ID++ });
}

export interface BaseCardEvent {
  id: string;
}

export interface TriggerCardEvent extends BaseCardEvent {
  data: unknown;
}

const MIN_ERROR_VALUE = 0.75;
const MAX_ERROR_VALUE = 1.25;

export class CardInstance {
  public edition: Edition;

  public print: number;

  public disabled = false;

  public rng: AleaRNG;

  constructor(
    public owner: Player,
    public source: Card,
  ) {
    this.rng = new AleaRNG(owner.rng.card.int32().toString());
    this.print = getRandomPrint(this.rng, owner.printSpawnChance);
    this.edition = Edition.Common;
  }

  getValue(value: number): number {
    let result = value;

    if (this.print & Print.Error) {
      result = lerp(value * MIN_ERROR_VALUE, value * MAX_ERROR_VALUE, Math.random());
    }
    if (this.print & Print.Monotone) {
      result *= 2;
    }

    return result;
  }
}
