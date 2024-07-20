import { EventType } from '../../game';
import createBuffStackBonusEffectCardSource from './template';

export default createBuffStackBonusEffectCardSource({
  name: 'Card #201',
  tier: 1,
  buffName: 'Health',
  buffType: EventType.AddHealth,
});
