import { EventEmitter, type EventEmitterListener } from './event-emitter';
import { Player } from './player';
import { GameEventType } from './types';

export interface BaseGameEvent {
  id: string;
}

export interface NextRoundGameEvent extends BaseGameEvent {}

export type GameEvents = {
  [GameEventType.Setup]: BaseGameEvent;
  [GameEventType.Start]: BaseGameEvent;
  [GameEventType.End]: BaseGameEvent;
  [GameEventType.NextRound]: BaseGameEvent;
  [GameEventType.OpenShop]: BaseGameEvent;
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
  };
}

export class Game {
  private emitters = createGameEventEmitterInstances();

  public player: Player;

  constructor(name: string) {
    this.player = new Player(name);
  }

  on<E extends GameEventType>(
    type: E,
    priority: number,
    listener: EventEmitterListener<GameEvents[E]>,
  ): void {
    this.emitters[type].on(priority, listener);
  }

  emit<E extends GameEventType>(type: E, event: GameEvents[E]): void {
    this.emitters[type].emit(event);
  }

  setup() {
    this.emit(GameEventType.Setup, { id: 'SetupEvent' });
  }

  start() {
    this.emit(GameEventType.Start, { id: 'StartEvent' });
  }

  nextRound() {
    this.emit(GameEventType.NextRound, { id: 'NextRoundEvent' });
  }

  end() {
    this.emit(GameEventType.End, { id: 'EndEvent' });
  }
}
