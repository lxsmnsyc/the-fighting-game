import { AleaRNG } from './alea';
import { DEFAULT_MAX_HEALTH } from './constants';
import { EventEngine } from './event-engine';
import type { Game } from './game';
import type { Player } from './player';
import {
  type DamageType,
  Energy,
  EventPriority,
  RoundEvents,
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

export interface SetEnergyEvent extends UnitValueEvent {
  type: Energy;
  permanent: boolean;
}

export interface SetStatEvent extends UnitValueEvent {
  type: Stat;
}

export interface EndRoundEvent extends BaseRoundEvent {
  winner: Unit;
  loser: Unit;
}

export interface ConsumeEnergyEvent extends UnitEvent {
  type: Energy;
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

  [RoundEvents.AddEnergy]: SetEnergyEvent;
  [RoundEvents.RemoveEnergy]: SetEnergyEvent;
  [RoundEvents.SetEnergy]: SetEnergyEvent;

  [RoundEvents.End]: EndRoundEvent;
  [RoundEvents.Tick]: TickEvent;

  [RoundEvents.ConsumeEnergy]: ConsumeEnergyEvent;

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

export interface UnitEnergy {
  [Energy.Attack]: number;
  [Energy.Magic]: number;
  [Energy.Poison]: number;
  [Energy.Armor]: number;
  [Energy.Corrosion]: number;
  [Energy.Speed]: number;
  [Energy.Slow]: number;
  [Energy.Dodge]: number;
  [Energy.Critical]: number;
  [Energy.Healing]: number;
}

function createUnitEnergy(): UnitEnergy {
  return {
    // Offensive
    [Energy.Attack]: 0,
    [Energy.Magic]: 0,
    [Energy.Poison]: 0,
    // Supporting
    [Energy.Armor]: 0,
    [Energy.Corrosion]: 0,
    [Energy.Speed]: 0,
    [Energy.Slow]: 0,
    [Energy.Dodge]: 0,
    [Energy.Critical]: 0,
    [Energy.Healing]: 0,
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

  // Energies
  energies = {
    consumable: createUnitEnergy(),
    permanent: createUnitEnergy(),
  };

  getTotalEnergy(energy: Energy): number {
    return this.energies.permanent[energy] + this.energies.consumable[energy];
  }

  getEnergy(energy: Energy, permanent: boolean): number {
    return permanent
      ? this.energies.permanent[energy]
      : this.energies.consumable[energy];
  }

  setEnergy(energy: Energy, amount: number, permanent: boolean) {
    const target = Math.max(0, amount);
    if (permanent) {
      this.energies.permanent[energy] = target;
    } else {
      this.energies.consumable[energy] = target;
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
    this.emit(RoundEvents.Damage, {
      id: 'DamageEvent',
      type,
      source,
      target,
      amount,
      flag,
    });
  }

  consumeEnergy(type: Energy, source: Unit): void {
    this.emit(RoundEvents.ConsumeEnergy, {
      id: 'ConsumeEnergy',
      type,
      source,
    });
  }

  setEnergy(
    type: Energy,
    source: Unit,
    amount: number,
    permanent: boolean,
  ): void {
    this.emit(RoundEvents.SetEnergy, {
      id: 'SetEnergyEvent',
      type,
      source,
      amount: amount | 0,
      permanent,
    });
  }

  addEnergy(
    type: Energy,
    source: Unit,
    amount: number,
    permanent: boolean,
  ): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.AddEnergy, {
      id: 'AddEnergyEvent',
      type,
      source,
      amount,
      permanent,
    });
  }

  removeEnergy(
    type: Energy,
    source: Unit,
    amount: number,
    permanent: boolean,
  ): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.RemoveEnergy, {
      id: 'RemoveEnergyEvent',
      type,
      source,
      amount,
      permanent,
    });
  }

  setStat(type: Stat, source: Unit, amount: number): void {
    this.emit(RoundEvents.SetStat, {
      id: 'SetStatEvent',
      type,
      source,
      amount: amount | 0,
    });
  }

  addStat(type: Stat, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.AddStat, {
      id: 'AddStatEvent',
      type,
      source,
      amount,
    });
  }

  removeStat(type: Stat, source: Unit, amount: number): void {
    amount |= 0;
    if (amount === 0) {
      return;
    }
    this.emit(RoundEvents.RemoveStat, {
      id: 'RemoveStatEvent',
      type,
      source,
      amount,
    });
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
