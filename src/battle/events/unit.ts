import type { BaseEvent } from '../../core/event-emitter';
import type { CardInstance } from '../../game/card';
import type { DamageType, Energy, Stat } from '../types';
import type Unit from '../unit';

export interface UnitEvent extends BaseEvent {
  source: Unit;
}

export interface UnitStatEvent extends UnitEvent {
  stat: Stat;
  value: number;
}

export interface UnitEnergyEvent extends UnitEvent {
  energy: Energy;
  value: number;
  permanent: boolean;
}

/**
 * `value` is how much consumable energy is spent. The energy mechanics
 * write the base amount on `Initial`.
 */
export interface UnitConsumeEnergyEvent extends UnitEvent {
  energy: Energy;
  value: number;
}

export interface UnitTriggerEnergyEvent extends UnitEvent {
  energy: Energy;
  flags: number;
}

/**
 * `duration` is in milliseconds. Zero means the energy does not
 * trigger on its own.
 */
export interface CheckUnitEnergyPeriodEvent extends UnitEvent {
  energy: Energy;
  duration: number;
}

export interface CheckUnitEnemyEvent extends UnitEvent {
  target: Unit | undefined;
}

/**
 * An action from `source` to `target`: an attack, a heal or damage.
 */
export interface UnitActionEvent extends UnitEvent {
  target: Unit;
  value: number;
  flags: number;
}

export interface UnitDamageEvent extends UnitActionEvent {
  type: DamageType;
}

/**
 * Resolves one energy against a damage event. `source` is the unit
 * that owns the energy.
 */
export interface UnitDamageChildEvent extends UnitEvent {
  parent: UnitDamageEvent;
  flags: number;
}

export interface UnitCriticalEvent extends UnitDamageChildEvent {
  multiplier: number;
}

export interface UnitDamageModifierEvent extends UnitDamageChildEvent {
  value: number;
}

export interface UnitCardEvent extends UnitEvent {
  card: CardInstance;
}

export interface UnitTriggerCardEvent extends UnitCardEvent {
  target: Unit;
  value: number;
}
