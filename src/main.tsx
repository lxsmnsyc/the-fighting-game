import STARTER_CARDS from './cards/starter';
import Boss from './game/boss';
import { CardInstance } from './game/card';
import Game from './game/game';
import createRound from './game/round';
import setupGame from './game/setup';

const game = new Game('ALEXIS');
setupGame(game);
game.player.name = 'Alexis';

const enemy = new Boss(game.rng.boss.int32());
enemy.name = 'Enemy';

const [armor, attack, corrosion, critical] = STARTER_CARDS;

game.player.deck.push(
  new CardInstance(game.player, attack),
  new CardInstance(game.player, critical),
  new CardInstance(game.player, corrosion),
);

enemy.deck.push(new CardInstance(enemy, attack), new CardInstance(enemy, armor));

game.setup();

const battle = createRound(game, [enemy], { realtime: true, debug: true });
game.startRound(battle);
battle.start();
