export const enum DebuffFlags {
  /**
   * - Speed and Evasion reset to 0.
   * - Cannot gain Speed and Evasion.
   * - Cannot cast Ability.
   * - Temporary.
   */
  Stunned = 1,
  /**
   * - Speed and Evasion reset to 0.
   * - Cannot gain Speed and Evasion.
   * - Cannot cast Ability.
   * - Indefinite.
   * - Chance to be removed when taking damage (based on Luck.)
   */
  Sleeping = 1 << 1,
  /**
   * - Speed and Evasion reset to 0.
   * - Cannot gain Speed and Evasion.
   * - Cannot cast Ability.
   * - Indefinite.
   * - Every second, chance to be removed (based on Luck.)
   */
  Frozen = 1 << 2,
  /**
   * - Armor reset to 0.
   * - Cannot gain Armor.
   * - Temporary.
   */
  Stripped = 1 << 3,
  /**
   * - Cannot use Attack and Magic.
   * - Temporary.
   */
  Disarmed = 1 << 4,
  /**
   * - Cannot cast Ability.
   * - Temporary.
   */
  Silenced = 1 << 5,
  /**
   * - Critical reset to 0.
   * - Cannot gain Critical.
   * - Temporary.
   */
  Feared = 1 << 6,
  /**
   * - Luck reset to 0.
   * - Cannot gain Luck.
   * - Temporary.
   */
  Cursed = 1 << 7,
  /**
   * - Speed and Evasion reset to 0.
   * - Cannot gain Speed and Evasion.
   * - Temporary.
   */
  Trapped = 1 << 8,
  /**
   * - Cure reset to 0
   * - Cannot gain Cure.
   * - Temporary.
   */
  Weakened = 1 << 9,
}
