import { EventType } from '../../game';
import createBuffStackBonusEffectCardSource from './template';

export default createBuffStackBonusEffectCardSource({
  name: 'Card #206',
  tier: 1,
  buffName: 'Critical',
  buffType: EventType.AddCritical,
});
