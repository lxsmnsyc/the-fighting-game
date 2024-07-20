import { EventType } from '../../game';
import createPeriodicDebuffEffectCardSource from './template';

export default createPeriodicDebuffEffectCardSource({
  name: 'Card #106',
  tier: 1,
  debuffName: 'Curse',
  debuffType: EventType.RemoveLuck,
});
