import { EventEmitter, type EventEmitterListener } from './event-emitter';

const DEFAULT_HEALTH = 1000;

const DEFAULT_MANA_POOL = 100;

const DEFAULT_CRIT_MULTIPLIER = 2.0;

export const enum DamageType {
  Magic = 1,
  Attack = 2,

  // Can trigger some damage events
  Pure = 3,

  // Does not trigger normal damage events
  Loss = 4,

  // Does not trigger normal damage events either
  Poison = 5,
}

export interface EffectCardSource {
  name: string;
  tier: 1 | 2 | 3;
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

export class Player {
  maxHealth = DEFAULT_HEALTH;

  maxMana = DEFAULT_MANA_POOL;

  // Statuses
  health = DEFAULT_HEALTH;

  mana = 0;

  attackDamage = 100;

  magicDamage = 0;

  critMultiplier = DEFAULT_CRIT_MULTIPLIER;

  // Stacks

  poisonStacks = 0;

  armorStacks = 0;

  speedStacks = 0;

  criticalStacks = 0;

  evasionStacks = 0;

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
  AddHealth = 8,
  RemoveHealth = 9,
  AddMana = 10,
  RemoveMana = 11,
  AddPoison = 12,
  RemovePoison = 13,
  AddArmor = 14,
  RemoveArmor = 15,
  AddSpeed = 16,
  RemoveSpeed = 17,
  AddEvasion = 18,
  RemoveEvasion = 19,
  AddCritical = 20,
  RemoveCritical = 21,
}

export interface BaseEvent {}

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
  return { type, source, target, amount, flags };
}

export interface BuffEvent extends PlayerValueEvent {}

function createBuffEvent(source: Player, amount: number): BuffEvent {
  return { source, amount };
}

export interface DebuffEvent extends PlayerValueEvent {
  target: Player;
}

function createDebuffEvent(
  source: Player,
  target: Player,
  amount: number,
): DebuffEvent {
  return { source, target, amount };
}

export interface EndGameEvent extends BaseEvent {
  winner: Player;
  loser: Player;
}

export type BuffEventType =
  | EventType.AddHealth
  | EventType.AddMana
  | EventType.AddArmor
  | EventType.AddSpeed
  | EventType.AddEvasion
  | EventType.AddCritical
  | EventType.RemovePoison;

export type DebuffEventType =
  | EventType.AddPoison
  | EventType.RemoveHealth
  | EventType.RemoveMana
  | EventType.RemoveArmor
  | EventType.RemoveSpeed
  | EventType.RemoveEvasion
  | EventType.RemoveCritical;

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

  [EventType.AddHealth]: BuffEvent;
  [EventType.RemoveHealth]: DebuffEvent;
  [EventType.AddMana]: BuffEvent;
  [EventType.RemoveMana]: DebuffEvent;
  [EventType.AddPoison]: DebuffEvent;
  [EventType.RemovePoison]: BuffEvent;
  [EventType.AddArmor]: BuffEvent;
  [EventType.RemoveArmor]: DebuffEvent;
  [EventType.AddSpeed]: BuffEvent;
  [EventType.RemoveSpeed]: DebuffEvent;
  [EventType.AddEvasion]: BuffEvent;
  [EventType.RemoveEvasion]: DebuffEvent;
  [EventType.AddCritical]: BuffEvent;
  [EventType.RemoveCritical]: DebuffEvent;

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
    [EventType.AddHealth]: new EventEmitter(),
    [EventType.RemoveHealth]: new EventEmitter(),
    [EventType.AddMana]: new EventEmitter(),
    [EventType.RemoveMana]: new EventEmitter(),
    [EventType.AddPoison]: new EventEmitter(),
    [EventType.RemovePoison]: new EventEmitter(),
    [EventType.AddArmor]: new EventEmitter(),
    [EventType.RemoveArmor]: new EventEmitter(),
    [EventType.AddSpeed]: new EventEmitter(),
    [EventType.RemoveSpeed]: new EventEmitter(),
    [EventType.AddEvasion]: new EventEmitter(),
    [EventType.RemoveEvasion]: new EventEmitter(),
    [EventType.AddCritical]: new EventEmitter(),
    [EventType.RemoveCritical]: new EventEmitter(),
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
    this.emit(EventType.Prepare, {});
  }

  setup(): void {
    this.emit(EventType.Setup, {});
  }

  start(): void {
    this.emit(EventType.Start, {});
  }

  close(): void {
    this.emit(EventType.Close, {});
  }

  CastAbility(source: Player): void {
    this.emit(EventType.CastAbility, { source });
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

  triggerBuff(eventType: BuffEventType, source: Player, amount: number): void {
    if (amount === 0) {
      return;
    }
    this.emit(eventType, createBuffEvent(source, amount));
  }

  triggerDebuff(
    eventType: DebuffEventType,
    source: Player,
    target: Player,
    amount: number,
  ): void {
    if (amount === 0) {
      return;
    }
    this.emit(eventType, createDebuffEvent(source, target, amount));
  }

  getOppositePlayer(player: Player) {
    if (player === this.playerA) {
      return this.playerB;
    }
    return this.playerA;
  }

  endGame(winner: Player, loser: Player): void {
    this.emit(EventType.EndGame, { winner, loser });
  }
}
