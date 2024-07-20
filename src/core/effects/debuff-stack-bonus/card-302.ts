import { EventType } from '../../game';
import createDebuffStackBonusEffectCardSource from './template';

export default createDebuffStackBonusEffectCardSource({
  name: 'Card #302',
  tier: 1,
  debuff: EventType.RemoveArmor,
});
