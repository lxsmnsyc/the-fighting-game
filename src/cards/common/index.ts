import type { Card } from '../../game/card';
import ADD_STACK_BONUS_CARDS from './add-stack-bonus';
import ADD_STACK_ON_ABILITY_CARDS from './add-stack-on-ability';
import ADD_STACK_ON_ATTACK_CARDS from './add-stack-on-attack';
import ADD_STACK_ON_BLOCK_CARDS from './add-stack-on-block';
import ADD_STACK_ON_CONSUME_CARDS from './add-stack-on-consume';
import ADD_STACK_ON_COUNTER_CARDS from './add-stack-on-counter';
import ADD_STACK_ON_CRITICAL_CARDS from './add-stack-on-critical';
import ADD_STACK_ON_CRITICAL_TAKEN_CARDS from './add-stack-on-critical-taken';
import ADD_STACK_ON_DODGE_CARDS from './add-stack-on-dodge';
import ADD_STACK_ON_HEAL_CARDS from './add-stack-on-heal';
import ADD_STACK_ON_HEALTH_LOST_CARDS from './add-stack-on-health-lost';
import ADD_STACK_ON_HIT_CARDS from './add-stack-on-hit';
import ADD_STACK_ON_LOW_HEALTH_CARDS from './add-stack-on-low-health';
import ADD_STACK_ON_MAGIC_CARDS from './add-stack-on-magic';
import ADD_STACK_ON_POISON_TICK_CARDS from './add-stack-on-poison-tick';
import ADD_STACK_ON_START_CARDS from './add-stack-on-start';
import ADD_STAT_ON_START_CARDS from './add-stat-on-start';
import CONVERT_ENERGY_CARDS from './convert-energy';

const COMMON_CARDS: Card[] = [
  ...ADD_STACK_BONUS_CARDS,
  ...ADD_STACK_ON_START_CARDS,
  ...ADD_STAT_ON_START_CARDS,
  ...ADD_STACK_ON_HEAL_CARDS,
  ...ADD_STACK_ON_ATTACK_CARDS,
  ...ADD_STACK_ON_CRITICAL_CARDS,
  ...ADD_STACK_ON_DODGE_CARDS,
  ...ADD_STACK_ON_HIT_CARDS,
  ...ADD_STACK_ON_BLOCK_CARDS,
  ...ADD_STACK_ON_CRITICAL_TAKEN_CARDS,
  ...ADD_STACK_ON_MAGIC_CARDS,
  ...ADD_STACK_ON_POISON_TICK_CARDS,
  ...ADD_STACK_ON_ABILITY_CARDS,
  ...ADD_STACK_ON_COUNTER_CARDS,
  ...ADD_STACK_ON_CONSUME_CARDS,
  ...ADD_STACK_ON_LOW_HEALTH_CARDS,
  ...ADD_STACK_ON_HEALTH_LOST_CARDS,
  ...CONVERT_ENERGY_CARDS,
];

export default COMMON_CARDS;
