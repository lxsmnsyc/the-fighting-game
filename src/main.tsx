import {
  CardInstance,
  DEFAULT_PRINT_SPAWN_CHANCE_MULTIPLIER,
} from './core/card';
import dagger from './core/effects/starter/dagger';
import { Game } from './core/game';
import { Player } from './core/player';
import { Round, Unit } from './core/round';
import { Edition } from './core/types';

const game = new Game('ALEXIS', 'Alexis');

const enemy = new Player(game.rng.int32(), 'Enemy');

game.player.cards = [
  new CardInstance(game.player, dagger, {
    edition: Edition.Common,
    print: DEFAULT_PRINT_SPAWN_CHANCE_MULTIPLIER,
    rng: game.player.rng,
  }),
];

enemy.cards = [
  new CardInstance(enemy, dagger, {
    edition: Edition.Common,
    print: DEFAULT_PRINT_SPAWN_CHANCE_MULTIPLIER,
    rng: enemy.rng,
  }),
];

for (const card of game.player.cards) {
  card.source.load({ game, card });
}
for (const card of enemy.cards) {
  card.source.load({ game, card });
}

game.nextRound(
  new Round(game.rng.int32(), new Unit(game.player), new Unit(enemy)),
);
