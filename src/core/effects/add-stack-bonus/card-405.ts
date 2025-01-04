import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddLuckStackBonusCard extends AddStackBonusCard {
  constructor() {
    super(Stack.Luck);
  }
}
