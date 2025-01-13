import { AleaRNG } from './alea';
import { DEFAULT_MAX_HEALTH } from './constants';
import { EventEngine } from './event-engine';
import type { Game } from './game';
import type { Player } from './player';
import {
  type DamageType,
  EventPriority,
  RoundEvents,
  Stack,
  Stat,
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

export interface HealEvent extends UnitValueEvent {
  flag: number;
}

function createHealEvent(
  source: Unit,
  amount: number,
  flag: number,
): HealEvent {
  return { id: 'HealEvent', source, amount, flag };
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

export type RoundEvent = {
  // Setup event takes place before start.
  // Stat adjustments should be made here.
  [RoundEvents.Setup]: BaseRoundEvent;

  // Start event begins the game.
  // Timeout events for the entire game should
  // be applied here (e.g. Poison damage)
  [RoundEvents.Start]: BaseRoundEvent;

  // Event for when a player deals damage
  [RoundEvents.Damage]: DamageEvent;

  [RoundEvents.SetStat]: SetStatEvent;
  [RoundEvents.AddStat]: SetStatEvent;
  [RoundEvents.RemoveStat]: SetStatEvent;

  [RoundEvents.AddStack]: SetStackEvent;
  [RoundEvents.RemoveStack]: SetStackEvent;
  [RoundEvents.SetStack]: SetStackEvent;

  [RoundEvents.End]: EndRoundEvent;
  [RoundEvents.Tick]: TickEvent;

  [RoundEvents.ConsumeStack]: ConsumeStackEvent;

  [RoundEvents.Heal]: HealEvent;
};

export interface UnitStats {
  [Stat.Health]: number;
  [Stat.MaxHealth]: number;
}

export interface UnitStacks {
  [Stack.Attack]: number;
  [Stack.Magic]: number;
  [Stack.Poison]: number;
  [Stack.Armor]: number;
  [Stack.Corrosion]: number;
  [Stack.Speed]: number;
  [Stack.Slow]: number;
  [Stack.Dodge]: number;
  [Stack.Critical]: number;
  [Stack.Healing]: number;
}

export class Unit {
  public rng: AleaRNG;

  constructor(public owner: Player) {
    this.rng = new AleaRNG(owner.rng.unit.int32().toString());
  }

  stats: UnitStats = {
    [Stat.Health]: DEFAULT_MAX_HEALTH,
    [Stat.MaxHealth]: DEFAULT_MAX_HEALTH,
  };

  // Stacks
  stacks: UnitStacks = {
    // Offensive
    [Stack.Attack]: 0,
    [Stack.Magic]: 0,
    [Stack.Poison]: 0,
    // Supporting
    [Stack.Armor]: 0,
    [Stack.Corrosion]: 0,
    [Stack.Speed]: 0,
    [Stack.Slow]: 0,
    [Stack.Dodge]: 0,
    [Stack.Critical]: 0,
    [Stack.Healing]: 0,
  };
}

export class Round extends EventEngine<RoundEvent> {
  constructor(
    public game: Game,
    public unitA: Unit,
    public unitB: Unit,
  ) {
    super();
  }

  getOwnedUnit(player: Player): Unit {
    if (this.unitA.owner === player) {
      return this.unitA;
    }
    return this.unitB;
  }

  setup(): void {
    this.emit(RoundEvents.Setup, { id: 'SetupEvent' });
  }

  start(): void {
    this.emit(RoundEvents.Start, { id: 'StartEvent' });
  }

  closed = false;

  tick(delta: number): void {
    this.emit(RoundEvents.Tick, { id: 'TickEvent', delta });
  }

  heal(source: Unit, amount: number, flag: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.Heal, createHealEvent(source, amount, flag));
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
      RoundEvents.Damage,
      createDamageEvent(type, source, target, amount, flag),
    );
  }

  consumeStack(type: Stack, source: Unit): void {
    this.emit(RoundEvents.ConsumeStack, {
      id: 'ConsumeStack',
      type,
      source,
    });
  }

  setStack(type: Stack, source: Unit, amount: number): void {
    this.emit(
      RoundEvents.SetStack,
      createSetStackEvent(type, source, amount | 0),
    );
  }

  addStack(type: Stack, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.AddStack, createAddStackEvent(type, source, amount));
  }

  removeStack(type: Stack, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEvents.RemoveStack,
      createRemoveStackEvent(type, source, amount),
    );
  }

  setStat(type: Stat, source: Unit, amount: number): void {
    this.emit(
      RoundEvents.SetStat,
      createSetStatEvent(type, source, amount | 0),
    );
  }

  addStat(type: Stat, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.AddStat, createStatEvent(type, source, amount));
  }

  removeStat(type: Stat, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEvents.RemoveStat,
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
    this.emit(RoundEvents.End, { id: 'EndRoundEvent', winner, loser });
  }
}

export function setupRound(round: Round): void {
  round.on(RoundEvents.Setup, EventPriority.Exact, () => {
    round.start();
  });

  round.on(RoundEvents.Start, EventPriority.Exact, () => {
    console.log('Game started');
  });

  round.on(RoundEvents.End, EventPriority.Exact, () => {
    round.closed = true;
  });
}
