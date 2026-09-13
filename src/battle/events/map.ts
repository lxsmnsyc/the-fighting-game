import type { BaseEvent, EventPriority } from '../../core/event-emitter';
import type { EventMap } from '../../core/event-engine';
import type { DamagePriority, ValuePriority } from '../types';
import type { AllianceEvent, AllianceTeamEvent, TeamUnitEvent, TickEvent } from './field';
import type BattleEvents from './names';
import type {
  CheckUnitAbilityCooldownEvent,
  CheckUnitEnemyEvent,
  CheckUnitEnergyPeriodEvent,
  UnitAbilityEvent,
  UnitActionEvent,
  UnitCardEvent,
  UnitChargeAbilityEvent,
  UnitConsumeEnergyEvent,
  UnitCriticalEvent,
  UnitDamageChildEvent,
  UnitDamageEvent,
  UnitDamageModifierEvent,
  UnitEnergyEvent,
  UnitEvent,
  UnitStatEvent,
  UnitTriggerCardEvent,
  UnitTriggerEnergyEvent,
} from './unit';

/** Which event carries which shape, on which priority scale */
export interface BattleEventMap extends EventMap {
  [BattleEvents.Start]: [BaseEvent, EventPriority];
  [BattleEvents.End]: [BaseEvent, EventPriority];
  [BattleEvents.Tick]: [TickEvent, EventPriority];
  [BattleEvents.Fight]: [BaseEvent, EventPriority];

  [BattleEvents.AddAlliance]: [AllianceEvent, EventPriority];
  [BattleEvents.RemoveAlliance]: [AllianceEvent, EventPriority];
  [BattleEvents.AllianceAddTeam]: [AllianceTeamEvent, EventPriority];
  [BattleEvents.AllianceRemoveTeam]: [AllianceTeamEvent, EventPriority];
  [BattleEvents.TeamAddUnit]: [TeamUnitEvent, EventPriority];
  [BattleEvents.TeamRemoveUnit]: [TeamUnitEvent, EventPriority];

  [BattleEvents.UnitEntersBattle]: [UnitEvent, EventPriority];
  [BattleEvents.UnitFaints]: [UnitEvent, EventPriority];

  [BattleEvents.UnitSetStat]: [UnitStatEvent, ValuePriority];
  [BattleEvents.UnitAddStat]: [UnitStatEvent, ValuePriority];
  [BattleEvents.UnitRemoveStat]: [UnitStatEvent, ValuePriority];

  [BattleEvents.UnitSetEnergy]: [UnitEnergyEvent, ValuePriority];
  [BattleEvents.UnitAddEnergy]: [UnitEnergyEvent, ValuePriority];
  [BattleEvents.UnitRemoveEnergy]: [UnitEnergyEvent, ValuePriority];
  [BattleEvents.UnitConsumeEnergy]: [UnitConsumeEnergyEvent, ValuePriority];
  [BattleEvents.UnitTriggerEnergy]: [UnitTriggerEnergyEvent, EventPriority];
  [BattleEvents.CheckUnitEnergyPeriod]: [CheckUnitEnergyPeriodEvent, ValuePriority];
  [BattleEvents.CheckUnitEnemy]: [CheckUnitEnemyEvent, EventPriority];

  [BattleEvents.UnitAttack]: [UnitActionEvent, ValuePriority];
  [BattleEvents.UnitHeal]: [UnitActionEvent, ValuePriority];
  [BattleEvents.UnitDamage]: [UnitDamageEvent, DamagePriority];
  [BattleEvents.UnitDodge]: [UnitDamageChildEvent, ValuePriority];
  [BattleEvents.UnitCritical]: [UnitCriticalEvent, ValuePriority];
  [BattleEvents.UnitArmor]: [UnitDamageModifierEvent, ValuePriority];
  [BattleEvents.UnitCorrosion]: [UnitDamageModifierEvent, ValuePriority];

  [BattleEvents.UnitAddCard]: [UnitCardEvent, EventPriority];
  [BattleEvents.UnitRemoveCard]: [UnitCardEvent, EventPriority];
  [BattleEvents.UnitEnableCard]: [UnitCardEvent, EventPriority];
  [BattleEvents.UnitDisableCard]: [UnitCardEvent, EventPriority];
  [BattleEvents.UnitTriggerCard]: [UnitTriggerCardEvent, EventPriority];

  [BattleEvents.UnitAddAbility]: [UnitAbilityEvent, EventPriority];
  [BattleEvents.UnitRemoveAbility]: [UnitAbilityEvent, EventPriority];
  [BattleEvents.UnitChargeAbility]: [UnitChargeAbilityEvent, ValuePriority];
  [BattleEvents.UnitTriggerAbility]: [UnitAbilityEvent, EventPriority];
  [BattleEvents.CheckUnitAbilityCooldown]: [CheckUnitAbilityCooldownEvent, ValuePriority];
}
