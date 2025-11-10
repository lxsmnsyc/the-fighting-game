import { AleaRNG } from './alea';
import type { CardInstance } from './card';
import type { BaseEvent } from './event-emitter';
import { EventEngine, type EventMap } from './event-engine';
import { Player } from './player';
import type { Round } from './round';
import { type EventPriority, GameEvents } from './types';

export interface StartRoundGameEvent extends BaseEvent {
  round: Round;
}

export interface BaseCardGameEvent extends BaseEvent {
  card: CardInstance;
}

export interface TriggerCardGameEvent extends BaseCardGameEvent {
  data: unknown;
}

interface GameEventMap extends EventMap {
  [GameEvents.Setup]: [BaseEvent, EventPriority];
  [GameEvents.Start]: [BaseEvent, EventPriority];
  [GameEvents.End]: [BaseEvent, EventPriority];
  [GameEvents.NextRound]: [BaseEvent, EventPriority];
  [GameEvents.StartRound]: [StartRoundGameEvent, EventPriority];
  [GameEvents.AcquireCard]: [BaseCardGameEvent, EventPriority];
  [GameEvents.SellCard]: [BaseCardGameEvent, EventPriority];
  [GameEvents.EnableCard]: [BaseCardGameEvent, EventPriority];
  [GameEvents.DisableCard]: [BaseCardGameEvent, EventPriority];
  [GameEvents.TriggerCard]: [TriggerCardGameEvent, EventPriority];
}

export class Game extends EventEngine<GameEventMap> {
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
    this.emit(GameEvents.Setup, { id: 'Setup', disabled: false });
  }

  start() {
    this.emit(GameEvents.Start, { id: 'Start', disabled: false });
  }

  nextRound() {
    this.emit(GameEvents.NextRound, { id: 'NextRound', disabled: false });
  }

  startRound(round: Round) {
    this.emit(GameEvents.StartRound, {
      id: 'StartRound',
      disabled: false,
      round,
    });
  }

  end() {
    this.emit(GameEvents.End, { id: 'End', disabled: false });
  }

  enableCard(card: CardInstance) {
    this.emit(GameEvents.EnableCard, {
      id: 'EnableCard',
      disabled: false,
      card,
    });
  }

  disableCard(card: CardInstance) {
    this.emit(GameEvents.DisableCard, {
      id: 'DisableCard',
      disabled: false,
      card,
    });
  }

  acquireCard(card: CardInstance) {
    this.emit(GameEvents.AcquireCard, {
      id: 'AcquireCard',
      disabled: false,
      card,
    });
  }

  sellCard(card: CardInstance) {
    this.emit(GameEvents.SellCard, { id: 'SellCard', disabled: false, card });
  }

  triggerCard(card: CardInstance, data: unknown) {
    if (!card.disabled) {
      this.emit(GameEvents.TriggerCard, {
        id: 'TriggerCard',
        disabled: false,
        card,
        data,
      });
    }
  }
}
