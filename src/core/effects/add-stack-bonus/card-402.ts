import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddCorrosionStackBonusCard extends AddStackBonusCard {
  constructor() {
    super(Stack.Corrosion);
  }
}
