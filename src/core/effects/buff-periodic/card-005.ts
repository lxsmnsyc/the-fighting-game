import { EventType } from '../../game';
import createPeriodicBuffEffectCardSource from './template';

export default createPeriodicBuffEffectCardSource({
  name: 'Card #005',
  tier: 1,
  buffName: 'Critical',
  buffType: EventType.AddCritical,
});
