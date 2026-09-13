import { ValuePriority } from '../../battle/types';
import { GameEvents } from '../events';
import { createGameMode } from '../mode';
import GameModeId from './ids';

const MAX_LIFE = 1;

export default createGameMode({
  id: GameModeId.Hardcore,
  name: 'Hardcore',
  rules: ['You start with 1 life. The first loss ends the run.'],
  setup(game): void {
    game.on(GameEvents.CheckMaxLife, ValuePriority.Pre, (event) => {
      event.value = MAX_LIFE;
    });
  },
});
