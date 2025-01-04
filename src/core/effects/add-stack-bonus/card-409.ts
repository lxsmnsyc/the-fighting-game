import { Stack } from '../../types';
import { AddStackBonusCard } from './template';

export class AddRecoveryStackBonusCard extends AddStackBonusCard {
  constructor() {
    super(Stack.Recovery);
  }
}
