import { EventType } from '../../game';
import createPeriodicBuffEffectCardSource from './template';

export default createPeriodicBuffEffectCardSource({
  name: 'Card #004',
  tier: 1,
  buffName: 'Evasion',
  buffType: EventType.AddEvasion,
});
