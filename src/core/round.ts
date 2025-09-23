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

export interface SetStackEvent extends UnitValueEvent {
  type: Stack;
  permanent: boolean;
}

export interface SetStatEvent extends UnitValueEvent {
  type: Stat;
}

export interface EndRoundEvent extends BaseRoundEvent {
  winner: Unit;
  loser: Unit;
}

export interface ConsumeStackEvent extends UnitEvent {
  type: Stack;
}

export interface HealEvent extends UnitValueEvent {
  flag: number;
}

export interface TickHealEvent extends UnitEvent {
  flag: number;
}

export interface AttackEvent extends UnitValueEvent {
  flag: number;
}

export interface TickAttackEvent extends UnitEvent {
  flag: number;
}

export interface DamageSubEvent extends BaseRoundEvent {
  parent: DamageEvent;
  flag: number;
}

export interface CriticalEvent extends DamageSubEvent {
  multiplier: number;
}

export interface CorrosionEvent extends DamageSubEvent {
  value: number;
}

export interface ArmorEvent extends DamageSubEvent {
  value: number;
}

export interface TickSpeedEvent extends UnitEvent {
  flag: number;
}

export interface TickSlowEvent extends UnitEvent {
  flag: number;
}

export interface TickPoisonEvent extends UnitEvent {
  flag: number;
}

export interface TickMagicEvent extends UnitEvent {
  flag: number;
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
  [RoundEvents.SetupUnit]: UnitEvent;
  [RoundEvents.Attack]: AttackEvent;
  [RoundEvents.TickAttack]: TickAttackEvent;
  [RoundEvents.TickHeal]: TickHealEvent;
  [RoundEvents.Dodge]: DamageSubEvent;
  [RoundEvents.Critical]: CriticalEvent;
  [RoundEvents.Armor]: ArmorEvent;
  [RoundEvents.Corrosion]: CorrosionEvent;
  [RoundEvents.TickSpeed]: TickSpeedEvent;
  [RoundEvents.TickSlow]: TickSlowEvent;
  [RoundEvents.TickPoison]: TickPoisonEvent;
  [RoundEvents.TickMagic]: TickMagicEvent;
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

function createUnitStacks(): UnitStacks {
  return {
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
  stacks = {
    consumable: createUnitStacks(),
    permanent: createUnitStacks(),
  };

  getTotalStacks(stack: Stack): number {
    return this.stacks.permanent[stack] + this.stacks.consumable[stack];
  }

  getStacks(stack: Stack, permanent: boolean) {
    return permanent
      ? this.stacks.permanent[stack]
      : this.stacks.consumable[stack];
  }

  setStacks(stack: Stack, amount: number, permanent: boolean) {
    const target = Math.max(0, amount);
    if (permanent) {
      this.stacks.permanent[stack] = target;
    } else {
      this.stacks.consumable[stack] = target;
    }
  }
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

  setupUnit(unit: Unit): void {
    this.emit(RoundEvents.SetupUnit, { id: 'SetupUnitEvent', source: unit });
  }

  start(): void {
    this.emit(RoundEvents.Start, { id: 'StartEvent' });
  }

  closed = false;

  tick(delta: number): void {
    this.emit(RoundEvents.Tick, { id: 'TickEvent', delta });
  }

  naturalHeal(source: Unit, flag: number): void {
    this.emit(RoundEvents.TickHeal, { id: 'TickHealEvent', source, flag });
  }

  heal(source: Unit, amount: number, flag: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.Heal, { id: 'HealEvent', source, amount, flag });
  }

  naturalAttack(source: Unit, flag: number): void {
    this.emit(RoundEvents.TickAttack, { id: 'TickAttackEvent', source, flag });
  }

  attack(source: Unit, amount: number, flag: number): void {
    this.emit(RoundEvents.Attack, { id: 'AttackEvent', source, amount, flag });
  }

  dodge(parent: DamageEvent, flag: number): void {
    this.emit(RoundEvents.Dodge, {
      id: 'DodgeEvent',
      parent,
      flag,
    });
  }

  critical(parent: DamageEvent, multiplier: number, flag: number): void {
    this.emit(RoundEvents.Critical, {
      id: 'CriticalEvent',
      parent,
      flag,
      multiplier,
    });
  }

  triggerArmor(parent: DamageEvent, value: number, flag: number): void {
    this.emit(RoundEvents.Armor, {
      id: 'ArmorEvent',
      parent,
      flag,
      value,
    });
  }

  triggerCorrosion(parent: DamageEvent, value: number, flag: number): void {
    this.emit(RoundEvents.Corrosion, {
      id: 'CorrosionEvent',
      parent,
      flag,
      value,
    });
  }

  tickSpeed(source: Unit, flag: number): void {
    this.emit(RoundEvents.TickSpeed, {
      id: 'TickSpeedEvent',
      source,
      flag,
    });
  }

  tickSlow(source: Unit, flag: number): void {
    this.emit(RoundEvents.TickSlow, {
      id: 'TickSlowEvent',
      source,
      flag,
    });
  }

  tickPoison(source: Unit, flag: number): void {
    this.emit(RoundEvents.TickPoison, {
      id: 'TickPoisonEvent',
      source,
      flag,
    });
  }

  tickMagic(source: Unit, flag: number): void {
    this.emit(RoundEvents.TickMagic, {
      id: 'TickMagicEvent',
      source,
      flag,
    });
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
      { id: 'DamageEvent', type, source, target, amount, flag },
    );
  }

  consumeStack(type: Stack, source: Unit): void {
    this.emit(RoundEvents.ConsumeStack, {
      id: 'ConsumeStack',
      type,
      source,
    });
  }

  setStack(
    type: Stack,
    source: Unit,
    amount: number,
    permanent: boolean,
  ): void {
    this.emit(
      RoundEvents.SetStack,
      { id: 'SetStackEvent', type, source, amount: amount | 0, permanent },
    );
  }

  addStack(
    type: Stack,
    source: Unit,
    amount: number,
    permanent: boolean,
  ): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEvents.AddStack,
      { id: 'AddStackEvent', type, source, amount, permanent },
    );
  }

  removeStack(
    type: Stack,
    source: Unit,
    amount: number,
    permanent: boolean,
  ): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEvents.RemoveStack,
      { id: 'RemoveStackEvent', type, source, amount, permanent },
    );
  }

  setStat(type: Stat, source: Unit, amount: number): void {
    this.emit(
      RoundEvents.SetStat,
      { id: 'SetStatEvent', type, source, amount: amount | 0 },
    );
  }

  addStat(type: Stat, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.AddStat, { id: 'AddStatEvent', type, source, amount });
  }

  removeStat(type: Stat, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(
      RoundEvents.RemoveStat,
      { id: 'RemoveStatEvent', type, source, amount },
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
    round.setupUnit(round.unitA);
    round.setupUnit(round.unitB);
  });

  round.on(RoundEvents.Setup, EventPriority.Post, () => {
    round.start();
  });

  round.on(RoundEvents.Start, EventPriority.Exact, () => {
    console.log('Game started');
  });

  round.on(RoundEvents.End, EventPriority.Exact, () => {
    round.closed = true;
  });
}
