import type Battle from '../battle/core';
import type { BattleOptions } from '../battle/setup';
import AleaRNG from '../core/alea';
import { EventEngine } from '../core/event-engine';
import type { BaseEvent } from '../core/event-emitter';
import type { Ability, AbilityInstance } from './ability';
import type { Card, CardInstance } from './card';
import { ROUNDS_PER_PHASE } from './constants';
import {
  type BuyCardGameEvent,
  type CheckCardPriceGameEvent,
  type CheckCardWeightGameEvent,
  type CheckPrintChanceGameEvent,
  type GameEventMap,
  GameEvents,
  type GameValueEvent,
  type PickAbilityGameEvent,
  type RerollShopGameEvent,
} from './events';
import GameModeId from './modes/ids';
import { Player } from './player';
import type { BattleSummary } from './summary';
import {
  type BattleResult,
  GameStage,
  type PlayerStat,
  Print,
  type PrintSpawnChance,
  RunResult,
} from './types';

export interface GameOptions {
  battle?: BattleOptions;
  /**
   * The rules the run plays by. Standard when unset.
   */
  mode?: GameModeId;
}

export interface ShopState {
  // Each offer is the copy to be bought, print included. An empty slot
  // is a card that was bought.
  offers: (CardInstance | undefined)[];
  rerolls: number;
}

export interface DraftState {
  offers: Ability[];
}

/**
 * The RNG of one round, split by stage.
 */
export interface RoundRNG {
  shop: AleaRNG;
  battle: AleaRNG;
  draft: AleaRNG;
}

/**
 * Derived from the run seed and the round number alone, so a round
 * plays out the same whenever it is reached, including after a resume.
 */
export function createRoundRNG(seed: string, round: number, attempt = 0): RoundRNG {
  const rng = new AleaRNG(`${seed}:round:${round}`);
  // Drawn in this order, so adding a stage never changes the others
  const shop = rng.int32().toString();
  return {
    // A replay rolls a new shop, but meets the same opponent
    shop: new AleaRNG(attempt === 0 ? shop : `${shop}:attempt:${attempt}`),
    battle: new AleaRNG(rng.int32().toString()),
    draft: new AleaRNG(rng.int32().toString()),
  };
}

/**
 * One endless run: phases of rounds, each round a shop and then a
 * battle. Some rounds open with an ability draft.
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

  readonly draft: DraftState = { offers: [] };

  /**
   * The current battle, or the last one once it has ended.
   */
  battle: Battle | undefined;

  /**
   * How many times the current round was replayed after a loss. Each
   * replay rolls a new shop.
   */
  attempt = 0;

  /**
   * What happened in the last battle that ended.
   */
  summary: BattleSummary | undefined;

  readonly mode: GameModeId;

  constructor(
    readonly seed: string,
    readonly options: GameOptions = {},
  ) {
    super();
    this.mode = options.mode ?? GameModeId.Standard;
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

  /**
   * How many abilities a player should have by the current phase: one
   * from the start, and one more every `CheckAbilityInterval` phases.
   */
  getAbilityCount(): number {
    return Math.floor((this.getPhase() - 1) / this.checkAbilityInterval()) + 1;
  }

  checkAbilityInterval(): number {
    const event: GameValueEvent = { id: 'CheckAbilityInterval', disabled: false, value: 0 };
    this.emit(GameEvents.CheckAbilityInterval, event);
    // At least 1, so every phase at most offers one
    return Math.max(1, event.value);
  }

  checkMaxLife(): number {
    const event: GameValueEvent = { id: 'CheckMaxLife', disabled: false, value: 0 };
    this.emit(GameEvents.CheckMaxLife, event);
    return Math.max(1, event.value);
  }

  checkPrintChance(player: Player, print: keyof PrintSpawnChance): number {
    const event: CheckPrintChanceGameEvent = {
      id: 'CheckPrintChance',
      disabled: false,
      player,
      print,
      value: 0,
    };
    this.emit(GameEvents.CheckPrintChance, event);
    return event.value;
  }

  /**
   * How likely each print is on a card `player` gets.
   */
  checkPrintChances(player: Player): PrintSpawnChance {
    return {
      [Print.Error]: this.checkPrintChance(player, Print.Error),
      [Print.Monotone]: this.checkPrintChance(player, Print.Monotone),
      [Print.Negative]: this.checkPrintChance(player, Print.Negative),
    };
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

  checkCardSlots(): number {
    const event: GameValueEvent = { id: 'CheckCardSlots', disabled: false, value: 0 };
    this.emit(GameEvents.CheckCardSlots, event);
    return event.value;
  }

  checkCardWeight(card: Card): number {
    const event: CheckCardWeightGameEvent = {
      id: 'CheckCardWeight',
      disabled: false,
      card,
      value: 0,
    };
    this.emit(GameEvents.CheckCardWeight, event);
    return event.value;
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
      value: this.checkCardPrice(card.source),
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

  // Abilities

  offerAbilities(): void {
    this.emit(GameEvents.OfferAbilities, { id: 'OfferAbilities', disabled: false });
  }

  /**
   * Picks the ability offered in `slot`. Returns whether it went through.
   */
  pickAbility(slot: number): boolean {
    const ability = this.draft.offers.at(slot);
    if (!ability) {
      return false;
    }
    const event: PickAbilityGameEvent = { id: 'PickAbility', disabled: false, slot, ability };
    this.emit(GameEvents.PickAbility, event);
    return !event.disabled;
  }

  acquireAbility(ability: AbilityInstance): void {
    this.emit(GameEvents.AcquireAbility, { id: 'AcquireAbility', disabled: false, ability });
  }

  // Battle

  startBattle(): void {
    this.emit(GameEvents.StartBattle, { id: 'StartBattle', disabled: false });
  }

  endBattle(battle: Battle, result: BattleResult): void {
    this.emit(GameEvents.EndBattle, { id: 'EndBattle', disabled: false, battle, result });
  }

  /**
   * Leaves the battle summary. Returns whether it went through.
   */
  continueRun(): boolean {
    const event: BaseEvent = { id: 'ContinueRun', disabled: false };
    this.emit(GameEvents.ContinueRun, event);
    return !event.disabled;
  }
}
