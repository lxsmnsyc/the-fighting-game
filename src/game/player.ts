import AleaRNG from '../core/alea';
import type { Card, CardInstance } from './card';
import { DEFAULT_GOLD, DEFAULT_LIFE } from './constants';
import { PlayerStat, Print, type PrintSpawnChance } from './types';

export type PlayerStats = Record<PlayerStat, number>;

interface PlayerRNG {
  self: AleaRNG;
  unit: AleaRNG;
  card: AleaRNG;
}

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

  readonly rng: PlayerRNG;

  constructor(seed: number) {
    const self = new AleaRNG(seed.toString());
    this.rng = {
      self,
      unit: new AleaRNG(self.int32().toString()),
      card: new AleaRNG(self.int32().toString()),
    };
  }

  name: string | undefined;

  readonly deck: CardInstance[] = [];

  readonly cardPool: Card[] = [];
}
