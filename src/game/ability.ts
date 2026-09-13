import type AbilityId from '../abilities/ids';
import type Battle from '../battle/core';
import type Unit from '../battle/unit';
import type { Lifecycle } from '../core/lifecycle';
import type { Card } from './card';
import { ABILITY_BIAS } from './constants';
import type { Description } from './description';
import type { Player } from './player';
import type { Aspect } from './types';

export interface AbilityContext {
  battle: Battle;
  unit: Unit;
  ability: AbilityInstance;
}

/**
 * A power picked for the whole run. It triggers on a cooldown and
 * combines two aspects.
 */
export interface Ability {
  /**
   * Fixed for good. See `AbilityId`.
   */
  id: AbilityId;

  /**
   * One word: the name of an animal.
   */
  name: string;

  image: string;

  /**
   * The two aspects the ability combines. The shop favors cards that
   * share them.
   */
  aspects: [Aspect, Aspect];

  /**
   * Time between triggers in milliseconds, before Speed and Slow.
   */
  cooldown: number;

  /**
   * What the ability does, as tokens a UI can highlight.
   */
  description(): Description;

  /**
   * Registers the ability's listeners for one unit in one battle. The
   * effect runs on `UnitTriggerAbility`.
   */
  setup(context: AbilityContext): Lifecycle;
}

/**
 * Types an ability literal, so `setup` and `description` get their
 * context.
 */
export function createAbility(ability: Ability): Ability {
  return ability;
}

/**
 * An ability a player owns. It holds no state of its own, so its id is
 * enough to save it.
 */
export class AbilityInstance {
  constructor(
    readonly owner: Player,
    readonly source: Ability,
  ) {
    // no-op
  }
}

/**
 * The extra weight `abilities` give a card in rolls: `ABILITY_BIAS` for
 * each aspect the card shares with each ability.
 */
export function getAbilityBias(abilities: Ability[], card: Card): number {
  let bias = 0;
  for (const ability of abilities) {
    for (const aspect of card.aspect) {
      if (ability.aspects.includes(aspect)) {
        bias += ABILITY_BIAS;
      }
    }
  }
  return bias;
}
