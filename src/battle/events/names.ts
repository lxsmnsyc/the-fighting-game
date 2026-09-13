/**
 * Every event the battle bus carries. `Check*` events are questions:
 * listeners write the answer into a field of the event. `Unit*`,
 * `Team*` and `Alliance*` events are things that happen.
 */
const enum BattleEvents {
  // Battle
  Start = 0,
  End = 1,
  Tick = 2,

  // Field
  AddAlliance = 3,
  RemoveAlliance = 4,
  AllianceAddTeam = 5,
  AllianceRemoveTeam = 6,
  TeamAddUnit = 7,
  TeamRemoveUnit = 8,

  // Unit
  UnitEntersBattle = 9,
  UnitFaints = 10,

  UnitSetStat = 11,
  UnitAddStat = 12,
  UnitRemoveStat = 13,

  // Energy
  UnitSetEnergy = 14,
  UnitAddEnergy = 15,
  UnitRemoveEnergy = 16,
  UnitConsumeEnergy = 17,
  /**
   * An energy takes effect: Attack attacks, Poison hurts, Healing
   * heals. Consumes the energy afterwards unless told otherwise.
   */
  UnitTriggerEnergy = 18,
  /**
   * How long an energy waits between natural triggers. Energies that
   * nobody answers for never trigger on their own.
   */
  CheckUnitEnergyPeriod = 19,
  /**
   * Which enemy the unit acts against right now.
   */
  CheckUnitEnemy = 20,

  // Combat
  UnitAttack = 21,
  UnitHeal = 22,
  UnitDamage = 23,
  UnitDodge = 24,
  UnitCritical = 25,
  UnitArmor = 26,
  UnitCorrosion = 27,

  // Cards
  UnitAddCard = 28,
  UnitRemoveCard = 29,
  UnitEnableCard = 30,
  UnitDisableCard = 31,
  /**
   * A card takes effect. Cards whose effect does not change the event
   * that set them off apply it here on `Exact`.
   */
  UnitTriggerCard = 32,
}

export default BattleEvents;
