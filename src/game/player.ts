import type { AbilityInstance } from './ability';
import type { Card, CardInstance } from './card';
import { DEFAULT_GOLD, DEFAULT_LIFE } from './constants';
import { PlayerStat, Print, type PrintSpawnChance } from './types';

export type PlayerStats = Record<PlayerStat, number>;

/**
 * Holds no RNG: the rounds of a run own the randomness, so a player can
 * be restored from its stats and deck alone.
 */
export class Player {
  readonly stats: PlayerStats = {
    [PlayerStat.Life]: DEFAULT_LIFE,
    [PlayerStat.Gold]: DEFAULT_GOLD,
  };

  readonly printSpawnChance: PrintSpawnChance = {
    [Print.Error]: 0.1,
    [Print.Monotone]: 0.1,
    [Print.Negative]: 0.1,
  };

  name: string | undefined;

  readonly deck: CardInstance[] = [];

  readonly abilities: AbilityInstance[] = [];

  readonly cardPool: Card[] = [];
}
