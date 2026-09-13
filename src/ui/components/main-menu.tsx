import type { JSX } from 'solid-js';
import Button from './button';
import MenuFrame from './menu-frame';

interface MainMenuProps {
  onStart: () => void;
  onOptions: () => void;
}

export default function MainMenu(props: MainMenuProps): JSX.Element {
  return (
    <MenuFrame>
      <div class="flex flex-col items-center gap-3 text-center">
        <h1 class="text-5xl font-black tracking-tight sm:text-6xl">The Fighting Game</h1>
        <p class="text-zinc-400">
          Build a deck, pick your abilities, and fight until your lives run out.
        </p>
      </div>
      <div class="flex w-full max-w-xs flex-col gap-3">
        <Button
          variant="primary"
          class="py-3 text-lg"
          onClick={() => {
            props.onStart();
          }}
        >
          Start
        </Button>
        <Button
          class="py-3 text-lg"
          onClick={() => {
            props.onOptions();
          }}
        >
          Options
        </Button>
      </div>
    </MenuFrame>
  );
}
