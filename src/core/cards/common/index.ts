import { ADD_STACK_BONUS_CARDS } from './add-stack-bonus';
import { ADD_STACK_ON_HEAL_CARDS } from './add-stack-on-heal';
import { ADD_STACK_ON_START_CARDS } from './add-stack-on-start';
import { ADD_STAT_ON_START_CARDS } from './add-stat-on-start';

export const COMMON_CARDS = [
  ...ADD_STACK_BONUS_CARDS,
  ...ADD_STACK_ON_START_CARDS,
  ...ADD_STAT_ON_START_CARDS,
  ...ADD_STACK_ON_HEAL_CARDS,
];
