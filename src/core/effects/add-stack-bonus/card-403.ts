import type { PrintSpawnChanceMultiplier } from '../../card';
import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddCureStackBonusCard extends AddStackBonusCard {
  constructor(print: PrintSpawnChanceMultiplier) {
    super(print, Stack.Cure);
  }
}
