import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddSpeedStackBonusCard extends AddStackBonusCard {
  constructor() {
    super(Stack.Speed);
  }
}
