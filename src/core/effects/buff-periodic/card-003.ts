import { EventType } from '../../game';
import createPeriodicBuffEffectCardSource from './template';

export default createPeriodicBuffEffectCardSource({
  name: 'Card #003',
  tier: 1,
  buffName: 'Armor',
  buffType: EventType.AddArmor,
});
