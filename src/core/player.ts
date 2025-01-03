import type { Card } from './card';
import {
  DEFAULT_ATTACK,
  DEFAULT_CRIT_MULTIPLIER,
  DEFAULT_MAGIC,
  DEFAULT_MAX_HEALTH,
} from './constants';
import type { Unit } from './round';
import { Stat } from './types';

export interface PlayerStats {
  [Stat.MaxHealth]: number;
  [Stat.Health]: number;
  [Stat.Attack]: number;
  [Stat.Magic]: number;
  [Stat.CritMultiplier]: number;
}

export class Player {
  stats: PlayerStats = {
    [Stat.MaxHealth]: DEFAULT_MAX_HEALTH,
    [Stat.Health]: DEFAULT_MAX_HEALTH,
    [Stat.Attack]: DEFAULT_ATTACK,
    [Stat.Magic]: DEFAULT_MAGIC,
    [Stat.CritMultiplier]: DEFAULT_CRIT_MULTIPLIER,
  };

  constructor(public name: string) {}

  cloneStats(): PlayerStats {
    return Object.assign({}, this.stats);
  }

  currentUnit: Unit | undefined;

  cards: Card[] = [];
}
