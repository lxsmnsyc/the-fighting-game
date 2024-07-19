import { setupGame } from './core';
import snowball from './core/abilities/snowball';
import brilliance from './core/effects/brilliance';
import momentum from './core/effects/momentum';
import { Game, Player } from './core/game';

const playerA = new Player('Player A');
const playerB = new Player('Player B');
const game = new Game(playerA, playerB);

playerA.AbilityCard = { source: snowball, level: 5 };
playerB.AbilityCard = { source: snowball, level: 5 };

playerA.effects = [
  { source: brilliance, level: 5 },
  { source: momentum, level: 5 },
];
playerB.effects = [
  { source: brilliance, level: 5 },
  { source: momentum, level: 5 },
];

playerA.game = game;
playerB.game = game;

console.log('Test :)');

setupGame(game);
game.prepare();
