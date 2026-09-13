import { ValuePriority } from '../../battle/types';
import { GameEvents } from '../events';
import { createGameMode } from '../mode';
import GameModeId from './ids';

const PRICE_INCREASE = 2;

export default createGameMode({
  id: GameModeId.Gambler,
  name: 'Gambler',
  rules: ['Rerolls are free.', 'Every card costs 2 more gold.'],
  setup(game): void {
    game.on(GameEvents.CheckRerollCost, ValuePriority.Pre, (event) => {
      event.value = 0;
    });
    game.on(GameEvents.CheckCardPrice, ValuePriority.Additive, (event) => {
      event.value += PRICE_INCREASE;
    });
  },
});
