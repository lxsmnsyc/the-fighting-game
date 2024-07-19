import { setupGame } from './core';
import snowball from './core/abilities/snowball';
import card001 from './core/effects/tier-1/periodic buff/card-002';
import card002 from './core/effects/tier-1/periodic buff/card-006';
import { Game, Player } from './core/game';

const playerA = new Player('Player A');
const playerB = new Player('Player B');
const game = new Game(playerA, playerB);

playerA.AbilityCard = { source: snowball, level: 5 };
playerB.AbilityCard = { source: snowball, level: 5 };

playerA.effects = [
  { source: card001, level: 5 },
  { source: card002, level: 5 },
];
playerB.effects = [
  { source: card001, level: 5 },
  { source: card002, level: 5 },
];

playerA.game = game;
playerB.game = game;

console.log('Test :)');

setupGame(game);
game.prepare();
