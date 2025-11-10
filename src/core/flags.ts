

/**
 * Damage flags
 */
export const enum DamageFlags {
  /**
   * Damage missed
   */
  Missed = 0x01,
  /**
   * Damage reduced by Armor
   */
  Armor = 0x02,
  /**
   * Damage amplified by Corrosion
   */
  Corrosion = 0x04,
  /**
   * Critical damage applied
   */
  Critical = 0x08,
  /**
   * Damage bypasses Dodge
   */
  Pierce = 0x10,
  /**
   * Damage is from a energy tick
   */
  Tick = 0x20,
  /**
   * Damage is from a natural tick
   */
  Natural = 0x40,
  /**
   * Damage is from an attack
   */
  Attack = 0x80,
  /**
   * Damage is non-lethal
   */
  NonLethal = 0x100
}

export const enum TriggerEnergyFlags {
  /**
   * If the trigger failed
   */
  Failed = 0b0001,
  /**
   * If the trigger shouldn't consume energy
   */
  NoConsume = 0b0010,
  /**
   * If the trigger is from a natural tick
   */
  Natural = 0b0100,
}

export const enum AttackFlags {
  /**
   * If attack is from a tick
   */
  Tick = 0b0001,
  /**
   * If tick attack is from a natural tick
   */
  Natural = 0b0010,
}

export const enum HealFlags {
  /**
   * If heal is from a tick
   */
  Tick = 0b0001,
  /**
   * If tick heal is from a natural tick
   */
  Natural = 0b0010,
}
