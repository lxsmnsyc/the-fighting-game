import { type JSX, Show, createSignal } from 'solid-js';
import type Game from '../game/game';
import createGame from '../game/setup';
import GameView from './components/game-view';

const COUNTDOWN = 3000;

function startGame(seed?: string): Game {
  const game = createGame(seed, { battle: { realtime: true, countdown: COUNTDOWN } });
  game.player.name = 'You';
  game.start();
  return game;
}

export default function App(): JSX.Element {
  // `?seed=` replays a run, and keeps the browser tests deterministic
  const seed = new URLSearchParams(location.search).get('seed') ?? undefined;
  const [game, setGame] = createSignal(startGame(seed));

  return (
    <Show when={game()} keyed>
      {(current) => (
        <GameView
          game={current}
          onRestart={() => {
            setGame(startGame());
          }}
        />
      )}
    </Show>
  );
}
