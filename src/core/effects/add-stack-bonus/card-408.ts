import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddSlowStackBonusCard extends AddStackBonusCard {
  constructor() {
    super(Stack.Slow);
  }
}
