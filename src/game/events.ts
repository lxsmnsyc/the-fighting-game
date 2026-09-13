import type Battle from '../battle/core';
import type { ValuePriority } from '../battle/types';
import type { BaseEvent, EventPriority } from '../core/event-emitter';
import type { EventMap } from '../core/event-engine';
import type { Card, CardInstance } from './card';
import type { BattleResult, PlayerStat, RunResult } from './types';

/**
 * Events of a run, around and between battles.
 */
export const enum GameEvents {
  // Run
  Start = 0,
  End = 1,
  StartRound = 2,
  NextRound = 3,

  // Player
  SetStat = 4,
  AddStat = 5,
  RemoveStat = 6,

  // Shop
  OpenShop = 7,
  RerollShop = 8,
  BuyCard = 9,
  CheckCardPrice = 10,
  CheckRerollCost = 11,
  CheckRoundIncome = 12,

  // Deck
  AcquireCard = 13,
  SellCard = 14,
  EnableCard = 15,
  DisableCard = 16,

  // Battle
  StartBattle = 17,
  EndBattle = 18,
}

export interface EndGameEvent extends BaseEvent {
  result: RunResult;
}

export interface GameStatEvent extends BaseEvent {
  stat: PlayerStat;
  value: number;
}

/**
 * `value` is what the reroll costs.
 */
export interface RerollShopGameEvent extends BaseEvent {
  value: number;
}

/**
 * `value` is what the card costs.
 */
export interface BuyCardGameEvent extends BaseEvent {
  slot: number;
  card: Card;
  value: number;
}

export interface CheckCardPriceGameEvent extends BaseEvent {
  card: Card;
  value: number;
}

export interface GameValueEvent extends BaseEvent {
  value: number;
}

export interface CardGameEvent extends BaseEvent {
  card: CardInstance;
}

export interface EndBattleGameEvent extends BaseEvent {
  battle: Battle;
  result: BattleResult;
}

export interface GameEventMap extends EventMap {
  [GameEvents.Start]: [BaseEvent, EventPriority];
  [GameEvents.End]: [EndGameEvent, EventPriority];
  [GameEvents.StartRound]: [BaseEvent, EventPriority];
  [GameEvents.NextRound]: [BaseEvent, EventPriority];

  [GameEvents.SetStat]: [GameStatEvent, ValuePriority];
  [GameEvents.AddStat]: [GameStatEvent, ValuePriority];
  [GameEvents.RemoveStat]: [GameStatEvent, ValuePriority];

  [GameEvents.OpenShop]: [BaseEvent, EventPriority];
  [GameEvents.RerollShop]: [RerollShopGameEvent, EventPriority];
  [GameEvents.BuyCard]: [BuyCardGameEvent, EventPriority];
  [GameEvents.CheckCardPrice]: [CheckCardPriceGameEvent, ValuePriority];
  [GameEvents.CheckRerollCost]: [GameValueEvent, ValuePriority];
  [GameEvents.CheckRoundIncome]: [GameValueEvent, ValuePriority];

  [GameEvents.AcquireCard]: [CardGameEvent, EventPriority];
  [GameEvents.SellCard]: [CardGameEvent, EventPriority];
  [GameEvents.EnableCard]: [CardGameEvent, EventPriority];
  [GameEvents.DisableCard]: [CardGameEvent, EventPriority];

  [GameEvents.StartBattle]: [BaseEvent, EventPriority];
  [GameEvents.EndBattle]: [EndBattleGameEvent, EventPriority];
}
