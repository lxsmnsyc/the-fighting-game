import { EventType } from '../../game';
import createPeriodicDebuffEffectCardSource from './template';

export default createPeriodicDebuffEffectCardSource({
  name: 'Card #101',
  tier: 1,
  debuffName: 'Poison',
  debuffType: EventType.AddPoison,
});
