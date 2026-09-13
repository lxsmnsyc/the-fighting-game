import type { GameMode } from '../mode';
import beastmaster from './beastmaster';
import chaos from './chaos';
import gambler from './gambler';
import hardcore from './hardcore';
import type GameModeId from './ids';
import standard from './standard';

const GAME_MODES: GameMode[] = [standard, hardcore, chaos, beastmaster, gambler];

const GAME_MODES_BY_ID = new Map(GAME_MODES.map((mode) => [mode.id, mode]));

export function getGameMode(id: GameModeId): GameMode {
  const mode = GAME_MODES_BY_ID.get(id);
  if (!mode) {
    throw new Error(`Unknown game mode: ${id}`);
  }
  return mode;
}

export default GAME_MODES;
