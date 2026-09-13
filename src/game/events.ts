import type Battle from '../battle/core';
import type { BaseEvent, EventPriority } from '../core/event-emitter';
import type { EventMap } from '../core/event-engine';
import type { CardInstance } from './card';

/**
 * Events of a run, between and around battles.
 */
export const enum GameEvents {
  // Game
  Setup = 0,
  Start = 1,
  NextRound = 2,
  StartRound = 3,
  End = 4,
  // Card
  AcquireCard = 5,
  SellCard = 6,
  EnableCard = 7,
  DisableCard = 8,
  // Shop
  LockShop = 9,
  RerollShop = 10,
}

export interface StartRoundGameEvent extends BaseEvent {
  battle: Battle;
}

export interface CardGameEvent extends BaseEvent {
  card: CardInstance;
}

export interface GameEventMap extends EventMap {
  [GameEvents.Setup]: [BaseEvent, EventPriority];
  [GameEvents.Start]: [BaseEvent, EventPriority];
  [GameEvents.End]: [BaseEvent, EventPriority];
  [GameEvents.NextRound]: [BaseEvent, EventPriority];
  [GameEvents.StartRound]: [StartRoundGameEvent, EventPriority];
  [GameEvents.AcquireCard]: [CardGameEvent, EventPriority];
  [GameEvents.SellCard]: [CardGameEvent, EventPriority];
  [GameEvents.EnableCard]: [CardGameEvent, EventPriority];
  [GameEvents.DisableCard]: [CardGameEvent, EventPriority];
}
