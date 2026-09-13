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
   * Damage is from an energy tick
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
   * Damage cannot bring health below 1
   */
  NonLethal = 0x100,
}

export const enum TriggerEnergyFlags {
  /**
   * The trigger has no effect
   */
  Failed = 0b0001,
  /**
   * The trigger does not consume energy
   */
  NoConsume = 0b0010,
  /**
   * The trigger is from a natural tick
   */
  Natural = 0b0100,
}

export const enum AttackFlags {
  /**
   * Attack is from a tick
   */
  Tick = 0b0001,
  /**
   * Tick attack is from a natural tick
   */
  Natural = 0b0010,
  /**
   * Attack was repeated by a card. Cards that repeat attacks skip it so
   * they cannot trigger themselves.
   */
  Echo = 0b0100,
}

export const enum HealFlags {
  /**
   * Heal is from a tick
   */
  Tick = 0b0001,
  /**
   * Tick heal is from a natural tick
   */
  Natural = 0b0010,
}
