import { EventType } from '../../game';
import createBuffStackBonusEffectCardSource from './template';

export default createBuffStackBonusEffectCardSource({
  name: 'Card #207',
  tier: 1,
  buffName: 'Luck',
  buffType: EventType.AddLuck,
});
