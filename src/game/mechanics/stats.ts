import { ValuePriority } from '../../battle/types';
import { GameEvents } from '../events';
import type Game from '../game';

export default function setupStatMechanics(game: Game): void {
  game.on(GameEvents.SetStat, ValuePriority.Exact, (event) => {
    game.player.stats[event.stat] = Math.max(0, event.value);
  });

  game.on(GameEvents.AddStat, ValuePriority.Exact, (event) => {
    game.setStat(event.stat, game.player.stats[event.stat] + event.value);
  });

  game.on(GameEvents.RemoveStat, ValuePriority.Exact, (event) => {
    game.setStat(event.stat, game.player.stats[event.stat] - event.value);
  });
}
