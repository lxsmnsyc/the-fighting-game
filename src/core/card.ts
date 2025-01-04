import type { AleaRNG } from './alea';
import type { Game } from './game';
import type { Player } from './player';
import { type Aspect, Edition, Print, type Rarity } from './types';

export interface CardContext {
  game: Game;
  player: Player;
  card: CardInstance;
}

export interface PrintSpawnChanceMultiplier {
  [Print.Error]: number;
  [Print.Monotone]: number;
  [Print.Negative]: number;
  [Print.Signed]: number;
}

export const DEFAULT_PRINT_SPAWN_CHANCE_MULTIPLIER = {
  [Print.Error]: 0.1,
  [Print.Monotone]: 0.1,
  [Print.Negative]: 0.1,
  [Print.Signed]: 0.1,
};

export function getRandomPrint(
  rng: AleaRNG,
  multiplier: PrintSpawnChanceMultiplier,
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

export interface CardManipulator {
  rng: AleaRNG;
  print: PrintSpawnChanceMultiplier;
  edition: number;
}

export abstract class Card {
  static name: string;

  static rarity: Rarity;

  static aspect: Aspect[];

  abstract load(context: CardContext): void;
}

export class CardInstance {
  public edition: Edition;

  public print: number;

  public disabled = false;

  constructor(
    public card: Card,
    manipulator: CardManipulator,
  ) {
    this.print = getRandomPrint(manipulator.rng, manipulator.print);
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
