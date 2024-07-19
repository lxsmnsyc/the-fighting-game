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

export interface PassiveSource {
  name: string;
  tier: 1 | 2 | 3;
  load: (game: Game, player: Player, level: number) => void;
  getDescription: (level: number) => (string | number)[];
}

export interface AbilitySource {
  name: string;
  load: (game: Game, player: Player, level: number) => void;
  getDescription: (level: number) => (string | number)[];
}

export function createPassiveSource(source: PassiveSource): PassiveSource {
  return source;
}

export function createAbilitySource(source: AbilitySource): AbilitySource {
  return source;
}

export interface Passive {
  source: PassiveSource;
  level: number;
}

export interface Ability {
  source: AbilitySource;
  level: number;
}

export function createPassive(source: Passive): Passive {
  return source;
}

export function createAbility(source: Ability): Ability {
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

  critChance = 0;

  critMultiplier = DEFAULT_CRIT_MULTIPLIER;

  dodgeChance = 0;

  // Stacks

  poisonStacks = 0;

  penetrationStacks = 0;

  protectionStacks = 0;

  speedStacks = 0;

  slowStacks = 0;

  constructor(public name: string) {}

  load(game: Game) {
    if (this.ability) {
      this.ability.source.load(game, this, this.ability.level);
    }
    if (this.effects) {
      for (const effect of this.effects) {
        effect.source.load(game, this, effect.level);
      }
    }
  }

  public ability?: Ability;
  public effects?: Passive[];
  public game?: Game;
}

export const enum EventType {
  Close = 1,
  Prepare = 2,
  Setup = 3,
  Start = 4,
  CastAbility = 5,
  Damage = 6,
  // Critical = 7,
  // Dodge = 8,
  AddHealth = 9,
  AddMana = 10,
  AddPenetration = 11,
  AddPoison = 12,
  AddProtection = 13,
  AddSlow = 14,
  AddSpeed = 15,
  RemoveHealth = 16,
  RemoveMana = 17,
  RemovePenetration = 18,
  RemovePoison = 19,
  RemoveProtection = 20,
  RemoveSlow = 21,
  RemoveSpeed = 22,
  EndGame = 23,
}

export interface BaseEvent {}

export interface PlayerEvent extends BaseEvent {
  source: Player;
}

export interface AbilityEvent extends PlayerEvent {
  source: Player;
}

export interface PlayerValueEvent extends PlayerEvent {
  amount: number;
}

export interface DamageFlags {
  critical: boolean;
  dodged: boolean;
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
  | EventType.AddProtection
  | EventType.AddSpeed
  | EventType.RemovePenetration
  | EventType.RemovePoison
  | EventType.RemoveSlow;

export type DebuffEventType =
  | EventType.AddPenetration
  | EventType.AddPoison
  | EventType.AddSlow
  | EventType.RemoveHealth
  | EventType.RemoveMana
  | EventType.RemoveProtection
  | EventType.RemoveSpeed;

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

  // Event for when a player casts their ability.
  [EventType.CastAbility]: AbilityEvent;

  // Event for when a player deals damage
  [EventType.Damage]: DamageEvent;

  [EventType.AddHealth]: BuffEvent;
  [EventType.AddMana]: BuffEvent;
  [EventType.AddPenetration]: DebuffEvent;
  [EventType.AddPoison]: DebuffEvent;
  [EventType.AddProtection]: BuffEvent;
  [EventType.AddSlow]: DebuffEvent;
  [EventType.AddSpeed]: BuffEvent;
  [EventType.RemoveHealth]: DebuffEvent;
  [EventType.RemoveMana]: DebuffEvent;
  [EventType.RemovePenetration]: BuffEvent;
  [EventType.RemovePoison]: BuffEvent;
  [EventType.RemoveProtection]: DebuffEvent;
  [EventType.RemoveSlow]: BuffEvent;
  [EventType.RemoveSpeed]: DebuffEvent;

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
    [EventType.CastAbility]: new EventEmitter(),
    [EventType.Damage]: new EventEmitter(),
    [EventType.AddHealth]: new EventEmitter(),
    [EventType.AddMana]: new EventEmitter(),
    [EventType.AddPenetration]: new EventEmitter(),
    [EventType.AddPoison]: new EventEmitter(),
    [EventType.AddProtection]: new EventEmitter(),
    [EventType.AddSlow]: new EventEmitter(),
    [EventType.AddSpeed]: new EventEmitter(),
    [EventType.RemoveHealth]: new EventEmitter(),
    [EventType.RemoveMana]: new EventEmitter(),
    [EventType.RemovePenetration]: new EventEmitter(),
    [EventType.RemovePoison]: new EventEmitter(),
    [EventType.RemoveProtection]: new EventEmitter(),
    [EventType.RemoveSlow]: new EventEmitter(),
    [EventType.RemoveSpeed]: new EventEmitter(),
    [EventType.EndGame]: new EventEmitter(),
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

  castAbility(source: Player): void {
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
