import { EventEmitter, type EventEmitterListener } from './event-emitter';

const DEFAULT_MAX_HEALTH = 1000;

const DEFAULT_MAX_MANA = 100;

const DEFAULT_CRIT_MULTIPLIER = 2.0;

export const enum DamageType {
  Magic = 1,
  Attack = 2,

  // Can trigger some damage events
  Pure = 3,

  // Does not trigger normal damage events either
  Poison = 4,
}

export interface EffectCardSource {
  name: string;
  tier: number;
  load: (game: Game, player: Player, level: number) => void;
  getDescription: (level: number) => (string | number)[];
}

export interface AbilityCardSource {
  name: string;
  load: (game: Game, player: Player, level: number) => void;
  getDescription: (level: number) => (string | number)[];
}

export function createEffectCardSource(
  source: EffectCardSource,
): EffectCardSource {
  return source;
}

export function createAbilityCardSource(
  source: AbilityCardSource,
): AbilityCardSource {
  return source;
}

export interface EffectCard {
  source: EffectCardSource;
  level: number;
}

export interface AbilityCard {
  source: AbilityCardSource;
  level: number;
}

export function createEffectCard(source: EffectCard): EffectCard {
  return source;
}

export function createAbilityCard(source: AbilityCard): AbilityCard {
  return source;
}

export const enum Stat {
  MaxHealth = 1,
  Health = 2,
  MaxMana = 3,
  Mana = 4,
  Attack = 5,
  Magic = 6,
  CritMultiplier = 7,
}

export const enum Stack {
  Poison = 1,
  Armor = 2,
  Speed = 3,
  Critical = 4,
  Evasion = 5,
  Luck = 6,
}

export interface PlayerStats {
  [Stat.MaxHealth]: number;
  [Stat.Health]: number;
  [Stat.MaxMana]: number;
  [Stat.Mana]: number;
  [Stat.Attack]: number;
  [Stat.Magic]: number;
  [Stat.CritMultiplier]: number;
}

export interface PlayerStacks {
  [Stack.Poison]: number;
  [Stack.Armor]: number;
  [Stack.Speed]: number;
  [Stack.Critical]: number;
  [Stack.Evasion]: number;
  [Stack.Luck]: number;
}

export class Player {
  // Stats
  stats: PlayerStats = {
    [Stat.MaxHealth]: DEFAULT_MAX_HEALTH,
    [Stat.Health]: DEFAULT_MAX_HEALTH,
    [Stat.MaxMana]: DEFAULT_MAX_MANA,
    [Stat.Mana]: 0,
    [Stat.Attack]: 20,
    [Stat.Magic]: 20,
    [Stat.CritMultiplier]: DEFAULT_CRIT_MULTIPLIER,
  };

  // Stacks
  stacks: PlayerStacks = {
    [Stack.Poison]: 0,
    [Stack.Armor]: 0,
    [Stack.Speed]: 0,
    [Stack.Critical]: 0,
    [Stack.Evasion]: 0,
    [Stack.Luck]: 0,
  };

  constructor(public name: string) {}

  load(game: Game) {
    if (this.AbilityCard) {
      this.AbilityCard.source.load(game, this, this.AbilityCard.level);
    }
    if (this.effects) {
      for (const effect of this.effects) {
        effect.source.load(game, this, effect.level);
      }
    }
  }

  public AbilityCard?: AbilityCard;
  public effects?: EffectCard[];
  public game?: Game;
}

export const enum EventType {
  Close = 1,
  Prepare = 2,
  Setup = 3,
  Start = 4,
  EndGame = 5,
  CastAbility = 6,
  Damage = 7,
  AddStack = 8,
  RemoveStack = 9,
  AddStat = 10,
  RemoveStat = 11,
  SetStack = 12,
  SetStat = 13,
}

