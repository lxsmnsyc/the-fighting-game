import createGame from './game/setup';

const game = createGame(undefined, { battle: { realtime: true, debug: true } });
game.player.name = 'Player';
game.start();

// Buy what the first shop offers, then fight
for (let slot = 0; slot < game.shop.offers.length; slot++) {
  game.buyCard(slot);
}
game.startBattle();
