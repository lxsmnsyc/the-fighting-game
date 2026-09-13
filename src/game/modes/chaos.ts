import { ValuePriority } from '../../battle/types';
import { GameEvents } from '../events';
import { createGameMode } from '../mode';
import GameModeId from './ids';

const PRINT_CHANCE_MULTIPLIER = 3;

export default createGameMode({
  id: GameModeId.Chaos,
  name: 'Chaos',
  rules: ['Prints are 3 times as likely.', 'Opponents get more prints too.'],
  setup(game): void {
    game.on(GameEvents.CheckPrintChance, ValuePriority.Multiplicative, (event) => {
      event.value *= PRINT_CHANCE_MULTIPLIER;
    });
  },
});
