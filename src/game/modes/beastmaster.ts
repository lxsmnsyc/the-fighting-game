import { ValuePriority } from '../../battle/types';
import { GameEvents } from '../events';
import { createGameMode } from '../mode';
import GameModeId from './ids';

const ABILITY_INTERVAL = 2;

export default createGameMode({
  id: GameModeId.Beastmaster,
  name: 'Beastmaster',
  rules: [
    'You pick a new ability every 2 phases instead of every 8.',
    'Bosses bring as many abilities as you.',
  ],
  setup(game): void {
    game.on(GameEvents.CheckAbilityInterval, ValuePriority.Pre, (event) => {
      event.value = ABILITY_INTERVAL;
    });
  },
});
