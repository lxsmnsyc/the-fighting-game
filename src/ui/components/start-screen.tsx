import { For, type JSX, Show, createSignal } from 'solid-js';
import GAME_MODES from '../../game/modes';
import GameModeId from '../../game/modes/ids';
import Button from './button';
import MenuFrame from './menu-frame';

/**
 * What a new run starts with.
 */
export interface RunSetup {
  mode: GameModeId;
  /**
   * Unset for a random seed.
   */
  seed?: string;
}

interface StartScreenProps {
  onBack: () => void;
  onStart: (setup: RunSetup) => void;
}

function getChoiceClass(selected: boolean): string {
  return selected
    ? 'bg-zinc-800 ring-emerald-500'
    : 'bg-zinc-900 ring-zinc-800 hover:ring-zinc-600';
}

/**
 * Sets up a run: its game mode, and a random seed or the player's own.
 */
export default function StartScreen(props: StartScreenProps): JSX.Element {
  const [mode, setMode] = createSignal<GameModeId>(GameModeId.Standard);
  const [seeded, setSeeded] = createSignal(false);
  const [seed, setSeed] = createSignal('');

  const ready = (): boolean => !seeded() || seed().trim() !== '';

  const start = (): void => {
    if (ready()) {
      props.onStart({ mode: mode(), seed: seeded() ? seed().trim() : undefined });
    }
  };

  return (
    <MenuFrame>
      <h1 class="text-4xl font-black">Start a run</h1>
      <form
        class="flex w-full flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          start();
        }}
      >
        <fieldset class="flex flex-col">
          <legend class="mb-3 text-xs uppercase tracking-wide text-zinc-400">Game mode</legend>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <For each={GAME_MODES}>
              {(current) => (
                <button
                  type="button"
                  data-testid="game-mode"
                  aria-pressed={mode() === current.id}
                  class={`flex flex-col gap-1 rounded-xl p-4 text-left ring-2 transition ${getChoiceClass(mode() === current.id)}`}
                  onClick={() => {
                    setMode(current.id);
                  }}
                >
                  <span class="text-lg font-bold">{current.name}</span>
                  <For each={current.rules}>
                    {(rule) => <span class="text-sm text-zinc-400">{rule}</span>}
                  </For>
                </button>
              )}
            </For>
          </div>
        </fieldset>

        <fieldset class="flex flex-col gap-3">
          <legend class="mb-3 text-xs uppercase tracking-wide text-zinc-400">Seed</legend>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={!seeded()}
              class={`rounded-xl p-3 font-semibold ring-2 transition ${getChoiceClass(!seeded())}`}
              onClick={() => {
                setSeeded(false);
              }}
            >
              Random seed
            </button>
            <button
              type="button"
              aria-pressed={seeded()}
              class={`rounded-xl p-3 font-semibold ring-2 transition ${getChoiceClass(seeded())}`}
              onClick={() => {
                setSeeded(true);
              }}
            >
              Seeded run
            </button>
          </div>
          <Show when={seeded()}>
            <input
              type="text"
              aria-label="Seed"
              placeholder="Enter a seed"
              value={seed()}
              class="rounded-lg bg-zinc-900 px-4 py-2 outline-none ring-1 ring-zinc-700 focus:ring-emerald-500"
              onInput={(event) => {
                setSeed(event.currentTarget.value);
              }}
            />
          </Show>
          <p class="text-sm text-zinc-500">
            {seeded()
              ? 'The same seed and mode always deal the same shops, drafts and opponents.'
              : 'The run rolls a new seed.'}
          </p>
        </fieldset>

        <div class="flex justify-between gap-3">
          <Button
            onClick={() => {
              props.onBack();
            }}
          >
            Back
          </Button>
          <Button type="submit" variant="primary" disabled={!ready()}>
            Begin run
          </Button>
        </div>
      </form>
    </MenuFrame>
  );
}
