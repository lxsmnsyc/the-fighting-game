import { type Accessor, For, type JSX, Show } from 'solid-js';
import type { CardInstance } from '../../game/card';
import type Game from '../../game/game';
import CardRow from './card-row';
import CardView from './card-view';

export default function DeckRow(props: { game: Game; version: Accessor<number> }): JSX.Element {
  const deck = (): CardInstance[] => {
    props.version();
    return [...props.game.player.deck];
  };

  return (
    <CardRow>
      <Show
        when={deck().length > 0}
        fallback={<p class="text-sm text-zinc-500">Buy cards from the shop to build your deck.</p>}
      >
        <For each={deck()}>
          {(card) => <CardView card={card.source} instance={card} placement="bottom" />}
        </For>
      </Show>
    </CardRow>
  );
}
