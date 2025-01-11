import { AleaRNG } from './alea';
import type { Card, CardInstance } from './card';
import { DEFAULT_MAX_HEALTH } from './constants';
import type { Unit } from './round';
import { Print, type PrintSpawnChance, Stat } from './types';

export interface PlayerStats {
  [Stat.MaxHealth]: number;
  [Stat.Health]: number;
}

export class Player {
  stats: PlayerStats = {
    [Stat.MaxHealth]: DEFAULT_MAX_HEALTH,
    [Stat.Health]: DEFAULT_MAX_HEALTH,
  };

  printSpawnChance: PrintSpawnChance = {
    [Print.Error]: 0.1,
    [Print.Monotone]: 0.1,
    [Print.Negative]: 0.1,
    [Print.Signed]: 0.1,
  };

  public rng: AleaRNG;

  constructor(seed: number) {
    this.rng = new AleaRNG(seed.toString());
  }

  public name: string | undefined;

  cloneStats(): PlayerStats {
    return Object.assign({}, this.stats);
  }

  currentUnit: Unit | undefined;

  deck: CardInstance[] = [];

  cardPool: Card[] = [];
}
