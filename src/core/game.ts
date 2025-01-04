import { AleaRNG } from './alea';
import type { CardInstance } from './card';
import { EventEmitter, type EventEmitterListener } from './event-emitter';
import { Player } from './player';
import type { Round } from './round';
import { GameEventType } from './types';

export interface BaseGameEvent {
  id: string;
}

export interface NextRoundGameEvent extends BaseGameEvent {
  round: Round;
}

export interface CardGameEvent extends BaseGameEvent {
  card: CardInstance;
}

export interface CardGameEvent extends BaseGameEvent {
  card: CardInstance;
}

export interface CardGameEvent extends BaseGameEvent {
  card: CardInstance;
}

export type GameEvents = {
  [GameEventType.Setup]: BaseGameEvent;
  [GameEventType.Start]: BaseGameEvent;
  [GameEventType.End]: BaseGameEvent;
  [GameEventType.NextRound]: NextRoundGameEvent;
  [GameEventType.OpenShop]: BaseGameEvent;
  [GameEventType.SellCard]: CardGameEvent;
  [GameEventType.AcquireCard]: CardGameEvent;
  [GameEventType.EnableCard]: CardGameEvent;
  [GameEventType.DisableCard]: CardGameEvent;
};

type GameEventEmitterInstances = {
  [key in keyof GameEvents]: EventEmitter<GameEvents[key]>;
};

function createGameEventEmitterInstances(): GameEventEmitterInstances {
  return {
    [GameEventType.Setup]: new EventEmitter(),
    [GameEventType.Start]: new EventEmitter(),
    [GameEventType.End]: new EventEmitter(),
    [GameEventType.NextRound]: new EventEmitter(),
    [GameEventType.OpenShop]: new EventEmitter(),
    [GameEventType.SellCard]: new EventEmitter(),
    [GameEventType.AcquireCard]: new EventEmitter(),
    [GameEventType.EnableCard]: new EventEmitter(),
    [GameEventType.DisableCard]: new EventEmitter(),
  };
}

export class Game {
  private emitters = createGameEventEmitterInstances();

  public player: Player;

  public rng: AleaRNG;

  constructor(
    public seed: string,
    name: string,
  ) {
    this.rng = new AleaRNG(seed);
    this.player = new Player(this.rng.int32(), name);
  }

  on<E extends GameEventType>(
    type: E,
    priority: number,
    listener: EventEmitterListener<GameEvents[E]>,
  ): () => void {
    return this.emitters[type].on(priority, listener);
  }

  off<E extends GameEventType>(
    type: E,
    priority: number,
    listener: EventEmitterListener<GameEvents[E]>,
  ): void {
    this.emitters[type].off(priority, listener);
  }

  emit<E extends GameEventType>(type: E, event: GameEvents[E]): void {
    this.emitters[type].emit(event);
  }

  setup() {
    this.emit(GameEventType.Setup, { id: 'Setup' });
  }

  start() {
    this.emit(GameEventType.Start, { id: 'Start' });
  }

  nextRound(round: Round) {
    this.emit(GameEventType.NextRound, { id: 'NextRound', round });
  }

  end() {
    this.emit(GameEventType.End, { id: 'End' });
  }

  openShop() {
    this.emit(GameEventType.OpenShop, { id: 'OpenShop' });
  }

  sellCard(card: CardInstance) {
    this.emit(GameEventType.SellCard, { id: 'SellCard', card });
  }

  acquireCard(card: CardInstance) {
    this.emit(GameEventType.AcquireCard, { id: 'AcquireCard', card });
  }

  enableCard(card: CardInstance) {
    this.emit(GameEventType.EnableCard, { id: 'EnableCard', card });
  }

  disableCard(card: CardInstance) {
    this.emit(GameEventType.DisableCard, { id: 'DisableCard', card });
  }
}
