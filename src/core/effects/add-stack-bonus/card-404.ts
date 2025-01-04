import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddPoisonStackBonusCard extends AddStackBonusCard {
  constructor() {
    super(Stack.Poison);
  }
}