export const STAT_NAME: Record<Stat, string> = {
  [Stat.Health]: 'Health',
  [Stat.Mana]: 'Mana',
  [Stat.MaxHealth]: 'Max Health',
  [Stat.MaxMana]: 'Max Mana',
  [Stat.Attack]: 'Attack',
  [Stat.Magic]: 'Magic',
  [Stat.CritMultiplier]: 'Critical Multiplier',
};

export const ADD_STACK_NAME: Record<Stack, string> = {
  [Stack.Armor]: 'Armor',
  [Stack.Critical]: 'Critical',
  [Stack.Evasion]: 'Evasion',
  [Stack.Luck]: 'Luck',
  [Stack.Poison]: 'Poison',
  [Stack.Speed]: 'Speed',
};

export const REMOVE_STACK_NAME: Record<Stack, string> = {
  [Stack.Armor]: 'Armor Decay',
  [Stack.Critical]: 'Critical Decay',
  [Stack.Evasion]: 'Evasion Decay',
  [Stack.Luck]: 'Curse',
  [Stack.Poison]: 'Cure',
  [Stack.Speed]: 'Slow',
};

export interface BaseEvent {
  id: string;
}

export interface PlayerEvent extends BaseEvent {
  source: Player;
}

export interface AbilityCardEvent extends PlayerEvent {
  source: Player;
}

export interface PlayerValueEvent extends PlayerEvent {
  amount: number;
}

export interface DamageFlags {
  critical: boolean;
  missed: boolean;
}

export interface DamageEvent extends PlayerValueEvent {
  type: DamageType;
  target: Player;
  flags: DamageFlags;
}

function createDamageEvent(
  type: DamageType,
  source: Player,
  target: Player,
  amount: number,
  flags: DamageFlags,
): DamageEvent {
  return { id: 'DamageEvent', type, source, target, amount, flags };
}

export interface SetStackEvent extends PlayerValueEvent {
  type: Stack;
}
function createSetStackEvent(
  type: Stack,
  source: Player,
  amount: number,
): SetStackEvent {
  return { id: 'SetStackEvent', type, source, amount };
}

export interface AddStackEvent extends SetStackEvent {}

function createAddStackEvent(
  type: Stack,
  source: Player,
  amount: number,
): AddStackEvent {
  return { id: 'AddStackEvent', type, source, amount };
}

export interface RemoveStackEvent extends SetStackEvent {
  target: Player;
}

function createRemoveStackEvent(
  type: Stack,
  source: Player,
  target: Player,
  amount: number,
): RemoveStackEvent {
  return { id: 'RemoveStackEvent', type, source, target, amount };
}

export interface SetStatEvent extends PlayerValueEvent {
  type: Stat;
}
function createSetStatEvent(
  type: Stat,
  source: Player,
  amount: number,
): SetStatEvent {
  return { id: 'SetStatEvent', type, source, amount };
}

export interface AddStatEvent extends SetStatEvent {}

function createAddStatEvent(
  type: Stat,
  source: Player,
  amount: number,
): AddStatEvent {
  return { id: 'AddStatEvent', type, source, amount };
}

export interface RemoveStatEvent extends AddStatEvent {
  target: Player;
}

function createRemoveStatEvent(
  type: Stat,
  source: Player,
  target: Player,
  amount: number,
): RemoveStatEvent {
  return { id: 'RemoveStatEvent', type, source, target, amount };
}

export interface EndGameEvent extends BaseEvent {
  winner: Player;
  loser: Player;
}

export type GameEvents = {
  [EventType.Close]: BaseEvent;
  // Event when beginning pick phase
  [EventType.Prepare]: BaseEvent;

  // Setup event takes place before start.
  // Stat adjustments should be made here.
  [EventType.Setup]: BaseEvent;

  // Start event begins the game.
  // Timeout events for the entire game should
  // be applied here (e.g. Poison damage)
  [EventType.Start]: BaseEvent;

  // Event for when a player casts their AbilityCard.
  [EventType.CastAbility]: AbilityCardEvent;

  // Event for when a player deals damage
  [EventType.Damage]: DamageEvent;

  [EventType.AddStack]: AddStackEvent;
  [EventType.RemoveStack]: RemoveStackEvent;
  [EventType.AddStat]: AddStatEvent;
  [EventType.RemoveStat]: RemoveStatEvent;

  [EventType.SetStat]: SetStatEvent;
  [EventType.SetStack]: SetStackEvent;

  [EventType.EndGame]: EndGameEvent;
};

