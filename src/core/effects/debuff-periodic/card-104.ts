import { EventType } from '../../game';
import createPeriodicDebuffEffectCardSource from './template';

export default createPeriodicDebuffEffectCardSource({
  name: 'Card #104',
  tier: 1,
  debuff: EventType.RemoveCritical,
});