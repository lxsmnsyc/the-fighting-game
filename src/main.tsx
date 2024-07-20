import { setupGame } from './core';
import simpleDamage from './core/abilities/simple-damage';
import card106 from './core/effects/add-stack-periodic/card-106';
import card002 from './core/effects/add-stat-periodic/card-002';

import { Game, Player } from './core/game';

const playerA = new Player('Player A');
const playerB = new Player('Player B');
const game = new Game(playerA, playerB);

playerA.AbilityCard = { source: simpleDamage, level: 5 };
playerB.AbilityCard = { source: simpleDamage, level: 5 };

playerA.effects = [
  { source: card106, level: 5 },
  { source: card002, level: 5 },
];
playerB.effects = [
  { source: card106, level: 5 },
  { source: card002, level: 5 },
];

playerA.game = game;
playerB.game = game;

console.log('Test :)');

setupGame(game);
game.prepare();
