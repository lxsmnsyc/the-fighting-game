import { EventType } from '../../game';
import createPeriodicBuffEffectCardSource from './template';

export default createPeriodicBuffEffectCardSource({
  name: 'Card #005',
  tier: 1,
  buff: EventType.AddCritical,
});
