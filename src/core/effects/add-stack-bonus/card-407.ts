import type { CardManipulator } from '../../card';
import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddSpeedStackBonusCard extends AddStackBonusCard {
  constructor(manipulator: CardManipulator) {
    super(manipulator, Stack.Speed);
  }
}
