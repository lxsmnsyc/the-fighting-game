import type { AleaRNG } from './alea';
import { EventEmitter, type EventEmitterListener } from './event-emitter';
import type { Game } from './game';
import type { Player } from './player';
import {
  type Aspect,
  CardEventType,
  Edition,
  EventPriority,
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

export type CardEvents = {
  [CardEventType.Trigger]: TriggerCardEvent;
  [CardEventType.Enable]: BaseCardEvent;
  [CardEventType.Disable]: BaseCardEvent;
  [CardEventType.Acquire]: BaseCardEvent;
  [CardEventType.Sell]: BaseCardEvent;
};

type GameEventEmitterInstances = {
  [key in keyof CardEvents]: EventEmitter<CardEvents[key]>;
};

function createGameEventEmitterInstances(): GameEventEmitterInstances {
  return {
    [CardEventType.Trigger]: new EventEmitter(),
    [CardEventType.Enable]: new EventEmitter(),
    [CardEventType.Disable]: new EventEmitter(),
    [CardEventType.Acquire]: new EventEmitter(),
    [CardEventType.Sell]: new EventEmitter(),
  };
}

export class CardInstance {
  private emitters = createGameEventEmitterInstances();

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

  on<E extends CardEventType>(
    type: E,
    priority: number,
    listener: EventEmitterListener<CardEvents[E]>,
  ): () => void {
    return this.emitters[type].on(priority, listener);
  }

  off<E extends CardEventType>(
    type: E,
    priority: number,
    listener: EventEmitterListener<CardEvents[E]>,
  ): void {
    this.emitters[type].off(priority, listener);
  }

  setup(): void {
    this.on(CardEventType.Acquire, EventPriority.Exact, () => {
      this.enable();
    });

    this.on(CardEventType.Sell, EventPriority.Exact, () => {
      this.disable();
    });

    this.on(CardEventType.Enable, EventPriority.Exact, () => {
      this.enabled = true;
    });

    this.on(CardEventType.Disable, EventPriority.Exact, () => {
      this.enabled = false;
    });
  }

  emit<E extends CardEventType>(type: E, event: CardEvents[E]): void {
    this.emitters[type].emit(event);
  }

  sell() {
    this.emit(CardEventType.Sell, { id: 'SellCard' });
  }

  acquire() {
    this.emit(CardEventType.Acquire, { id: 'AcquireCard' });
  }

  enable() {
    this.emit(CardEventType.Enable, { id: 'EnableCard' });
  }

  disable() {
    this.emit(CardEventType.Disable, { id: 'DisableCard' });
  }

  trigger<T>(data: T): void {
    if (this.enabled) {
      this.emit(CardEventType.Trigger, { id: 'TriggerCard', data });
    }
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
