import { type JSX, Match, Show, Switch, createSignal, onCleanup } from 'solid-js';
import type Battle from '../../battle/core';
import { EventPriority } from '../../core/event-emitter';
import { GameEvents } from '../../game/events';
import type Game from '../../game/game';
import { getGameMode } from '../../game/modes';
import type { BattleSummary } from '../../game/summary';
import { type BattleResult, GameStage, RunResult } from '../../game/types';
import { createGameVersion } from '../state';
import BattleScreen from './battle-screen';
import BattleSummaryPanel from './battle-summary';
import Button from './button';
import DraftScreen from './draft-screen';
import ShopScreen from './shop-screen';

interface GameViewProps {
  game: Game;
  /**
   * Starts another run in the same mode, with `seed` or a random one.
   */
  onRestart: (seed?: string) => void;
  onMenu: () => void;
}

function GameOver(props: GameViewProps): JSX.Element {
  return (
    <div class="absolute inset-0 z-40 grid place-items-center bg-zinc-950/80 px-4 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-4 rounded-2xl bg-zinc-900 p-8 text-center ring-1 ring-zinc-700">
        <h1 class="text-4xl font-black">Run over</h1>
        <p class="text-zinc-400">
          Reached phase {props.game.getPhase()}, round {props.game.getPhaseRound()} in{' '}
          {getGameMode(props.game.mode).name}.
        </p>
        <p class="text-sm text-zinc-500">
          Seed{' '}
          <code
            data-testid="run-seed"
            class="select-all break-all rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300"
          >
            {props.game.seed}
          </code>
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              props.onRestart();
            }}
          >
            New run
          </Button>
          <Button
            onClick={() => {
              props.onRestart(props.game.seed);
            }}
          >
            Retry seed
          </Button>
          <Button
            onClick={() => {
              props.onMenu();
            }}
          >
            Main menu
          </Button>
        </div>
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

  // The battle stays on screen behind its summary
  const battle = (): Battle | undefined => {
    version();
    const { stage } = props.game;
    return stage === GameStage.Battle || stage === GameStage.Summary
      ? props.game.battle
      : undefined;
  };
  const summary = (): BattleSummary | undefined => {
    version();
    return props.game.stage === GameStage.Summary ? props.game.summary : undefined;
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
      <Show when={summary()} keyed>
        {(current) => <BattleSummaryPanel game={props.game} summary={current} />}
      </Show>
      <Show when={ended()}>
        <GameOver game={props.game} onRestart={props.onRestart} onMenu={props.onMenu} />
      </Show>
    </main>
  );
}
