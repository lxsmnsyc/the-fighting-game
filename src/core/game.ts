import { EventEmitter, type EventEmitterListener } from './event-emitter';

const DEFAULT_HEALTH = 1000;

const DEFAULT_MANA_POOL = 100;

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

  critMultiplier = 0;

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

export type EventPriority =
  | 1 // post
  | 2 // exact
  | 3 // pre, on protection
  | 4; // before protection

export interface BaseEvent {
  priority: EventPriority;
}

function createBaseEvent(priority: EventPriority): BaseEvent {
  return { priority };
}

export interface PlayerEvent extends BaseEvent {
  source: Player;
}

function createPlayerEvent(
  source: Player,
  priority: EventPriority,
): PlayerEvent {
  return { source, priority };
}

export interface PlayerValueEvent extends PlayerEvent {
  amount: number;
}

export interface DamageEvent extends PlayerValueEvent {
  type: DamageType;
  target: Player;
}

function createDamageEvent(
  type: DamageType,
  source: Player,
  target: Player,
  amount: number,
  priority: EventPriority,
): DamageEvent {
  return { type, source, target, amount, priority };
}

export interface BuffEvent extends PlayerValueEvent {}

function createBuffEvent(
  source: Player,
  amount: number,
  priority: EventPriority,
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
  priority: EventPriority,
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
  Critical = 7,
  Dodge = 8,
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

export type GameEventEmitters =
  | [type: EventType.Close, event: BaseEvent]
  // Event when beginning pick phase
  | [type: EventType.Prepare, event: BaseEvent]

  // Setup event takes place before start.
  // Stat adjustments should be made here.
  | [type: EventType.Setup, event: BaseEvent]

  // Start event begins the game.
  // Timeout events for the entire game should
  // be applied here (e.g. Poison damage)
  | [type: EventType.Start, event: BaseEvent]

  // Event for when a player casts their ability.
  | [type: EventType.CastAbility, event: PlayerEvent]

  // Event for when a player deals damage
  | [type: EventType.Damage, event: DamageEvent]

  // Event for when a player's deals a critical
  | [type: EventType.Critical, event: DamageEvent]

  // Event for when a player dodges a damage
  | [type: EventType.Dodge, event: DamageEvent]
  | [type: EventType.AddHealth, event: BuffEvent]
  | [type: EventType.AddMana, event: BuffEvent]
  | [type: EventType.AddPenetration, event: DebuffEvent]
  | [type: EventType.AddPoison, event: DebuffEvent]
  | [type: EventType.AddProtection, event: BuffEvent]
  | [type: EventType.AddSlow, event: DebuffEvent]
  | [type: EventType.AddSpeed, event: BuffEvent]
  | [type: EventType.RemoveHealth, event: DebuffEvent]
  | [type: EventType.RemoveMana, event: DebuffEvent]
  | [type: EventType.RemovePenetration, event: BuffEvent]
  | [type: EventType.RemovePoison, event: BuffEvent]
  | [type: EventType.RemoveProtection, event: DebuffEvent]
  | [type: EventType.RemoveSlow, event: BuffEvent]
  | [type: EventType.RemoveSpeed, event: DebuffEvent];

type GameEventListenerTuple<T> = T extends GameEventEmitters
  ? [type: T[0], listener: EventEmitterListener<T[1]>]
  : never;

export type GameEventListeners = GameEventListenerTuple<GameEventEmitters>;

type TupleToObject<T extends GameEventEmitters> = {
  [key in T[0]]: Extract<T, [key, any]>[1];
};

type GameEventEmitterMap = TupleToObject<GameEventEmitters>;

type GameEventEmitterInstances = {
  [key in keyof GameEventEmitterMap]: EventEmitter<GameEventEmitterMap[key]>;
};

function createGameEventEmitterInstances(): GameEventEmitterInstances {
  return {
    [EventType.Close]: new EventEmitter(),
    [EventType.Prepare]: new EventEmitter(),
    [EventType.Setup]: new EventEmitter(),
    [EventType.Start]: new EventEmitter(),
    [EventType.CastAbility]: new EventEmitter(),
    [EventType.Critical]: new EventEmitter(),
    [EventType.Damage]: new EventEmitter(),
    [EventType.Dodge]: new EventEmitter(),
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

  on(...[type, listener]: GameEventListeners): void {
    this.emitters[type].on(listener as any);
  }

  emit(...[type, event]: GameEventEmitters): void {
    this.emitters[type].emit(event as any);
  }

  prepare(): void {
    this.emit(EventType.Prepare, createBaseEvent(3));
    this.emit(EventType.Prepare, createBaseEvent(2));
    this.emit(EventType.Prepare, createBaseEvent(1));
  }

  setup(): void {
    this.emit(EventType.Setup, createBaseEvent(3));
    this.emit(EventType.Setup, createBaseEvent(2));
    this.emit(EventType.Setup, createBaseEvent(1));
  }

  start(): void {
    this.emit(EventType.Start, createBaseEvent(3));
    this.emit(EventType.Start, createBaseEvent(2));
    this.emit(EventType.Start, createBaseEvent(1));
  }

  close(): void {
    this.emit(EventType.Close, createBaseEvent(3));
    this.emit(EventType.Close, createBaseEvent(2));
    this.emit(EventType.Close, createBaseEvent(1));
  }

  castAbility(player: Player): void {
    this.emit(EventType.CastAbility, createPlayerEvent(player, 3));
    this.emit(EventType.CastAbility, createPlayerEvent(player, 2));
    this.emit(EventType.CastAbility, createPlayerEvent(player, 1));
  }

  dealDamage(
    type: DamageType,
    source: Player,
    target: Player,
    amount: number,
  ): void {
    // Phase 1, Critical and Evasion
    const phase1 = createDamageEvent(type, source, target, amount, 4);
    this.emit(EventType.Damage, phase1);
    if (phase1.amount <= 0) {
      return;
    }
    // Phase 2 Protection
    const phase2 = createDamageEvent(type, source, target, phase1.amount, 3);
    this.emit(EventType.Damage, phase2);
    if (phase2.amount <= 0) {
      return;
    }
    // Phase 3 Actual Damage
    this.emit(
      EventType.Damage,
      createDamageEvent(type, source, target, phase2.amount, 2),
    );
    this.emit(
      EventType.Damage,
      createDamageEvent(type, source, target, phase2.amount, 1),
    );
  }

  triggerCritical(
    type: DamageType,
    source: Player,
    target: Player,
    amount: number,
  ): void {
    const phase1 = createDamageEvent(type, source, target, amount, 3);
    this.emit(EventType.Critical, phase1);
    if (phase1.amount <= 0) {
      return;
    }
    this.emit(
      EventType.Critical,
      createDamageEvent(type, source, target, amount, 2),
    );
    this.emit(
      EventType.Critical,
      createDamageEvent(type, source, target, amount, 1),
    );
  }

  triggerDodge(
    type: DamageType,
    source: Player,
    target: Player,
    amount: number,
  ): void {
    const phase1 = createDamageEvent(type, source, target, amount, 3);
    this.emit(EventType.Dodge, phase1);
    if (phase1.amount <= 0) {
      return;
    }
    this.emit(
      EventType.Dodge,
      createDamageEvent(type, source, target, amount, 2),
    );
    this.emit(
      EventType.Dodge,
      createDamageEvent(type, source, target, amount, 1),
    );
  }

  triggerBuff(eventType: BuffEventType, player: Player, amount: number): void {
    const phase1 = createBuffEvent(player, amount, 3);
    this.emit(eventType, phase1);
    if (phase1.amount <= 0) {
      return;
    }
    this.emit(eventType, createBuffEvent(player, phase1.amount, 2));
    this.emit(eventType, createBuffEvent(player, phase1.amount, 1));
  }

  triggerDebuff(
    eventType: DebuffEventType,
    source: Player,
    target: Player,
    amount: number,
  ): void {
    const phase1 = createDebuffEvent(source, target, amount, 3);
    this.emit(eventType, phase1);
    if (phase1.amount <= 0) {
      return;
    }
    this.emit(eventType, createDebuffEvent(source, target, phase1.amount, 2));
    this.emit(eventType, createDebuffEvent(source, target, phase1.amount, 1));
  }
}
