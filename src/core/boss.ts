import { Player } from './player';
import { Aspect } from './types';

interface BossData {
  name: string;
  aspect: [primary: Aspect, secondary: Aspect];
}

const BOSSES: BossData[] = [
  { name: '1', aspect: [Aspect.Armor, Aspect.Corrosion] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Attack] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Critical] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Dodge] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Healing] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Health] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Magic] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Poison] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Armor, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Corrosion] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Critical] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Dodge] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Healing] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Health] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Magic] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Poison] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Attack, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Corrosion, Aspect.Critical] },
  { name: '1', aspect: [Aspect.Corrosion, Aspect.Dodge] },
  { name: '1', aspect: [Aspect.Corrosion, Aspect.Healing] },
  { name: '1', aspect: [Aspect.Corrosion, Aspect.Health] },
  { name: '1', aspect: [Aspect.Corrosion, Aspect.Magic] },
  { name: '1', aspect: [Aspect.Corrosion, Aspect.Poison] },
  { name: '1', aspect: [Aspect.Corrosion, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Corrosion, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Critical, Aspect.Dodge] },
  { name: '1', aspect: [Aspect.Critical, Aspect.Healing] },
  { name: '1', aspect: [Aspect.Critical, Aspect.Health] },
  { name: '1', aspect: [Aspect.Critical, Aspect.Magic] },
  { name: '1', aspect: [Aspect.Critical, Aspect.Poison] },
  { name: '1', aspect: [Aspect.Critical, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Critical, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Dodge, Aspect.Healing] },
  { name: '1', aspect: [Aspect.Dodge, Aspect.Health] },
  { name: '1', aspect: [Aspect.Dodge, Aspect.Magic] },
  { name: '1', aspect: [Aspect.Dodge, Aspect.Poison] },
  { name: '1', aspect: [Aspect.Dodge, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Dodge, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Healing, Aspect.Health] },
  { name: '1', aspect: [Aspect.Healing, Aspect.Magic] },
  { name: '1', aspect: [Aspect.Healing, Aspect.Poison] },
  { name: '1', aspect: [Aspect.Healing, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Healing, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Health, Aspect.Magic] },
  { name: '1', aspect: [Aspect.Health, Aspect.Poison] },
  { name: '1', aspect: [Aspect.Health, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Health, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Magic, Aspect.Poison] },
  { name: '1', aspect: [Aspect.Magic, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Magic, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Poison, Aspect.Slow] },
  { name: '1', aspect: [Aspect.Poison, Aspect.Speed] },
  { name: '1', aspect: [Aspect.Slow, Aspect.Speed] },
];

function getRandomBossData(index: number) {
  return BOSSES[(index * BOSSES.length) | 0];
}

export class Boss extends Player {
  bossData: BossData;

  constructor(public seed: number) {
    super(seed);
    this.bossData = getRandomBossData(this.rng.random());
  }
}
