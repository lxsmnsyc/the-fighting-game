import type { AleaRNG } from './alea';
import type { Game } from './game';
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

  if (multiplier[Print.Signed] > rng.random()) {
    print |= Print.Signed;
  }
  return print;
}

export interface Card {
  id: number;

  name: string;

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

export class CardInstance {
  public edition: Edition;

  public print: number;

  public enabled = true;

  constructor(
    public owner: Player,
    public source: Card,
  ) {
    this.print = getRandomPrint(owner.rng, owner.printSpawnChance);
    this.edition = Edition.Common;
  }

  getMultiplier(): number {
    let mult = 1;

    if (this.print & Print.Error) {
      mult++;
    }
    if (this.print & Print.Monotone) {
      mult++;
    }
    if (this.print & Print.Negative) {
      mult++;
    }
    if (this.print & Print.Signed) {
      mult++;
    }

    return mult;
  }
}
