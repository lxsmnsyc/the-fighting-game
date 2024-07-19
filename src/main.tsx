import { setupGame } from './core';
import snowball from './core/abilities/snowball';
import normalAttack from './core/effects/normal-attack';
import { Game, Player } from './core/game';

const playerA = new Player('Player A');
const playerB = new Player('Player B');
const game = new Game(playerA, playerB);

playerA.ability = { source: snowball, level: 5 };
playerB.ability = { source: snowball, level: 5 };

playerA.effects = [{ source: normalAttack, level: 5 }];
playerB.effects = [{ source: normalAttack, level: 5 }];

playerA.game = game;
playerB.game = game;

console.log('Test :)');

setupGame(game);
game.prepare();
