import { AleaRNG } from './alea';
import type { CardInstance } from './card';
import { EventEngine } from './event-engine';
import { Player } from './player';
import type { Round } from './round';
import { GameEvents } from './types';

export interface BaseGameEvent {
  id: string;
}

export interface StartRoundGameEvent extends BaseGameEvent {
  round: Round;
}

export interface BaseCardGameEvent extends BaseGameEvent {
  card: CardInstance;
}

export interface TriggerCardGameEvent extends BaseCardGameEvent {
  data: unknown;
}

type GameEvent = {
  [GameEvents.Setup]: BaseGameEvent;
  [GameEvents.Start]: BaseGameEvent;
  [GameEvents.End]: BaseGameEvent;
  [GameEvents.NextRound]: BaseGameEvent;
  [GameEvents.StartRound]: StartRoundGameEvent;
  [GameEvents.AcquireCard]: BaseCardGameEvent;
  [GameEvents.SellCard]: BaseCardGameEvent;
  [GameEvents.EnableCard]: BaseCardGameEvent;
  [GameEvents.DisableCard]: BaseCardGameEvent;
  [GameEvents.TriggerCard]: TriggerCardGameEvent;
};

export class Game extends EventEngine<GameEvent> {
  public player: Player;

  public rng: {
    world: AleaRNG;
    boss: AleaRNG;
  };

  constructor(public seed: string) {
    super();

    const world = new AleaRNG(seed);
    this.rng = {
      world,
      boss: new AleaRNG(world.int32().toString()),
    };
    this.player = new Player(world.int32());
  }

  setup() {
    this.emit(GameEvents.Setup, { id: 'Setup' });
  }

  start() {
    this.emit(GameEvents.Start, { id: 'Start' });
  }

  nextRound() {
    this.emit(GameEvents.NextRound, { id: 'NextRound' });
  }

  startRound(round: Round) {
    this.emit(GameEvents.StartRound, { id: 'StartRound', round });
  }

  end() {
    this.emit(GameEvents.End, { id: 'End' });
  }

  enableCard(card: CardInstance) {
    this.emit(GameEvents.EnableCard, { id: 'EnableCard', card });
  }

  disableCard(card: CardInstance) {
    this.emit(GameEvents.DisableCard, { id: 'DisableCard', card });
  }

  acquireCard(card: CardInstance) {
    this.emit(GameEvents.AcquireCard, { id: 'AcquireCard', card });
  }

  sellCard(card: CardInstance) {
    this.emit(GameEvents.SellCard, { id: 'SellCard', card });
  }

  triggerCard(card: CardInstance, data: unknown) {
    if (card.enabled) {
      this.emit(GameEvents.TriggerCard, { id: 'TriggerCard', card, data });
    }
  }
}
