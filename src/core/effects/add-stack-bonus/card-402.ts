import type { CardManipulator } from '../../card';
import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddCorrosionStackBonusCard extends AddStackBonusCard {
  constructor(manipulator: CardManipulator) {
    super(manipulator, Stack.Corrosion);
  }
}
