import { EventType } from '../../game';
import createPeriodicDebuffEffectCardSource from './template';

export default createPeriodicDebuffEffectCardSource({
  name: 'Card #102',
  tier: 1,
  debuff: EventType.RemoveArmor,
});
