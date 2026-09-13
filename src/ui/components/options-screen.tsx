import { For, type JSX } from 'solid-js';
import options, { type Options, setOption } from '../options';
import Button from './button';
import MenuFrame from './menu-frame';

interface OptionRow {
  key: keyof Options;
  label: string;
  description: string;
}

const OPTION_ROWS: OptionRow[] = [
  {
    key: 'shake',
    label: 'Shake',
    description: 'Cards and abilities shake when they trigger.',
  },
  {
    key: 'projectiles',
    label: 'Projectiles',
    description: 'Damage and energy fly across the screen in battle.',
  },
  {
    key: 'countdown',
    label: 'Battle countdown',
    description: 'Battles count down 3 seconds before they begin. Applies from the next run.',
  },
];

export default function OptionsScreen(props: { onBack: () => void }): JSX.Element {
  return (
    <MenuFrame>
      <h1 class="text-4xl font-black">Options</h1>
      <div class="flex w-full max-w-xl flex-col gap-3">
        <For each={OPTION_ROWS}>
          {(row) => (
            <button
              type="button"
              role="switch"
              aria-checked={options[row.key]}
              class="flex items-center justify-between gap-4 rounded-xl bg-zinc-900 p-4 text-left ring-1 ring-zinc-800 transition hover:ring-zinc-600"
              onClick={() => {
                setOption(row.key, !options[row.key]);
              }}
            >
              <span class="flex flex-col gap-1">
                <span class="font-bold">{row.label}</span>
                <span class="text-sm text-zinc-400">{row.description}</span>
              </span>
              <span
                class={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${options[row.key] ? 'bg-emerald-600' : 'bg-zinc-700'}`}
              >
                <span
                  class={`size-5 rounded-full bg-white transition-transform ${options[row.key] ? 'translate-x-5' : ''}`}
                />
              </span>
            </button>
          )}
        </For>
      </div>
      <Button
        onClick={() => {
          props.onBack();
        }}
      >
        Back
      </Button>
    </MenuFrame>
  );
}
