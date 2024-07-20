import { EventType } from '../../game';
import createPeriodicDebuffEffectCardSource from './template';

export default createPeriodicDebuffEffectCardSource({
  name: 'Card #105',
  tier: 1,
  debuffName: 'Slow',
  debuffType: EventType.RemoveSpeed,
});
