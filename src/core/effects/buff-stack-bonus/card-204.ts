import { EventType } from '../../game';
import createBuffStackBonusEffectCardSource from './template';

export default createBuffStackBonusEffectCardSource({
  name: 'Card #204',
  tier: 1,
  buff: EventType.AddEvasion,
});