type GameEventEmitterInstances = {
  [key in keyof GameEvents]: EventEmitter<GameEvents[key]>;
};

function createGameEventEmitterInstances(): GameEventEmitterInstances {
  return {
    [EventType.Close]: new EventEmitter(),
    [EventType.Prepare]: new EventEmitter(),
    [EventType.Setup]: new EventEmitter(),
    [EventType.Start]: new EventEmitter(),
    [EventType.EndGame]: new EventEmitter(),
    [EventType.CastAbility]: new EventEmitter(),
    [EventType.Damage]: new EventEmitter(),
    [EventType.AddStack]: new EventEmitter(),
    [EventType.RemoveStack]: new EventEmitter(),
    [EventType.AddStat]: new EventEmitter(),
    [EventType.RemoveStat]: new EventEmitter(),
    [EventType.SetStat]: new EventEmitter(),
    [EventType.SetStack]: new EventEmitter(),
  };
}

export class Game {
  private emitters = createGameEventEmitterInstances();

  constructor(
    public playerA: Player,
    public playerB: Player,
  ) {}

  on<E extends EventType>(
    type: E,
    priority: number,
    listener: EventEmitterListener<GameEvents[E]>,
  ): void {
    this.emitters[type].on(priority, listener);
  }

  emit<E extends EventType>(type: E, event: GameEvents[E]): void {
    this.emitters[type].emit(event);
  }

  prepare(): void {
    this.emit(EventType.Prepare, { id: 'PrepareEvent' });
  }

  setup(): void {
    this.emit(EventType.Setup, { id: 'SetupEvent' });
  }

  start(): void {
    this.emit(EventType.Start, { id: 'StartEvent' });
  }

  close(): void {
    this.emit(EventType.Close, { id: 'CloseEvent' });
  }

  CastAbility(source: Player): void {
    this.emit(EventType.CastAbility, { id: 'CastAbilityEvent', source });
  }

  dealDamage(
    type: DamageType,
    source: Player,
    target: Player,
    amount: number,
    flags: DamageFlags,
  ): void {
    if (amount === 0) {
      return;
    }
    this.emit(
      EventType.Damage,
      createDamageEvent(type, source, target, amount, flags),
    );
  }

  setStack(type: Stack, source: Player, amount: number): void {
    this.emit(
      EventType.SetStack,
      createSetStackEvent(type, source, amount | 0),
    );
  }

  addStack(type: Stack, source: Player, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(EventType.AddStack, createAddStackEvent(type, source, amount));
  }

  removeStack(
    type: Stack,
    source: Player,
    target: Player,
    amount: number,
  ): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      EventType.RemoveStack,
      createRemoveStackEvent(type, source, target, amount),
    );
  }

  setStat(type: Stat, source: Player, amount: number): void {
    this.emit(EventType.SetStat, createSetStatEvent(type, source, amount | 0));
  }

  addStat(type: Stat, source: Player, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(EventType.AddStat, createAddStatEvent(type, source, amount));
  }

  removeStat(type: Stat, source: Player, target: Player, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      EventType.RemoveStat,
      createRemoveStatEvent(type, source, target, amount),
    );
  }

  getOppositePlayer(player: Player) {
    if (player === this.playerA) {
      return this.playerB;
    }
    return this.playerA;
  }

  endGame(winner: Player, loser: Player): void {
    this.emit(EventType.EndGame, { id: 'EndGameEvent', winner, loser });
  }
}
