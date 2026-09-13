import AleaRNG from '../core/alea';
import type { CardInstance } from '../game/card';
import { DEFAULT_MAX_HEALTH, SELF_STACK } from './constants';
import type Battle from './core';
import {
  BattleEvents,
  type CheckUnitEnemyEvent,
  type CheckUnitEnergyPeriodEvent,
  type UnitDamageEvent,
  type UnitTriggerCardEvent,
} from './events';
import type Team from './team';
import { type DamageType, type Energy, Stat, type UnitStats, createEnergyField } from './types';

/**
 * A fighter on a team. Its state only changes through the events its
 * methods emit, so mechanics and cards can answer or veto each change.
 */
export default class Unit {
  /**
   * Rolls for chance-based effects, such as Dodge and Critical.
   */
  readonly rng: AleaRNG;

  constructor(
    readonly battle: Battle,
    readonly team: Team,
  ) {
    this.rng = new AleaRNG(team.player.rng.unit.int32().toString());
  }

  /**
   * Whether the unit has entered the battle and is still standing.
   */
  alive = false;

  enter(): void {
    this.battle.emit(BattleEvents.UnitEntersBattle, {
      id: 'UnitEntersBattle',
      disabled: false,
      source: this,
    });
  }

  faint(): void {
    this.battle.emit(BattleEvents.UnitFaints, {
      id: 'UnitFaints',
      disabled: false,
      source: this,
    });
  }

  // Stats

  readonly stats: UnitStats = {
    [Stat.Health]: DEFAULT_MAX_HEALTH,
    [Stat.MaxHealth]: DEFAULT_MAX_HEALTH,
  };

  setStat(stat: Stat, value: number): void {
    this.battle.emit(BattleEvents.UnitSetStat, {
      id: 'UnitSetStat',
      disabled: false,
      source: this,
      stat,
      value: value | 0,
    });
  }

  addStat(stat: Stat, value: number): void {
    value |= 0;
    if (value === 0) {
      return;
    }
    this.battle.emit(BattleEvents.UnitAddStat, {
      id: 'UnitAddStat',
      disabled: false,
      source: this,
      stat,
      value,
    });
  }

  removeStat(stat: Stat, value: number): void {
    value |= 0;
    if (value === 0) {
      return;
    }
    this.battle.emit(BattleEvents.UnitRemoveStat, {
      id: 'UnitRemoveStat',
      disabled: false,
      source: this,
      stat,
      value,
    });
  }

  // Energy

  /**
   * Consumable energy is spent as it takes effect. Permanent energy
   * stays for the whole battle.
   */
  readonly energies = {
    consumable: createEnergyField(),
    permanent: createEnergyField(),
  };

  getEnergy(energy: Energy, permanent: boolean): number {
    return permanent ? this.energies.permanent[energy] : this.energies.consumable[energy];
  }

  getTotalEnergy(energy: Energy): number {
    return this.energies.permanent[energy] + this.energies.consumable[energy];
  }

  setEnergy(energy: Energy, value: number, permanent: boolean): void {
    this.battle.emit(BattleEvents.UnitSetEnergy, {
      id: 'UnitSetEnergy',
      disabled: false,
      source: this,
      energy,
      value: value | 0,
      permanent,
    });
  }

  addEnergy(energy: Energy, value: number, permanent: boolean): void {
    value |= 0;
    if (value === 0) {
      return;
    }
    this.battle.emit(BattleEvents.UnitAddEnergy, {
      id: 'UnitAddEnergy',
      disabled: false,
      source: this,
      energy,
      value,
      permanent,
    });
  }

  removeEnergy(energy: Energy, value: number, permanent: boolean): void {
    value |= 0;
    if (value === 0) {
      return;
    }
    this.battle.emit(BattleEvents.UnitRemoveEnergy, {
      id: 'UnitRemoveEnergy',
      disabled: false,
      source: this,
      energy,
      value,
      permanent,
    });
  }

  consumeEnergy(energy: Energy): void {
    this.battle.emit(BattleEvents.UnitConsumeEnergy, {
      id: 'UnitConsumeEnergy',
      disabled: false,
      source: this,
      energy,
      value: 0,
    });
  }

  triggerEnergy(energy: Energy, flags: number): void {
    this.battle.emit(BattleEvents.UnitTriggerEnergy, {
      id: 'UnitTriggerEnergy',
      disabled: false,
      source: this,
      energy,
      flags,
    });
  }

  checkEnergyPeriod(energy: Energy): number {
    const event: CheckUnitEnergyPeriodEvent = {
      id: 'CheckUnitEnergyPeriod',
      disabled: false,
      source: this,
      energy,
      duration: 0,
    };
    this.battle.emit(BattleEvents.CheckUnitEnergyPeriod, event);
    return event.duration;
  }

