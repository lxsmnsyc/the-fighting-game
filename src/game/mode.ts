import type Game from './game';
import type GameModeId from './modes/ids';

/**
 * A set of rule changes a run plays by. A mode changes rules the same way
 * cards do: by listening to the game's events.
 */
export interface GameMode {
  /**
   * Fixed for good. See `GameModeId`.
   */
  id: GameModeId;

  name: string;

  /**
   * One sentence per rule the mode changes.
   */
  rules: string[];

  /**
   * Registers the mode's listeners. Called once, after the base rules.
   */
  setup(game: Game): void;
}

/**
 * Types a game mode literal.
 */
export function createGameMode(mode: GameMode): GameMode {
  return mode;
}
