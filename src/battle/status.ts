const enum DebuffFlags {
  /**
   * - Speed and Dodge reset to 0.
   * - Cannot gain Speed and Dodge.
   * - Cannot cast Ability.
   * - Temporary.
   */
  Stunned = 0b0000000001,
  /**
   * - Speed and Dodge reset to 0.
   * - Cannot gain Speed and Dodge.
   * - Cannot cast Ability.
   * - Indefinite.
   * - Chance to be removed when taking damage (based on Luck.)
   */
  Sleeping = 0b0000000010,
  /**
   * - Speed and Dodge reset to 0.
   * - Cannot gain Speed and Dodge.
   * - Cannot cast Ability.
   * - Indefinite.
   * - Every second, chance to be removed (based on Luck.)
   */
  Frozen = 0b0000000100,
  /**
   * - Armor reset to 0.
   * - Cannot gain Armor.
   * - Temporary.
   */
  Stripped = 0b0000001000,
  /**
   * - Cannot use Attack and Magic.
   * - Temporary.
   */
  Disarmed = 0b0000010000,
  /**
   * - Cannot cast Ability.
   * - Temporary.
   */
  Silenced = 0b0000100000,
  /**
   * - Critical reset to 0.
   * - Cannot gain Critical.
   * - Temporary.
   */
  Feared = 0b0001000000,
  /**
   * - Luck reset to 0.
   * - Cannot gain Luck.
   * - Temporary.
   */
  Cursed = 0b0010000000,
  /**
   * - Speed and Dodge reset to 0.
   * - Cannot gain Speed and Dodge.
   * - Temporary.
   */
  Trapped = 0b0100000000,
  /**
   * - Cure reset to 0
   * - Cannot gain Cure.
   * - Temporary.
   */
  Weakened = 0b1000000000,
}

export default DebuffFlags;
