import { EventType } from '../../game';
import createBuffStackBonusEffectCardSource from './template';

export default createBuffStackBonusEffectCardSource({
  name: 'Card #203',
  tier: 1,
  buffName: 'Armor',
  buffType: EventType.AddArmor,
});
