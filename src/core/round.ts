import { AleaRNG } from './alea';
import { EventEmitter, type EventEmitterListener } from './event-emitter';
import type { Game } from './game';
import type { Player, PlayerStats } from './player';
import {
  type DamageType,
  EventPriority,
  RoundEventType,
  Stack,
  type Stat,
} from './types';

export interface BaseRoundEvent {
  id: string;
}

export interface TickEvent extends BaseRoundEvent {
  delta: number;
}

export interface UnitEvent extends BaseRoundEvent {
  source: Unit;
}

export interface AbilityCardEvent extends UnitEvent {
  source: Unit;
}

export interface UnitValueEvent extends UnitEvent {
  amount: number;
}

export interface DamageEvent extends UnitValueEvent {
  type: DamageType;
  target: Unit;
  flag: number;
}

function createDamageEvent(
  type: DamageType,
  source: Unit,
  target: Unit,
  amount: number,
  flag: number,
): DamageEvent {
  return { id: 'DamageEvent', type, source, target, amount, flag };
}

export interface SetStackEvent extends UnitValueEvent {
  type: Stack;
}
function createSetStackEvent(
  type: Stack,
  source: Unit,
  amount: number,
): SetStackEvent {
  return { id: 'SetStackEvent', type, source, amount };
}

function createAddStackEvent(
  type: Stack,
  source: Unit,
  amount: number,
): SetStackEvent {
  return { id: 'AddStackEvent', type, source, amount };
}

function createRemoveStackEvent(
  type: Stack,
  source: Unit,
  amount: number,
): SetStackEvent {
  return { id: 'RemoveStackEvent', type, source, amount };
}

export interface SetStatEvent extends UnitValueEvent {
  type: Stat;
}

function createSetStatEvent(
  type: Stat,
  source: Unit,
  amount: number,
): SetStatEvent {
  return { id: 'SetStatEvent', type, source, amount };
}

function createStatEvent(
  type: Stat,
  source: Unit,
  amount: number,
): SetStatEvent {
  return { id: 'AddStatEvent', type, source, amount };
}

function createRemoveStatEvent(
  type: Stat,
  source: Unit,
  amount: number,
): SetStatEvent {
  return { id: 'RemoveStatEvent', type, source, amount };
}

export interface EndRoundEvent extends BaseRoundEvent {
  winner: Unit;
  loser: Unit;
}

export interface ConsumeStackEvent extends UnitEvent {
  type: Stack;
}

export type RoundEvents = {
  // Setup event takes place before start.
  // Stat adjustments should be made here.
  [RoundEventType.Setup]: BaseRoundEvent;

  // Start event begins the game.
  // Timeout events for the entire game should
  // be applied here (e.g. Poison damage)
  [RoundEventType.Start]: BaseRoundEvent;

  // Event for when a player deals damage
  [RoundEventType.Damage]: DamageEvent;

  [RoundEventType.SetStat]: SetStatEvent;
  [RoundEventType.AddStat]: SetStatEvent;
  [RoundEventType.RemoveStat]: SetStatEvent;

  [RoundEventType.AddStack]: SetStackEvent;
  [RoundEventType.RemoveStack]: SetStackEvent;
  [RoundEventType.SetStack]: SetStackEvent;

  [RoundEventType.End]: EndRoundEvent;
  [RoundEventType.Tick]: TickEvent;

  [RoundEventType.ConsumeStack]: ConsumeStackEvent;
};

type RoundEventEmitterInstances = {
  [key in keyof RoundEvents]: EventEmitter<RoundEvents[key]>;
};

function createRoundEventEmitterInstances(): RoundEventEmitterInstances {
  return {
    [RoundEventType.Setup]: new EventEmitter(),
    [RoundEventType.Start]: new EventEmitter(),
    [RoundEventType.End]: new EventEmitter(),
    [RoundEventType.Damage]: new EventEmitter(),
    [RoundEventType.AddStack]: new EventEmitter(),
    [RoundEventType.RemoveStack]: new EventEmitter(),
    [RoundEventType.AddStat]: new EventEmitter(),
    [RoundEventType.RemoveStat]: new EventEmitter(),
    [RoundEventType.SetStat]: new EventEmitter(),
    [RoundEventType.SetStack]: new EventEmitter(),
    [RoundEventType.Tick]: new EventEmitter(),
    [RoundEventType.ConsumeStack]: new EventEmitter(),
  };
}

