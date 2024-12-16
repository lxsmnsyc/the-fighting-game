import {
  DEFAULT_ATTACK,
  DEFAULT_CRIT_MULTIPLIER,
  DEFAULT_MAX_HEALTH,
  DEFAULT_MAX_MANA,
} from './constants';
import { Stat } from './types';

export interface PlayerStats {
  [Stat.MaxHealth]: number;
  [Stat.Health]: number;
  [Stat.MaxMana]: number;
  [Stat.Mana]: number;
  [Stat.Attack]: number;
  [Stat.Magic]: number;
  [Stat.CritMultiplier]: number;
}

export class Player {
  stats: PlayerStats = {
    [Stat.MaxHealth]: DEFAULT_MAX_HEALTH,
    [Stat.Health]: DEFAULT_MAX_HEALTH,
    [Stat.MaxMana]: DEFAULT_MAX_MANA,
    [Stat.Mana]: DEFAULT_MAX_MANA,
    [Stat.Attack]: DEFAULT_ATTACK,
    [Stat.Magic]: 0,
    [Stat.CritMultiplier]: DEFAULT_CRIT_MULTIPLIER,
  };

  constructor(public name: string) {}

  cloneStats(): PlayerStats {
    return Object.assign({}, this.stats);
  }
}
