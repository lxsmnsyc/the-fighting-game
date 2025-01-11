import { AleaRNG } from './alea';
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

export type GameEvents = {
  [GameEventType.Setup]: BaseGameEvent;
  [GameEventType.Start]: BaseGameEvent;
  [GameEventType.End]: BaseGameEvent;
  [GameEventType.NextRound]: NextRoundGameEvent;
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

  public rng: {
    world: AleaRNG;
    shop: AleaRNG;
    boss: AleaRNG;
  };

  constructor(
    public seed: string,
    name: string,
  ) {
    const world = new AleaRNG(seed);
    this.rng = {
      world,
      shop: new AleaRNG(world.int32().toString()),
      boss: new AleaRNG(world.int32().toString()),
    };
    this.player = new Player(world.int32(), name);
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
}