export interface UnitStacks {
  [Stack.Poison]: number;
  [Stack.Armor]: number;
  [Stack.Corrosion]: number;
  [Stack.Speed]: number;
  [Stack.Slow]: number;
  [Stack.Evasion]: number;
  [Stack.Critical]: number;
  [Stack.Recovery]: number;
}

export class Unit {
  public stats: PlayerStats;

  public rng: AleaRNG;

  constructor(public owner: Player) {
    this.stats = owner.cloneStats();
    this.rng = new AleaRNG(owner.rng.int32().toString());
  }

  // Stacks
  stacks: UnitStacks = {
    [Stack.Poison]: 0,
    [Stack.Armor]: 0,
    [Stack.Corrosion]: 0,
    [Stack.Speed]: 0,
    [Stack.Slow]: 0,
    [Stack.Evasion]: 0,
    [Stack.Critical]: 0,
    [Stack.Recovery]: 0,
  };
}

export class Round {
  private emitters = createRoundEventEmitterInstances();

  constructor(
    public game: Game,
    public unitA: Unit,
    public unitB: Unit,
  ) {}

  on<E extends RoundEventType>(
    type: E,
    priority: number,
    listener: EventEmitterListener<RoundEvents[E]>,
  ): void {
    this.emitters[type].on(priority, listener);
  }

  emit<E extends RoundEventType>(type: E, event: RoundEvents[E]): void {
    if (this.closed) {
      return;
    }
    this.emitters[type].emit(event);
  }

  setup(): void {
    this.emit(RoundEventType.Setup, { id: 'SetupEvent' });
  }

  start(): void {
    this.emit(RoundEventType.Start, { id: 'StartEvent' });
  }

  closed = false;

  tick(delta: number): void {
    this.emit(RoundEventType.Tick, { id: 'TickEvent', delta });
  }

  dealDamage(
    type: DamageType,
    source: Unit,
    target: Unit,
    amount: number,
    flag: number,
  ): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEventType.Damage,
      createDamageEvent(type, source, target, amount, flag),
    );
  }

  consumeStack(type: Stack, source: Unit): void {
    this.emit(RoundEventType.ConsumeStack, {
      id: 'ConsumeStack',
      type,
      source,
    });
  }

  setStack(type: Stack, source: Unit, amount: number): void {
    this.emit(
      RoundEventType.SetStack,
      createSetStackEvent(type, source, amount | 0),
    );
  }

  addStack(type: Stack, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEventType.AddStack,
      createAddStackEvent(type, source, amount),
    );
  }

  removeStack(type: Stack, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEventType.RemoveStack,
      createRemoveStackEvent(type, source, amount),
    );
  }

  setStat(type: Stat, source: Unit, amount: number): void {
    this.emit(
      RoundEventType.SetStat,
      createSetStatEvent(type, source, amount | 0),
    );
  }

  addStat(type: Stat, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEventType.AddStat, createStatEvent(type, source, amount));
  }

  removeStat(type: Stat, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEventType.RemoveStat,
      createRemoveStatEvent(type, source, amount),
    );
  }

  getEnemyUnit(unit: Unit) {
    if (unit === this.unitA) {
      return this.unitB;
    }
    return this.unitA;
  }

  end(winner: Unit, loser: Unit): void {
    this.emit(RoundEventType.End, { id: 'EndRoundEvent', winner, loser });
    this.closed = true;
  }
}

export function setupRound(round: Round): void {
  round.on(RoundEventType.Setup, EventPriority.Exact, () => {
    round.start();
  });

  round.on(RoundEventType.Start, EventPriority.Exact, () => {
    console.log('Game started');
  });
}
