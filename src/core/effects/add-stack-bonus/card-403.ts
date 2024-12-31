import type { CardManipulator } from '../../card';
import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddCureStackBonusCard extends AddStackBonusCard {
  constructor(manipulator: CardManipulator) {
    super(manipulator, Stack.Cure);
  }
}
