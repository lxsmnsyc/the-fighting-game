import type { JSX, ParentProps } from 'solid-js';

/**
 * Cards laid out in one straight, slightly overlapping row, like a hand
 * spread on a table.
 */
export default function CardRow(props: ParentProps): JSX.Element {
  return (
    <div class="flex h-full items-center justify-center px-8 [&>*+*]:-ml-2">{props.children}</div>
  );
}