  // Targeting

  checkEnemy(): Unit | undefined {
    const event: CheckUnitEnemyEvent = {
      id: 'CheckUnitEnemy',
      disabled: false,
      source: this,
      target: undefined,
    };
    this.battle.emit(BattleEvents.CheckUnitEnemy, event);
    return event.target;
  }

  /**
   * Who gains the energy this unit hands out: itself, or an enemy for
   * energies that do not stack on their owner.
   */
  checkEnergyTarget(energy: Energy): Unit | undefined {
    return SELF_STACK[energy] ? this : this.checkEnemy();
  }

  // Combat

  attack(target: Unit, value: number, flags: number): void {
    this.battle.emit(BattleEvents.UnitAttack, {
      id: 'UnitAttack',
      disabled: false,
      source: this,
      target,
      value,
      flags,
    });
  }

  heal(target: Unit, value: number, flags: number): void {
    value |= 0;
    if (value === 0) {
      return;
    }
    this.battle.emit(BattleEvents.UnitHeal, {
      id: 'UnitHeal',
      disabled: false,
      source: this,
      target,
      value,
      flags,
    });
  }

  dealDamage(target: Unit, type: DamageType, value: number, flags: number): void {
    value |= 0;
    if (value === 0) {
      return;
    }
    this.battle.emit(BattleEvents.UnitDamage, {
      id: 'UnitDamage',
      disabled: false,
      source: this,
      target,
      type,
      value,
      flags,
    });
  }

  /**
   * Dodge `parent` with this unit's Dodge energy.
   */
  dodge(parent: UnitDamageEvent): void {
    this.battle.emit(BattleEvents.UnitDodge, {
      id: 'UnitDodge',
      disabled: false,
      source: this,
      parent,
      flags: 0,
    });
  }

  /**
   * Amplify `parent` with this unit's Critical energy.
   */
  critical(parent: UnitDamageEvent, multiplier: number): void {
    this.battle.emit(BattleEvents.UnitCritical, {
      id: 'UnitCritical',
      disabled: false,
      source: this,
      parent,
      flags: 0,
      multiplier,
    });
  }

  /**
   * Reduce `parent` with this unit's Armor energy.
   */
  armor(parent: UnitDamageEvent, value: number): void {
    this.battle.emit(BattleEvents.UnitArmor, {
      id: 'UnitArmor',
      disabled: false,
      source: this,
      parent,
      flags: 0,
      value,
    });
  }

  /**
   * Increase `parent` with this unit's Corrosion energy.
   */
  corrode(parent: UnitDamageEvent, value: number): void {
    this.battle.emit(BattleEvents.UnitCorrosion, {
      id: 'UnitCorrosion',
      disabled: false,
      source: this,
      parent,
      flags: 0,
      value,
    });
  }

  // Cards

  /**
   * The cards this unit holds, and whether each is enabled.
   */
  readonly cards = new Map<CardInstance, boolean>();

  addCard(card: CardInstance): void {
    this.battle.emit(BattleEvents.UnitAddCard, {
      id: 'UnitAddCard',
      disabled: false,
      source: this,
      card,
    });
  }

  removeCard(card: CardInstance): void {
    this.battle.emit(BattleEvents.UnitRemoveCard, {
      id: 'UnitRemoveCard',
      disabled: false,
      source: this,
      card,
    });
  }

  enableCard(card: CardInstance): void {
    this.battle.emit(BattleEvents.UnitEnableCard, {
      id: 'UnitEnableCard',
      disabled: false,
      source: this,
      card,
    });
  }

  disableCard(card: CardInstance): void {
    this.battle.emit(BattleEvents.UnitDisableCard, {
      id: 'UnitDisableCard',
      disabled: false,
      source: this,
      card,
    });
  }

  /**
   * Returns whether the trigger went through. A card that changes the
   * event which set it off applies the change only when this is true.
   *
   * A card cannot trigger from anything its own trigger sets off, either
   * directly or through other cards. Copies of a card share the rule.
   */
  triggerCard(card: CardInstance, target: Unit, value: number): boolean {
    const { triggeringCards } = this.battle;
    const { id } = card.source;
    if (triggeringCards.has(id)) {
      return false;
    }
    const event: UnitTriggerCardEvent = {
      id: 'UnitTriggerCard',
      disabled: false,
      source: this,
      card,
      target,
      value,
    };
    triggeringCards.add(id);
    try {
      this.battle.emit(BattleEvents.UnitTriggerCard, event);
    } finally {
      triggeringCards.delete(id);
    }
    return !event.disabled;
  }
}
