import { createGameMode } from '../mode';
import GameModeId from './ids';

export default createGameMode({
  id: GameModeId.Standard,
  name: 'Standard',
  rules: ['The rules as they are.'],
  setup(): void {
    // no-op
  },
});
