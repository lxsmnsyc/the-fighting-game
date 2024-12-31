import type { PrintSpawnChanceMultiplier } from '../../card';
import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddSpeedStackBonusCard extends AddStackBonusCard {
  constructor(print: PrintSpawnChanceMultiplier) {
    super(print, Stack.Speed);
  }
}
