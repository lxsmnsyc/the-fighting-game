import Game, { type GameOptions } from './game';
import setupAbilityMechanics from './mechanics/ability';
import setupBattleMechanics from './mechanics/battle';
import setupRunMechanics from './mechanics/run';
import setupShopMechanics from './mechanics/shop';
import setupStatMechanics from './mechanics/stats';
import { getGameMode } from './modes';
import { PlayerStat } from './types';

/**
 * A random seed for a new run.
 */
export function generateSeed(): string {
  return crypto.randomUUID();
}

/**
 * A run with every mechanic and its mode wired. Call `start` to open the
 * first round.
 */
export default function createGame(seed = generateSeed(), options?: GameOptions): Game {
  const game = new Game(seed, options);

  setupStatMechanics(game);
  setupRunMechanics(game);
  setupAbilityMechanics(game);
  setupShopMechanics(game);
  setupBattleMechanics(game);

  getGameMode(game.mode).setup(game);

  // The mode may change how many lives the run starts with
  game.setStat(PlayerStat.Life, game.checkMaxLife());

  return game;
}
