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

export interface EffectSource {
  name: string;
  tier: 1 | 2 | 3;
  load: (game: Game, player: Player, level: number) => void;
  getDescription: (level: number) => string[];
}

export interface AbilitySource {
  name: string;
  load: (game: Game, player: Player, level: number) => void;
  getDescription: (level: number) => string[];
}

export interface Effect {
  source: EffectSource;
  level: number;
}

export interface Ability {
  source: AbilitySource;
  level: number;
}

export class Player {
  maxHealth = DEFAULT_HEALTH;

  maxMana = DEFAULT_MANA_POOL;

  // Statuses
  health = DEFAULT_HEALTH;

  mana = 0;

  attackDamage = 0;

  magicDamage = 0;

  critChance = 0;

  critMultiplier = DEFAULT_CRIT_MULTIPLIER;

  dodgeChance = 0;

  manaBonus = 0;

  healBonus = 0;

  poisonBonus = 0;

  penetrationBonus = 0;

  protectionBonus = 0;

  speedBonus = 0;

  slowBonus = 0;

  // Stacks

  poisonStacks = 0;

  penetrationStacks = 0;

  protectionStacks = 0;

  speedStacks = 0;

  slowStacks = 0;

  constructor(
    public game: Game,
    public ability: Ability,
    public effects: Effect[],
  ) {}

  load() {
    this.ability.source.load(this.game, this, this.ability.level);
    for (const effect of this.effects) {
      effect.source.load(this.game, this, this.ability.level);
    }
  }
}

export interface BaseEvent {
  priority: number;
}

function createBaseEvent(priority: number): BaseEvent {
  return { priority };
}

export interface PlayerEvent extends BaseEvent {
  source: Player;
}

function createPlayerEvent(source: Player, priority: number): PlayerEvent {
  return { source, priority };
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
  priority: number,
): DamageEvent {
  return { type, source, target, amount, flags, priority };
}

export interface BuffEvent extends PlayerValueEvent {}

function createBuffEvent(
  source: Player,
  amount: number,
  priority: number,
): BuffEvent {
  return { source, amount, priority };
}

export interface DebuffEvent extends PlayerValueEvent {
  target: Player;
}

function createDebuffEvent(
  source: Player,
  target: Player,
  amount: number,
  priority: number,
): DebuffEvent {
  return { source, target, amount, priority };
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
  [EventType.CastAbility]: PlayerEvent;

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
  };
}

export class Game {
  private emitters = createGameEventEmitterInstances();

  on<E extends EventType>(
    type: E,
    listener: EventEmitterListener<GameEvents[E]>,
  ): void {
    this.emitters[type].on(listener);
  }

  emit<E extends EventType>(type: E, event: GameEvents[E]): void {
    this.emitters[type].emit(event);
  }

  prepare(): void {
    this.emit(EventType.Prepare, createBaseEvent(1));
    this.emit(EventType.Prepare, createBaseEvent(2));
    this.emit(EventType.Prepare, createBaseEvent(3));
  }

  setup(): void {
    this.emit(EventType.Setup, createBaseEvent(1));
    this.emit(EventType.Setup, createBaseEvent(2));
    this.emit(EventType.Setup, createBaseEvent(3));
  }

  start(): void {
    this.emit(EventType.Start, createBaseEvent(1));
    this.emit(EventType.Start, createBaseEvent(2));
    this.emit(EventType.Start, createBaseEvent(3));
  }

  close(): void {
    this.emit(EventType.Close, createBaseEvent(1));
    this.emit(EventType.Close, createBaseEvent(2));
    this.emit(EventType.Close, createBaseEvent(3));
  }

  castAbility(player: Player): void {
    this.emit(EventType.CastAbility, createPlayerEvent(player, 1));
    this.emit(EventType.CastAbility, createPlayerEvent(player, 2));
    this.emit(EventType.CastAbility, createPlayerEvent(player, 3));
  }

  dealDamage(
    type: DamageType,
    source: Player,
    target: Player,
    flags: DamageFlags,
    amount: number,
  ): void {
    if (amount === 0) {
      return;
    }
    // Phase 1, Critical and Evasion
    const phase1 = createDamageEvent(type, source, target, amount, flags, 1);
    this.emit(EventType.Damage, phase1);
    // Phase 2 Protection
    const phase2 = createDamageEvent(
      type,
      source,
      target,
      phase1.amount,
      flags,
      2,
    );
    this.emit(EventType.Damage, phase2);
    // Phase 3 Actual Damage
    this.emit(
      EventType.Damage,
      createDamageEvent(type, source, target, phase2.amount, flags, 3),
    );
    this.emit(
      EventType.Damage,
      createDamageEvent(type, source, target, phase2.amount, flags, 4),
    );
  }

  triggerBuff(eventType: BuffEventType, player: Player, amount: number): void {
    if (amount === 0) {
      return;
    }
    const phase1 = createBuffEvent(player, amount, 1);
    this.emit(eventType, phase1);
    if (phase1.amount <= 0) {
      return;
    }
    this.emit(eventType, createBuffEvent(player, phase1.amount, 2));
    this.emit(eventType, createBuffEvent(player, phase1.amount, 3));
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
    const phase1 = createDebuffEvent(source, target, amount, 1);
    this.emit(eventType, phase1);
    if (phase1.amount <= 0) {
      return;
    }
    this.emit(eventType, createDebuffEvent(source, target, phase1.amount, 2));
    this.emit(eventType, createDebuffEvent(source, target, phase1.amount, 3));
  }
}
