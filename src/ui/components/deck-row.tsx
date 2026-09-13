import { type Accessor, For, type JSX, Show } from 'solid-js';
import type { CardInstance } from '../../game/card';
import { getSellPrice } from '../../game/economy';
import type Game from '../../game/game';
import CardRow from './card-row';
import CardView from './card-view';

interface DeckRowProps {
  game: Game;
  version: Accessor<number>;
  /**
   * Makes each card sell on click, showing what it sells for.
   */
  onSell?: (card: CardInstance) => void;
}

export default function DeckRow(props: DeckRowProps): JSX.Element {
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
          {(card) => {
            const { onSell } = props;
            return (
              <CardView
                card={card.source}
                instance={card}
                placement="bottom"
                sellPrice={
                  onSell ? getSellPrice(props.game.checkCardPrice(card.source)) : undefined
                }
                onClick={
                  onSell
                    ? (): void => {
                        onSell(card);
                      }
                    : undefined
                }
              />
            );
          }}
        </For>
      </Show>
    </CardRow>
  );
}
