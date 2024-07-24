import { Stat } from '../../game';
import { createPeriodicAddStat } from './template';

export default createPeriodicAddStat({
  name: 'Card #001',
  stat: Stat.Health,
});
