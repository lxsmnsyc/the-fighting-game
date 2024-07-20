import { Stat } from '../../game';
import { createPeriodicAddStatEffectCardSource } from './template';

export default createPeriodicAddStatEffectCardSource({
  name: 'Card #001',
  tier: 1,
  stat: Stat.Health,
});
