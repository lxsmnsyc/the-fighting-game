import type Battle from '../battle/core';
import type { BattleOptions } from '../battle/setup';
import AleaRNG from '../core/alea';
import { EventEngine } from '../core/event-engine';
import type { Card, CardInstance } from './card';
import { ROUNDS_PER_PHASE } from './constants';
import {
  type BuyCardGameEvent,
  type CheckCardPriceGameEvent,
  type GameEventMap,
  GameEvents,
  type GameValueEvent,
  type RerollShopGameEvent,
} from './events';
import { Player } from './player';
import { type BattleResult, GameStage, type PlayerStat, RunResult } from './types';

export interface GameOptions {
  battle?: BattleOptions;
}

export interface ShopState {
  // An empty slot is a card that was bought
  offers: (Card | undefined)[];
  rerolls: number;
}

/**
 * The RNG of one round, split by stage.
 */
export interface RoundRNG {
  shop: AleaRNG;
  battle: AleaRNG;
}

/**
 * Derived from the run seed and the round number alone, so a round
 * plays out the same whenever it is reached, including after a resume.
 */
export function createRoundRNG(seed: string, round: number): RoundRNG {
  const rng = new AleaRNG(`${seed}:round:${round}`);
  return {
    shop: new AleaRNG(rng.int32().toString()),
    battle: new AleaRNG(rng.int32().toString()),
  };
}

/**
 * One run: phases of rounds, each round a shop and then a battle.
 */
export default class Game extends EventEngine<GameEventMap> {
  readonly player = new Player();

  started = false;

  stage = GameStage.Idle;

  result = RunResult.Ongoing;

  /**
   * Counted across the whole run, starting at 1.
   */
  round = 1;

  rng: RoundRNG;

  readonly shop: ShopState = { offers: [], rerolls: 0 };

  /**
   * The current battle, or the last one once it has ended.
   */
  battle: Battle | undefined;

  constructor(
    readonly seed: string,
    readonly options: GameOptions = {},
  ) {
    super();
    this.rng = createRoundRNG(seed, this.round);
  }

  /**
   * Starting at 1.
   */
  getPhase(): number {
    return Math.ceil(this.round / ROUNDS_PER_PHASE);
  }

  /**
   * The round within the current phase, starting at 1.
   */
  getPhaseRound(): number {
    return ((this.round - 1) % ROUNDS_PER_PHASE) + 1;
  }

  isBossRound(): boolean {
    return this.round % ROUNDS_PER_PHASE === 0;
  }

  // Run

  start(): void {
    this.emit(GameEvents.Start, { id: 'Start', disabled: false });
  }

  end(result: RunResult): void {
    this.emit(GameEvents.End, { id: 'End', disabled: false, result });
  }

  startRound(): void {
    this.emit(GameEvents.StartRound, { id: 'StartRound', disabled: false });
  }

  nextRound(): void {
    this.emit(GameEvents.NextRound, { id: 'NextRound', disabled: false });
  }

  checkRoundIncome(): number {
    const event: GameValueEvent = { id: 'CheckRoundIncome', disabled: false, value: 0 };
    this.emit(GameEvents.CheckRoundIncome, event);
    return event.value;
  }

  // Player

  setStat(stat: PlayerStat, value: number): void {
    this.emit(GameEvents.SetStat, { id: 'SetStat', disabled: false, stat, value: value | 0 });
  }

  addStat(stat: PlayerStat, value: number): void {
    value |= 0;
    if (value !== 0) {
      this.emit(GameEvents.AddStat, { id: 'AddStat', disabled: false, stat, value });
    }
  }

  removeStat(stat: PlayerStat, value: number): void {
    value |= 0;
    if (value !== 0) {
      this.emit(GameEvents.RemoveStat, { id: 'RemoveStat', disabled: false, stat, value });
    }
  }

  // Shop

  openShop(): void {
    this.emit(GameEvents.OpenShop, { id: 'OpenShop', disabled: false });
  }

  checkRerollCost(): number {
    const event: GameValueEvent = { id: 'CheckRerollCost', disabled: false, value: 0 };
    this.emit(GameEvents.CheckRerollCost, event);
    return event.value;
  }

  /**
   * Returns whether the reroll went through.
   */
  rerollShop(): boolean {
    const event: RerollShopGameEvent = {
      id: 'RerollShop',
      disabled: false,
      value: this.checkRerollCost(),
    };
    this.emit(GameEvents.RerollShop, event);
    return !event.disabled;
  }

  checkCardPrice(card: Card): number {
    const event: CheckCardPriceGameEvent = {
      id: 'CheckCardPrice',
      disabled: false,
      card,
      value: 0,
    };
    this.emit(GameEvents.CheckCardPrice, event);
    return event.value;
  }

  /**
   * Buys the card offered in `slot`. Returns whether it went through.
   */
  buyCard(slot: number): boolean {
    const card = this.shop.offers[slot];
    if (!card) {
      return false;
    }
    const event: BuyCardGameEvent = {
      id: 'BuyCard',
      disabled: false,
      slot,
      card,
      value: this.checkCardPrice(card),
    };
    this.emit(GameEvents.BuyCard, event);
    return !event.disabled;
  }

  // Deck

  acquireCard(card: CardInstance): void {
    this.emit(GameEvents.AcquireCard, { id: 'AcquireCard', disabled: false, card });
  }

  sellCard(card: CardInstance): void {
    this.emit(GameEvents.SellCard, { id: 'SellCard', disabled: false, card });
  }

  enableCard(card: CardInstance): void {
    this.emit(GameEvents.EnableCard, { id: 'EnableCard', disabled: false, card });
  }

  disableCard(card: CardInstance): void {
    this.emit(GameEvents.DisableCard, { id: 'DisableCard', disabled: false, card });
  }

  // Battle

  startBattle(): void {
    this.emit(GameEvents.StartBattle, { id: 'StartBattle', disabled: false });
  }

  endBattle(battle: Battle, result: BattleResult): void {
    this.emit(GameEvents.EndBattle, { id: 'EndBattle', disabled: false, battle, result });
  }
}
