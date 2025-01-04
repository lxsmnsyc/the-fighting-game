import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddCurseStackBonusCard extends AddStackBonusCard {
  constructor() {
    super(Stack.Curse);
  }
}
