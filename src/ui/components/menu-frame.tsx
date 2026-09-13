import type { JSX } from 'solid-js';

/**
 * A scrollable page with its content centered, for the screens outside
 * a run.
 */
export default function MenuFrame(props: { children: JSX.Element }): JSX.Element {
  return (
    <main class="h-dvh overflow-y-auto px-4">
      <div class="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-8 py-10">
        {props.children}
      </div>
    </main>
  );
}
