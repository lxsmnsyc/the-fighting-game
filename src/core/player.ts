import { AleaRNG } from './alea';
import type { Card, CardInstance } from './card';
import { DEFAULT_GOLD, DEFAULT_MAX_HEALTH } from './constants';
import type { Unit } from './round';
import { PlayerStat, Print, type PrintSpawnChance } from './types';

export interface PlayerStats {
  [PlayerStat.Gold]: number;
  [PlayerStat.Life]: number;
}

interface PlayerRNG {
  self: AleaRNG;
  unit: AleaRNG;
  card: AleaRNG;
}

export class Player {
  stats: PlayerStats = {
    [PlayerStat.Life]: DEFAULT_MAX_HEALTH,
    [PlayerStat.Gold]: DEFAULT_GOLD,
  };

  printSpawnChance: PrintSpawnChance = {
    [Print.Error]: 0.1,
    [Print.Monotone]: 0.1,
    [Print.Negative]: 0.1,
    [Print.Signed]: 0.1,
  };

  public rng: PlayerRNG;

  constructor(seed: number) {
    const self = new AleaRNG(seed.toString());
    this.rng = {
      self,
      unit: new AleaRNG(self.int32().toString()),
      card: new AleaRNG(self.int32().toString()),
    };
  }

  public name: string | undefined;

  currentUnit: Unit | undefined;

  deck: CardInstance[] = [];

  cardPool: Card[] = [];
}
