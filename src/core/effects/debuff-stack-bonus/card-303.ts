import { EventType } from '../../game';
import createDebuffStackBonusEffectCardSource from './template';

export default createDebuffStackBonusEffectCardSource({
  name: 'Card #303',
  tier: 1,
  debuff: EventType.RemoveEvasion,
});
