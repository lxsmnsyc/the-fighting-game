import { EventType } from '../../game';
import createPeriodicBuffEffectCardSource from './template';

export default createPeriodicBuffEffectCardSource({
  name: 'Card #002',
  tier: 1,
  buffName: 'Mana',
  buffType: EventType.AddMana,
});
