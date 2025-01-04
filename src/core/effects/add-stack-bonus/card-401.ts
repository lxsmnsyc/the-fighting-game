import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddArmorStackBonusCard extends AddStackBonusCard {
  constructor() {
    super(Stack.Armor);
  }
}
