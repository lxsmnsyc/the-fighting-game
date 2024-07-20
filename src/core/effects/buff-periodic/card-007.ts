import { EventType } from '../../game';
import createPeriodicBuffEffectCardSource from './template';

export default createPeriodicBuffEffectCardSource({
  name: 'Card #007',
  tier: 1,
  buffName: 'Luck',
  buffType: EventType.AddLuck,
});
