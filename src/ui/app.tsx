import { type JSX, Match, Switch, createSignal } from 'solid-js';
import type Game from '../game/game';
import GameModeId from '../game/modes/ids';
import createGame from '../game/setup';
import GameView from './components/game-view';
import MainMenu from './components/main-menu';
import OptionsScreen from './components/options-screen';
import StartScreen, { type RunSetup } from './components/start-screen';
import options from './options';

const COUNTDOWN = 3000;

type Screen =
  | { kind: 'menu' }
  | { kind: 'start' }
  | { kind: 'options' }
  | { kind: 'run'; game: Game };

function startGame(setup: RunSetup): Game {
  const game = createGame(setup.seed, {
    mode: setup.mode,
    battle: { realtime: true, countdown: options.countdown ? COUNTDOWN : 0 },
  });
  game.player.name = 'You';
  game.start();
  return game;
}

// `?seed=` skips the menu and replays a Standard run, which keeps the
// browser tests deterministic
function getInitialScreen(): Screen {
  const seed = new URLSearchParams(location.search).get('seed');
  if (seed == null) {
    return { kind: 'menu' };
  }
  return { kind: 'run', game: startGame({ mode: GameModeId.Standard, seed }) };
}

export default function App(): JSX.Element {
  const [screen, setScreen] = createSignal<Screen>(getInitialScreen());

  const run = (): Game | undefined => {
    const current = screen();
    return current.kind === 'run' ? current.game : undefined;
  };
  const openMenu = (): void => {
    setScreen({ kind: 'menu' });
  };

  return (
    <Switch>
      <Match when={screen().kind === 'menu'}>
        <MainMenu
          onStart={() => {
            setScreen({ kind: 'start' });
          }}
          onOptions={() => {
            setScreen({ kind: 'options' });
          }}
        />
      </Match>
      <Match when={screen().kind === 'start'}>
        <StartScreen
          onBack={openMenu}
          onStart={(setup) => {
            setScreen({ kind: 'run', game: startGame(setup) });
          }}
        />
      </Match>
      <Match when={screen().kind === 'options'}>
        <OptionsScreen onBack={openMenu} />
      </Match>
      <Match when={run()} keyed>
        {(game) => (
          <GameView
            game={game}
            onRestart={(seed) => {
              setScreen({ kind: 'run', game: startGame({ mode: game.mode, seed }) });
            }}
            onMenu={openMenu}
          />
        )}
      </Match>
    </Switch>
  );
}
