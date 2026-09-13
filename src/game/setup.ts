import Game, { type GameOptions } from './game';
import setupBattleMechanics from './mechanics/battle';
import setupRunMechanics from './mechanics/run';
import setupShopMechanics from './mechanics/shop';
import setupStatMechanics from './mechanics/stats';

/**
 * A random seed for a new run.
 */
export function generateSeed(): string {
  return crypto.randomUUID();
}

/**
 * A run with every mechanic wired. Call `start` to open the first shop.
 */
export default function createGame(seed = generateSeed(), options?: GameOptions): Game {
  const game = new Game(seed, options);

  setupStatMechanics(game);
  setupRunMechanics(game);
  setupShopMechanics(game);
  setupBattleMechanics(game);

  return game;
}
