import { type JSX, Match, Show, Switch, createSignal, onCleanup } from 'solid-js';
import type Battle from '../../battle/core';
import { EventPriority } from '../../core/event-emitter';
import { GameEvents } from '../../game/events';
import type Game from '../../game/game';
import { type BattleResult, GameStage, RunResult } from '../../game/types';
import { createGameVersion } from '../state';
import BattleScreen from './battle-screen';
import DraftScreen from './draft-screen';
import ShopScreen from './shop-screen';

interface GameViewProps {
  game: Game;
  onRestart: () => void;
}

function GameOver(props: GameViewProps): JSX.Element {
  return (
    <div class="absolute inset-0 z-40 grid place-items-center bg-zinc-950/80 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-4 rounded-2xl bg-zinc-900 p-8 ring-1 ring-zinc-700">
        <h1 class="text-4xl font-black">Run over</h1>
        <p class="text-zinc-400">
          Reached phase {props.game.getPhase()}, round {props.game.getPhaseRound()}.
        </p>
        <button
          type="button"
          class="rounded-lg bg-emerald-600 px-5 py-2 font-semibold transition hover:bg-emerald-500"
          onClick={() => {
            props.onRestart();
          }}
        >
          New run
        </button>
      </div>
    </div>
  );
}

/**
 * The three rows of the game: the top offers or cards, the middle bar
 * and the player's cards. The draft, the shop and the battle each fill
 * them their own way.
 */
export default function GameView(props: GameViewProps): JSX.Element {
  const version = createGameVersion(props.game);
  const [lastResult, setLastResult] = createSignal<BattleResult>();

  const listener = props.game.on(GameEvents.EndBattle, EventPriority.Post, (event) => {
    setLastResult(event.result);
  });
  onCleanup(() => {
    listener.stop();
  });

  const battle = (): Battle | undefined => {
    version();
    return props.game.stage === GameStage.Battle ? props.game.battle : undefined;
  };
  const drafting = (): boolean => {
    version();
    return props.game.stage === GameStage.Draft;
  };
  const ended = (): boolean => {
    version();
    return props.game.result !== RunResult.Ongoing;
  };

  return (
    <main class="relative grid h-dvh select-none grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-hidden">
      <Switch fallback={<ShopScreen game={props.game} version={version} lastResult={lastResult} />}>
        <Match when={battle()} keyed>
          {(current) => <BattleScreen game={props.game} battle={current} />}
        </Match>
        <Match when={drafting()}>
          <DraftScreen game={props.game} version={version} />
        </Match>
      </Switch>
      <Show when={ended()}>
        <GameOver game={props.game} onRestart={props.onRestart} />
      </Show>
    </main>
  );
}
