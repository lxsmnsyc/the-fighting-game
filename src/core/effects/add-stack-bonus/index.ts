import { Aspect, Stack } from '../../types';
import createAddStackBonusCard from './template';

export default [
  // Offensive cards
  createAddStackBonusCard('', Stack.Attack, [Aspect.Attack]),
  createAddStackBonusCard('', Stack.Magic, [Aspect.Magic]),
  createAddStackBonusCard('', Stack.Poison, [Aspect.Poison]),
  // Supportive cards
  createAddStackBonusCard('', Stack.Armor, [Aspect.Armor]),
  createAddStackBonusCard('', Stack.Corrosion, [Aspect.Corrosion]),
  createAddStackBonusCard('', Stack.Speed, [Aspect.Speed]),
  createAddStackBonusCard('', Stack.Slow, [Aspect.Slow]),
  createAddStackBonusCard('', Stack.Evasion, [Aspect.Evasion]),
  createAddStackBonusCard('', Stack.Critical, [Aspect.Critical]),
  createAddStackBonusCard('', Stack.Healing, [Aspect.Healing]),
];
