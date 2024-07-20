import { EventType } from '../../game';
import createDebuffStackBonusEffectCardSource from './template';

export default createDebuffStackBonusEffectCardSource({
  name: 'Card #306',
  tier: 1,
  debuff: EventType.RemoveLuck,
});
