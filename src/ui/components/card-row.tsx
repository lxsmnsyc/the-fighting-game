import type { JSX, ParentProps } from 'solid-js';

/**
 * Cards laid out in one straight, slightly overlapping row, like a hand
 * spread on a table.
 *
 * The row never grows past its width. Every card but the last may
 * shrink its slot while the card itself keeps its size, so the more
 * cards there are, the more they overlap.
 */
export default function CardRow(props: ParentProps): JSX.Element {
  return (
    <div class="flex h-full w-full min-w-0 items-center justify-center px-8 *:min-w-0 *:shrink [&>*:last-child]:shrink-0 [&>*+*]:-ml-2">
      {props.children}
    </div>
  );
}
