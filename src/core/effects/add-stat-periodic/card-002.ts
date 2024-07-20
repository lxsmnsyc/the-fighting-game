import { Stat } from '../../game';
import { createPeriodicAddStatEffectCardSource } from './template';

export default createPeriodicAddStatEffectCardSource({
  name: 'Card #002',
  tier: 1,
  stat: Stat.Mana,
});
